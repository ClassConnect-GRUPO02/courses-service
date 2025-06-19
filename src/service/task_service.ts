import { Task } from '../models/task';
import { AuthorizationError, BadRequestError, CourseNotFoundError, InternalServerError, NotFoundError } from '../models/errors';
import * as database from '../database/course_db';
import * as databaseTask from '../database/task_db';
import * as databaseInstructor from '../database/instructor_db';
import { generateAIGrading, generateAIResume } from '../lib/ai';
import { StudentAnswer, TaskSubmission } from '@prisma/client';

export const addTaskToCourse = async (courseId: string, task: Task, instructorId: string): Promise<Task> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  return await databaseTask.addTaskToCourse(courseId, task, instructorId);
}

export const updateTask = async (courseId: string, taskId: string, task: Partial<Task>, instructorId: string): Promise<Task> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const updatedTask = await databaseTask.updateTask(courseId, taskId, task, instructorId);
  if (!updatedTask) {
    throw new Error(`Task with ID ${taskId} not found in course ${courseId}`);
  }

  return updatedTask;
}

export const removeTask = async (courseId: string, taskId: string, instructorId: string): Promise<void> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }
  
  const instructorInCourse = await databaseInstructor.isInstructorInCourse(courseId, instructorId);
  if (!instructorInCourse) {
    throw new AuthorizationError(`Instructor with ID ${instructorId} is not authorized to delete tasks in course ${courseId}`);
  }

  const isDeleted = await databaseTask.deleteTask(taskId, instructorId);
  if (!isDeleted) {
    throw new Error(`Task with ID ${taskId} not found in course ${courseId}`);
  }
}

export const getTasks = async (courseId: string): Promise<Task[]> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  return await databaseTask.getTasksByCourseId(courseId);
}

export const getTaskById = async (taskId: string): Promise<Task> => {
  const task = await databaseTask.getTaskById(taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found.`);
  }

  return task;
}

// -------------------------------- COMPLETE TASKS (STUDENTS) -----------------------------
type AnswerInput = {
  question_id: string;
  answer_text: string;
};

// Starts an exam for a student by creating an empty submission
export const startExam = async (courseId: string, taskId: string, studentId: string) => {
  const task = await databaseTask.getTaskById(taskId);
  if (!task || task.course_id !== courseId) {
    throw new NotFoundError(taskId, "Task");
  }
  if (task.type !== 'examen') {
    throw new InternalServerError(`Task with ID ${taskId} is not an exam`);
  }
  const now = new Date();
  if (now > new Date(task.due_date)) {
    throw new BadRequestError(`No puedes iniciar el examen después de la fecha de entrega: ${task.due_date}`);
  }
  // Verifies if the student has already started this exam
  const existing = await databaseTask.getTaskSubmission(taskId, studentId);
  if (existing) {
    throw new BadRequestError('Ya has iniciado este examen');
  }
  // Creates empty submission
  const submission = await databaseTask.createEmptyTaskSubmission(taskId, studentId, now);
  return submission;
};


export const submitTask = async (courseId: string, taskId: string, studentId: string, answers: AnswerInput[], fileUrl: string) => {
  const task = await databaseTask.getTaskById(taskId);
  if (!task || task.course_id !== courseId) {
    throw new BadRequestError(`Tarea con ID ${taskId} no encontrada en el curso ${courseId}`);
  }

  const now = new Date();

  if (task.type === 'examen') {
    // Must exist a submission to submit answers
    const submission = await databaseTask.getTaskSubmissionStarted(taskId, studentId);
    if (!submission) {
      throw new BadRequestError(`No has iniciado el examen para la tarea con ID ${taskId}`);
    }
    // If the exam has a timer, check if the time limit is exceeded
    if (task.has_timer && task.time_limit_minutes && submission.started_at) {
      const elapsed = (now.getTime() - new Date(submission.started_at).getTime()) / 60000; // Time consumed
      if (elapsed > task.time_limit_minutes) { // Time consumed exceeds time limit
        if (!task.allow_late) {
          throw new BadRequestError('Tiempo límite excedido para este examen');
        }
      }
    }
    // Verifies if it is late compared to the due date
    const isLate = task.due_date && now > new Date(task.due_date) ? 'late' : 'submitted';
    if (task.allow_late === false && isLate === 'late') {
      throw new BadRequestError('La entrega tardía no está permitida para este examen');
    }
    // Updates submission with answers and updates status
    const updated = await databaseTask.updateTaskSubmissionWithAnswers(
      submission.id,
      answers,
      fileUrl,
      now,
      isLate
    );
    return {
      message: 'Examen entregado exitosamente',
      submittedAt: updated.submitted_at,
      status: updated.status,
    };
  } else {
    // Common task submission (not an exam). Creates a new submission directly
    const isLate = task.due_date && now > new Date(task.due_date) ? 'late' : 'submitted';
    if (task.allow_late === false && isLate === 'late') {
      throw new BadRequestError('La entrega tardía no está permitida para esta tarea');
    }
    const submission = await databaseTask.createTaskSubmission(taskId, studentId, answers, fileUrl, now, isLate);
    return {
      message: 'Tarea entregada exitosamente',
      submittedAt: submission.submitted_at,
      status: submission.status,
    };
  }
};

// -------------------------------- INSTRUCTORS ---------------------------
export const getTasksByInstructor = async (instructorId: string, page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;

  const [tasks, total] = await Promise.all([
    databaseTask.findTasksByInstructor(instructorId, skip, pageSize),
    databaseTask.countTasksByInstructor(instructorId),
  ]);

  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    data: tasks,
  };
};

// -------------------------------- GET TASKS BY STUDENT ID -----------------------------

// Retrieves all tasks assigned to a student across different courses
// and returns them as an array of Task objects.
export const getTasksByStudentId = async (studentId: string): Promise<Task[]> => {
  const tasks = await databaseTask.getTasksByStudentId(studentId);
  return tasks;
}


// -------------------------------- ADD FEEDBACK TO TASK -----------------------------
export const addFeedbackToTask = async (taskId: string, studentId: string, grade: number, feedback: string, instructorId: string) => {
  const submission = await databaseTask.getTaskSubmission(taskId, studentId);
  if (!submission) {
    throw new NotFoundError(taskId, "Task submission");
  }
  const task = await databaseTask.getTaskById(taskId);
  if (!task) {
    throw new NotFoundError(taskId, "Task");
  }
  const courseId = task.course_id;
  const isInstructor = await databaseInstructor.isInstructorInCourse(courseId, instructorId);
  if (!isInstructor) {
    throw new AuthorizationError(instructorId);
  }
  return await databaseTask.updateTaskSubmission(taskId, studentId, grade, feedback, instructorId);
}

export const gradeTaskWithAI = async (taskId: string, studentId: string) => {
  const submission = await databaseTask.getTaskSubmission(taskId, studentId) as (TaskSubmission & { answers: StudentAnswer[] }) | null;
  if (!submission) {
    throw new NotFoundError(taskId, "Task submission");
  }
  const task = await databaseTask.getTaskById(taskId);
  if (!task || !task.questions) {
    throw new NotFoundError(taskId, "Task");
  }

  // Assuming generateAIResume is a function that generates feedback using AI
  // Fetch answers for the submission from the database
  console.log("task questions:", task.questions);
  console.log("submission answers:", submission.answers);
  const formattedQuestions = task.questions.map(q => ({
    ...q,
    points: q.points === undefined ? null : q.points,
  }));
  const aiFeedback = await generateAIGrading(formattedQuestions, submission.answers);
  console.log("AI Feedback:", aiFeedback);

  return await databaseTask.updateTaskSubmission(taskId, studentId, aiFeedback.grade, aiFeedback.feedback, "AI-GENERATED", aiFeedback.revision);
}

export const getTaskSubmission = async (taskId: string, studentId: string) => {
  const submission = await databaseTask.getTaskSubmission(taskId, studentId);
  if (!submission) {
    throw new NotFoundError(taskId, "Task submission");
  }
  return submission;
}

export const getTaskSubmissions = async (courseId: string, instructorId: string, taskId: string) => {
  const isInstructor = await databaseInstructor.isInstructorInCourse(courseId, instructorId);
  if (!isInstructor) {
    throw new AuthorizationError(instructorId);
  }
  const submissions = await databaseTask.getTaskSubmissions(taskId);
  return submissions;
}

export const getGradedTaskSubmissions = async (taskId: string) => {
  const submissions = await databaseTask.getGradedTaskSubmissions(taskId);
  return submissions;
}

export const getFeedbackWithAI = async (taskSubmissionId: string, userId: string) => {
  const submission = await databaseTask.getTaskSubmissionById(taskSubmissionId);
  if (!submission) {
    throw new NotFoundError(taskSubmissionId, "Task submission");
  }
  const taskId = submission.task_id;
  const task = await databaseTask.getTaskById(taskId);
  if (!task) {
    throw new NotFoundError(taskId, "Task");
  }
  const courseId = task.course_id;
  const isInstructor = await databaseInstructor.isInstructorInCourse(courseId, userId);
  if (!isInstructor) {
    throw new AuthorizationError(userId);
  }
  const feedback = submission.feedback;
  if (!feedback) {
    throw new NotFoundError(taskSubmissionId, "Feedback for task submission");
  }
  return generateAIResume(feedback);
}

/**
 * Returns the remaining time for an exam timer in HH:MM:SS format.
 *
 * @param taskId - The ID of the task (exam).
 * @param studentId - The ID of the student who started the task.
 * @returns A string in HH:MM:SS format representing the remaining time.
 * @throws NotFoundError if the task or submission is not found.
 * @throws Error if the task has no timer configured.
 */
export const getTaskTimer = async (taskId: string, studentId: string) => {
  const task = await databaseTask.getTaskById(taskId);
  if (!task) {
    throw new NotFoundError(taskId, "Task");
  }

  const submission = await databaseTask.getTaskSubmissionStarted(taskId, studentId);
  if (!submission) {
    throw new NotFoundError(taskId, "Task submission");
  }

  if (!task.has_timer || !task.time_limit_minutes) {
    throw new Error("This task does not have a timer.");
  }

  const startedAt = new Date(submission.started_at);
  const now = new Date();
  const timeLimit = new Date(startedAt.getTime() + task.time_limit_minutes * 60000);
  const remainingMilliseconds = timeLimit.getTime() - now.getTime();

  const remainingSeconds = Math.max(0, Math.floor(remainingMilliseconds / 1000));
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const getTaskSubmissionsCount = async (taskId: string) => {
  const taskSubmissionsCount = await databaseTask.getTaskSubmissionsCount(taskId);
  return taskSubmissionsCount;
}
