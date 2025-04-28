import { Task } from '../models/task';
import { CourseNotFoundError } from '../models/errors';
import * as database from '../database/course_db';
import * as databaseTask from '../database/task_db';

export const addTaskToCourse = async (courseId: string, task: Task): Promise<Task> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  return await databaseTask.addTaskToCourse(courseId, task);
}

export const updateTask = async (courseId: string, taskId: string, task: Partial<Task>): Promise<Task> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const updatedTask = await databaseTask.updateTask(courseId, taskId, task);
  if (!updatedTask) {
    throw new Error(`Task with ID ${taskId} not found in course ${courseId}`);
  }

  return updatedTask;
}

export const removeTask = async (courseId: string, taskId: string): Promise<void> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const isDeleted = await databaseTask.deleteTask(taskId);
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

export const getTaskById = async (courseId: string, taskId: string): Promise<Task> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const task = await databaseTask.getTaskById(courseId, taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found in course ${courseId}`);
  }

  return task;
}

// -------------------------------- COMPLETE TASKS (STUDENTS) -----------------------------
export const submitTask = async (courseId: string, taskId: string, studentId: string, answers: string[], fileUrl: string) => {
  const task = await databaseTask.getTaskById(courseId, taskId);
  if (!task || task.course_id !== courseId) {
    throw { status: 404, message: 'Tarea no encontrada en este curso' };
  }

  const now = new Date();
  const isLate = task.due_date && now > new Date(task.due_date) ? 'late' : 'submitted';
  if (task.allow_late === false && isLate === 'late') {
    throw { status: 400, message: 'La entrega tardía no está permitida para esta tarea' };
  }
  

  const submission = await databaseTask.createTaskSubmission(taskId, studentId, answers, fileUrl, now, isLate);

  return {
    message: 'Entrega registrada exitosamente',
    submittedAt: submission.submitted_at,
    status: submission.status,
  };
}
