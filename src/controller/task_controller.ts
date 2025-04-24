import { Request, Response, NextFunction } from 'express';
import * as courseService from '../service/service';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import { Task } from '../models/task';
import { handleInvalidRequestError } from './course_controller';

// -------------------------- TASKS / EXAMS ---------------------------

export const addTaskToCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const taskData = req.body;
    const task = new Task(taskData);
    const createdTask = await courseService.addTaskToCourse(id, task);
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
    const updatedTask = await courseService.updateTask(id, taskId, taskData);
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
    await courseService.removeTask(id, taskId);
    res.status(StatusCodes.NO_CONTENT).send();
    logger.info(`Task with ID ${taskId} deleted from course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const tasks = await courseService.getTasks(id);
    res.status(StatusCodes.OK).json({ data: tasks });
    logger.info(`Tasks retrieved for course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

export const getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, taskId } = req.params;
    const task = await courseService.getTaskById(id, taskId);
    res.status(StatusCodes.OK).json({ data: task });
    logger.info(`Task with ID ${taskId} retrieved from course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}
