import { Task } from '../models/task';
import { AuthorizationError, CourseNotFoundError, NotFoundError } from '../models/errors';
import * as database from '../database/course_db';
import * as databaseTask from '../database/task_db';
import * as databaseInstructor from '../database/instructor_db';
import { generateAIResume } from '../lib/ai';

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
    throw { status: 404, message: 'Tarea no encontrada en este curso' };
  }
  if (task.type !== 'examen') {
    throw { status: 400, message: 'La tarea no es un examen' };
  }

  const now = new Date();
  if (now > new Date(task.due_date)) {
    throw { status: 400, message: 'No puedes iniciar el examen después de la fecha de entrega' };
  }
  // Verifies if the student has already started this exam
  const existing = await databaseTask.getTaskSubmission(taskId, studentId);
  if (existing) {
    throw { status: 400, message: 'Ya has iniciado este examen' };
  }
  // Creates empty submission
  const submission = await databaseTask.createEmptyTaskSubmission(taskId, studentId, now);
  return submission;
};


export const submitTask = async (courseId: string, taskId: string, studentId: string, answers: AnswerInput[], fileUrl: string) => {
  const task = await databaseTask.getTaskById(taskId);
  if (!task || task.course_id !== courseId) {
    throw { status: 404, message: 'Tarea no encontrada en este curso' };
  }

  const now = new Date();

  if (task.type === 'examen') {
    // Must exist a submission to submit answers
    const submission = await databaseTask.getTaskSubmission(taskId, studentId);
    if (!submission) {
      throw { status: 400, message: 'Debes iniciar el examen antes de entregar' };
    }
    // If the exam has a timer, check if the time limit is exceeded
    if (task.has_timer && task.time_limit_minutes && submission.started_at) {
      const elapsed = (now.getTime() - new Date(submission.started_at).getTime()) / 60000; // Time consumed
      if (elapsed > task.time_limit_minutes) { // Time consumed exceeds time limit
        if (!task.allow_late) {
          throw { status: 400, message: 'Tiempo límite excedido para este examen' };
        }
      }
    }
    // Verifies if it is late compared to the due date
    const isLate = task.due_date && now > new Date(task.due_date) ? 'late' : 'submitted';
    if (task.allow_late === false && isLate === 'late') {
      throw { status: 400, message: 'La entrega tardía no está permitida para este examen' };
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
      throw { status: 400, message: 'La entrega tardía no está permitida para esta tarea' };
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
    throw new Error(`No submission found for task ID ${taskId}`);
  }
  const task = await databaseTask.getTaskById(taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }
  const courseId = task.course_id;
  const isInstructor = await databaseInstructor.isInstructorInCourse(courseId, instructorId);
  if (!isInstructor) {
    throw new AuthorizationError(instructorId);
  }
  return await databaseTask.updateTaskSubmission(taskId, studentId, grade, feedback, instructorId);
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
    throw new Error(`Instructor with ID ${instructorId} is not authorized to view submissions for course ID ${courseId}`);
  }
  const submissions = await databaseTask.getTaskSubmissions(taskId);
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

export const getTaskTimer = async (taskId: string, studentId: string) => {
  const task = await databaseTask.getTaskById(taskId);
  if (!task) {
    throw new NotFoundError(taskId, "Task");
  }
  const submission = await databaseTask.getTaskSubmission(taskId, studentId);
  if (!submission) {
    throw new NotFoundError(taskId, "Task submission");
  }
  if (!task.has_timer || !task.time_limit_minutes) {
    throw new Error("This task does not have a timer.");
  }
  
  const startedAt = new Date(submission.started_at);
  const now = new Date();
  const elapsedMinutes = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60));
  
  return Math.max(0, task.time_limit_minutes - elapsedMinutes)
}