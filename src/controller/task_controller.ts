import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import { Task } from '../models/task';
import { handleInvalidRequestError } from './course_controller';
import * as taskService from '../service/task_service';

// -------------------------- TASKS / EXAMS ---------------------------

export const addTaskToCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const taskData = req.body;
    const task = new Task(taskData);
    const createdTask = await taskService.addTaskToCourse(id, task);
    res.status(StatusCodes.CREATED).json({ data: createdTask });
    logger.info(`Task added to course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, taskId } = req.params;
    const taskData: Partial<Task> = req.body;
    const updatedTask = await taskService.updateTask(id, taskId, taskData);
    res.status(StatusCodes.OK).json({ data: updatedTask });
    logger.info(`Task with ID ${taskId} updated in course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, taskId } = req.params;
    if (!id || !taskId) {
      handleInvalidRequestError(res, 'Invalid course or task ID');
      return;
    }
    await taskService.removeTask(id, taskId);
    res.status(StatusCodes.NO_CONTENT).send();
    logger.info(`Task with ID ${taskId} deleted from course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const tasks = await taskService.getTasks(id);
    res.status(StatusCodes.OK).json({ data: tasks });
    logger.info(`Tasks retrieved for course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

export const getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, taskId } = req.params;
    const task = await taskService.getTaskById(id, taskId);
    res.status(StatusCodes.OK).json({ data: task });
    logger.info(`Task with ID ${taskId} retrieved from course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

// -------------------------- COMPLETE TASKS (STUDENTS) ---------------------------
export const submitTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, taskId } = req.params;
    const { student_id , answers, fileUrl } = req.body;
    const submission = await taskService.submitTask(id, taskId, student_id, answers, fileUrl);
    res.status(StatusCodes.CREATED).json({ data: submission });
    logger.info(`Task with ID ${taskId} submitted for course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

// -------------------------- GET TASKS BY STUDENT ID ---------------------------

// This endpoint retrieves all tasks assigned to a specific student
// It is assumed that the student ID is passed as a URL parameter
// Example: GET /tasks/students/:studentId
export const getTasksByStudentId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;
    const tasks = await taskService.getTasksByStudentId(studentId);
    res.status(StatusCodes.OK).json({ data: tasks });
    logger.info(`Tasks retrieved for student with ID ${studentId} successfully`);
  } catch (error) {
    next(error);
  }
}