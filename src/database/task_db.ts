import { v4 as uuidv4 } from 'uuid';
import { prisma } from './course_db';
import { Task } from '../models/task';
import { SubmissionStatus, TaskSubmission } from '@prisma/client';

export const addTaskToCourse = async (courseId: string, task: Task): Promise<Task> => {

  const newTask = await prisma.task.create({
    data: {
      id: uuidv4(),
      course_id: courseId,
      created_by: task.created_by,
      type: task.type,
      title: task.title,
      description: task.description,
      instructions: task.instructions,
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
}

export const updateTask = async (courseId: string, taskId: string, task: Partial<Task>): Promise<Task> => {
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!existingTask) {
    throw new Error(`Task with ID ${taskId} not found`);
  }


  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      id: existingTask.id,
      course_id: courseId,
      created_by: existingTask.created_by,
      type: task.type ?? existingTask.type,
      title: task.title ?? existingTask.title,
      description: task.description ?? existingTask.description,
      instructions: task.instructions ?? existingTask.instructions,
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
      created_at: existingTask.created_at,
      updated_at: new Date(),
      deleted_at: existingTask.deleted_at,
    },
  });

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
}

export const deleteTask = async (taskId: string): Promise<string> => {
  const deleted = await prisma.task.delete({
    where: { id: taskId },
  });

  return deleted.id;
}

export const getTasksByCourseId = async (courseId: string): Promise<Task[]> => {
  const tasks = await prisma.task.findMany({
    where: { course_id: courseId },
  });

  return tasks.map((task) => ({
    ...task,
    due_date: task.due_date.toISOString(),
    visible_from: task.visible_from ? task.visible_from.toISOString() : null,
    visible_until: task.visible_until ? task.visible_until.toISOString() : null,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
    deleted_at: task.deleted_at ? task.deleted_at.toISOString() : null,
  }));
}

export const getTaskById = async (courseId: string, taskId: string): Promise<Task | null> => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      course_id: courseId,
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
  };
}

export const createTaskSubmission = async (task_id: string, student_id: string, answers: string[], file_url: string, submitted_at: Date, status: SubmissionStatus): Promise<TaskSubmission> => {
  const newSubmission = await prisma.taskSubmission.create({
    data: {
      task_id,
      student_id,
      answers,
      file_url,
      submitted_at,
      status,
    },
  });

  return newSubmission;
}

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
    }
  });
};

export const updateTaskSubmission = async (
  taskId: string,
  studentId: string,
  grade: number,
  feedback: string
): Promise<TaskSubmission> => {
  return await prisma.taskSubmission.update({
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
};