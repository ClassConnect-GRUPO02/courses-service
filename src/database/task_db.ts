import { v4 as uuidv4 } from 'uuid';
import { prisma } from './course_db';
import { Task  } from '../models/task';
import { SubmissionStatus, TaskSubmission } from '@prisma/client';
import { isTitularInCourse } from './instructor_db';

export const addTaskToCourse = async (courseId: string, task: Task, instructorId: string): Promise<Task> => {
  const taskId = uuidv4();

  const newTask = await prisma.task.create({
    data: {
      id: taskId,
      course_id: courseId,
      created_by: task.created_by,
      type: task.type,
      title: task.title,
      description: task.description,
      file_url: task.file_url ?? null,
      due_date: new Date(task.due_date),
      allow_late: task.allow_late,
      late_policy: task.late_policy,
      has_timer: task.has_timer,
      time_limit_minutes: task.time_limit_minutes ?? null,
      published: task.published,
      visible_from: task.visible_from ? new Date(task.visible_from) : null,
      visible_until: task.visible_until ? new Date(task.visible_until) : null,
      allow_file_upload: task.allow_file_upload,
      answer_format: task.answer_format,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    },
  });

  // Si el formato de respuesta es por preguntas, insertamos las preguntas
  if (task.answer_format === 'preguntas_respuestas' && Array.isArray(task.questions)) {
    await prisma.taskQuestion.createMany({
      data: task.questions.map((question) => ({
        id: uuidv4(),
        task_id: taskId,
        text: question.text,
      })),
    });
  }

  const isTitular = await isTitularInCourse(courseId, instructorId);
  if (!isTitular) {
    await prisma.courseActivityLog.create({
      data: {
        course_id: courseId,
        user_id: instructorId,
        action: "task_created",
        metadata: {
          task_id: newTask.id,
          title: newTask.title,
        }
      }
    });
  }

  return {
    ...newTask,
    id: newTask.id,
    due_date: newTask.due_date.toISOString(),
    visible_from: newTask.visible_from ? newTask.visible_from.toISOString() : null,
    visible_until: newTask.visible_until ? newTask.visible_until.toISOString() : null,
    created_at: newTask.created_at.toISOString(),
    updated_at: newTask.updated_at.toISOString(),
    deleted_at: newTask.deleted_at ? newTask.deleted_at.toISOString() : null,
  };
};

export const updateTask = async (
  courseId: string,
  taskId: string,
  task: Partial<Task>,
  instructorId: string
): Promise<Task> => {
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!existingTask) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      course_id: courseId,
      created_by: existingTask.created_by,
      type: task.type ?? existingTask.type,
      title: task.title ?? existingTask.title,
      description: task.description ?? existingTask.description,
      file_url: task.file_url ?? existingTask.file_url,
      due_date: task.due_date ? new Date(task.due_date) : existingTask.due_date,
      allow_late: task.allow_late ?? existingTask.allow_late,
      late_policy: task.late_policy ?? existingTask.late_policy,
      has_timer: task.has_timer ?? existingTask.has_timer,
      time_limit_minutes: task.time_limit_minutes ?? existingTask.time_limit_minutes,
      published: task.published ?? existingTask.published,
      visible_from: task.visible_from ? new Date(task.visible_from) : existingTask.visible_from,
      visible_until: task.visible_until ? new Date(task.visible_until) : existingTask.visible_until,
      allow_file_upload: task.allow_file_upload ?? existingTask.allow_file_upload,
      answer_format: task.answer_format ?? existingTask.answer_format,
      updated_at: new Date(),
    },
  });

  // Actualizamos preguntas si corresponde
  if (
    (task.answer_format === 'preguntas_respuestas' || existingTask.answer_format === 'preguntas_respuestas') &&
    Array.isArray(task.questions)
  ) {
    // 1. Eliminar preguntas anteriores
    await prisma.taskQuestion.deleteMany({ where: { task_id: taskId } });

    // 2. Insertar nuevas preguntas
    await prisma.taskQuestion.createMany({
      data: task.questions.map((question) => ({
        id: uuidv4(),
        task_id: taskId,
        text: question.text,
      })),
    });
  }

  const isTitular = await isTitularInCourse(courseId, instructorId);
  if (!isTitular) {
    await prisma.courseActivityLog.create({
      data: {
        course_id: courseId,
        user_id: instructorId,
        action: "task_updated",
        metadata: {
          task_id: updatedTask.id,
          title: updatedTask.title,
        }
      }
    });
  }

  return {
    ...updatedTask,
    id: updatedTask.id,
    due_date: updatedTask.due_date.toISOString(),
    visible_from: updatedTask.visible_from ? updatedTask.visible_from.toISOString() : null,
    visible_until: updatedTask.visible_until ? updatedTask.visible_until.toISOString() : null,
    created_at: updatedTask.created_at.toISOString(),
    updated_at: updatedTask.updated_at.toISOString(),
    deleted_at: updatedTask.deleted_at ? updatedTask.deleted_at.toISOString() : null,
  };
};


export const deleteTask = async (taskId: string, instructorId: string): Promise<string> => {
  const deleted = await prisma.task.delete({
    where: { id: taskId },
  });

  const isTitular = await isTitularInCourse(deleted.course_id, instructorId);
  if (!isTitular) {
    await prisma.courseActivityLog.create({
      data: {
        course_id: deleted.course_id,
        user_id: instructorId,
        action: "task_deleted",
        metadata: {
          task_id: deleted.id,
          title: deleted.title,
        }
      }
    });
  }

  return deleted.id;
}

export const getTasksByCourseId = async (courseId: string): Promise<Task[]> => {
  const tasks = await prisma.task.findMany({
    where: { course_id: courseId },
    include: {
      questions: true, // Explicitly include related questions
    },
  });

  return tasks.map((task) => ({
    ...task,
    due_date: task.due_date.toISOString(),
    visible_from: task.visible_from ? task.visible_from.toISOString() : null,
    visible_until: task.visible_until ? task.visible_until.toISOString() : null,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
    deleted_at: task.deleted_at ? task.deleted_at.toISOString() : null,
    questions: task.questions
      ? task.questions.map((question) => ({
          ...question
        }))
      : [],
  }));
}

export const getTaskById = async (taskId: string): Promise<Task | null> => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
    },
    include: {
      questions: true, // Explicitly include related questions
    },
  });

  if (!task) {
    return null;
  }

  return {
    ...task,
    due_date: task.due_date.toISOString(),
    visible_from: task.visible_from ? task.visible_from.toISOString() : null,
    visible_until: task.visible_until ? task.visible_until.toISOString() : null,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
    deleted_at: task.deleted_at ? task.deleted_at.toISOString() : null,
    questions: task.questions
      ? task.questions.map((question) => ({
          ...question,
        }))
      : [],
  };
}

export type AnswerInput = {
  question_id: string;
  answer_text: string;
};

// Creates empty task submission when a student starts an exam 
// (this is used when a student starts an exam)
export const createEmptyTaskSubmission = async (
  task_id: string,
  student_id: string,
  started_at: Date
) => {
  return await prisma.taskSubmission.create({
    data: {
      task_id,
      student_id,
      started_at,
      submitted_at: null,
      status: SubmissionStatus.started,
    },
  });
};

// Updates submission with answers and file URL and marks it as submitted or late
export const updateTaskSubmissionWithAnswers = async (
  submissionId: string,
  answers: AnswerInput[],
  file_url: string | null,
  submitted_at: Date,
  status: 'submitted' | 'late'
) => {
  // Deletes previous answers if any
  await prisma.studentAnswer.deleteMany({ where: { submission_id: submissionId } });
  // Adds new answers
  await prisma.studentAnswer.createMany({
    data: answers.map(a => ({
      submission_id: submissionId,
      question_id: a.question_id,
      answer_text: a.answer_text,
      selected_option_id: null,
    })),
  });
  // Updates the submission with the file URL and status
  return await prisma.taskSubmission.update({
    where: { id: submissionId },
    data: {
      submitted_at,
      status,
      file_url,
    },
  });
};

// Cretaes a new task submission with answers and file URL 
// (this is used when a student submits a task)
export const createTaskSubmission = async (
  task_id: string,
  student_id: string,
  answers: AnswerInput[],
  file_url: string | null,
  submitted_at: Date,
  status: SubmissionStatus
): Promise<TaskSubmission> => {
  const submissionId = uuidv4();

  // Crear la entrega
  await prisma.taskSubmission.create({
    data: {
      id: submissionId,
      task_id,
      student_id,
      started_at: submitted_at, // Uso la misma fecha para started_at que para submitted_at
      submitted_at,
      status,
      file_url,
    },
  });

  // Crear respuestas asociadas a esa entrega
  await prisma.studentAnswer.createMany({
    data: answers.map((a) => ({
      id: uuidv4(),
      submission_id: submissionId,
      question_id: a.question_id,
      answer_text: a.answer_text,
      selected_option_id: null, // ya que no usamos opción múltiple
    })),
  });

  // Devolver la submission recién creada
  const created = await prisma.taskSubmission.findUniqueOrThrow({
    where: { id: submissionId },
  });

  return created;
};

export const findTasksByInstructor = async (instructorId: string, skip: number, take: number) => {
  return prisma.task.findMany({
    where: {
      created_by: instructorId,
      deleted_at: null,
    },
    skip,
    take,
    orderBy: {
      due_date: 'asc',
    },
    select: {
      id: true,
      title: true,
      course: {
        select: {
          name: true,
        },
      },
      due_date: true,
      published: true,
      type: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });
};

export const countTasksByInstructor = async (instructorId: string) => {
  return prisma.task.count({
    where: {
      created_by: instructorId,
      deleted_at: null,
    },
  });
};

// Searches all published tasks in courses where the student is enrolled
export const getTasksByStudentId = async (studentId: string): Promise<Task[]> => {
  // Retrieves all course IDs where the student is enrolled
  const enrolledCoursesIds = await prisma.enrollment.findMany({
    where: {
      userId: studentId,
    },
    select: {
      courseId: true,
    },
  });

  const courseIds = enrolledCoursesIds.map((enrollment) => enrollment.courseId);

  // Gets all tasks where the course ID is in the list of enrolled courses
  // and the task is published
  const tasks = await prisma.task.findMany({
    where: {
      course_id: {
        in: courseIds, // Filters tasks by course IDs
      },
      published: true, // Only published tasks
    },
  });

  // Returns the tasks with formatted dates
  return tasks.map((task) => ({
    ...task,
    due_date: task.due_date.toISOString(),
    visible_from: task.visible_from ? task.visible_from.toISOString() : null,
    visible_until: task.visible_until ? task.visible_until.toISOString() : null,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
    deleted_at: task.deleted_at ? task.deleted_at.toISOString() : null,
  }));
};

export const getTaskSubmission = async (taskId: string, studentId: string): Promise<TaskSubmission | null> => {
  return await prisma.taskSubmission.findFirst({
    where: {
      task_id: taskId,
      student_id: studentId,
      status: SubmissionStatus.submitted || SubmissionStatus.late,
    },
    include: {
      answers: true,  // <- esto trae el array de respuestas
    },
  });
};

export const getTaskSubmissionStarted = async (taskId: string, studentId: string): Promise<TaskSubmission | null> => {
  return await prisma.taskSubmission.findFirst({
    where: {
      task_id: taskId,
      student_id: studentId,
      status: SubmissionStatus.started,
    },
    include: {
      answers: true,  // <- esto trae el array de respuestas
    },
  });
};

export const updateTaskSubmission = async (
  taskId: string,
  studentId: string,
  grade: number,
  feedback: string,
  instructorId: string
): Promise<TaskSubmission> => {
  const updated_task_submission = await prisma.taskSubmission.update({
    where: {
      task_id_student_id: {
        task_id: taskId,
        student_id: studentId,
      },
    },
    data: {
      grade,
      feedback,
      updated_at: new Date(),
    },
  });
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });
  const courseId = task?.course_id;
  if (!courseId) {
    throw new Error(`Task with ID ${taskId} not found`);
  }
  const isTitular = await isTitularInCourse(courseId, instructorId);
  if (!isTitular) {
    await prisma.courseActivityLog.create({
      data: {
        course_id: courseId,
        user_id: instructorId,
        action: "grade_task",
        metadata: {
          task_id: taskId,
          student_id: studentId,
          grade,
          feedback,
        }
      }
    });
  }

  return updated_task_submission;

};

export const getTaskSubmissions = async (taskId: string): Promise<TaskSubmission[]> => {
  return await prisma.taskSubmission.findMany({
    where: {
      task_id: taskId,
      status: SubmissionStatus.submitted || SubmissionStatus.late,
    },
    include: {
      answers: true,  // <- esto trae el array de respuestas
    },
  });
}

export const getTaskSubmissionById = async (submissionId: string): Promise<TaskSubmission | null> => {
  return await prisma.taskSubmission.findUnique({
    where: {
      id: submissionId,
    },
  });
}