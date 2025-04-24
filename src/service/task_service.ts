import { Task } from '../models/task';
import { CourseNotFoundError } from '../models/errors';
import * as database from '../database/database';

export const addTaskToCourse = async (courseId: string, task: Task): Promise<Task> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  return await database.addTaskToCourse(courseId, task);
}

export const updateTask = async (courseId: string, taskId: string, task: Partial<Task>): Promise<Task> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const updatedTask = await database.updateTask(courseId, taskId, task);
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

  const isDeleted = await database.deleteTask(taskId);
  if (!isDeleted) {
    throw new Error(`Task with ID ${taskId} not found in course ${courseId}`);
  }
}

export const getTasks = async (courseId: string): Promise<Task[]> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  return await database.getTasksByCourseId(courseId);
}

export const getTaskById = async (courseId: string, taskId: string): Promise<Task> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const task = await database.getTaskById(courseId, taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found in course ${courseId}`);
  }

  return task;
}