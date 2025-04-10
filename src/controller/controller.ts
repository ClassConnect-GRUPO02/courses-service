import { Request, Response, NextFunction } from 'express';
import * as courseService from '../service/service';
import logger from '../logger/logger';
import { CourseNotFoundError, CourseCreationError } from '../models/errors';
import { StatusCodes } from 'http-status-codes';
import { Course } from '../models/course';

export const getCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courses = await courseService.getAllCourses();
    res.status(StatusCodes.OK).json({ data: courses });
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourse(id);
    res.status(StatusCodes.OK).json(course);
  } catch (error) {
    next(error);
  }
};

export const addCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseData: Course = req.body;

    logger.debug('BODY RECIBIDO:', JSON.stringify(courseData, null, 2));
    const course = new Course(courseData);

    const createdCourse = await courseService.createCourse(course);
    res.status(StatusCodes.CREATED).json({ data: createdCourse });
    logger.info('Course added successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      handleInvalidRequestError(res, 'Invalid course ID');
      return;
    }

    await courseService.removeCourse(id);
    res.status(StatusCodes.NO_CONTENT).send();
    logger.info(`Course with ID ${id} deleted successfully`);
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const courseData: Partial<Course> = req.body;
    const updatedCourse = courseService.updateCourse(id, courseData);
    res.status(StatusCodes.OK).json({ data: updatedCourse });
    logger.info(`Course with ID ${id} updated successfully`);
  } catch (error) {
    next(error);
  }
};

const handleCourseNotFoundError = (error: CourseNotFoundError, req: Request, res: Response): void => {
  res.status(error.status).json({
    type: error.type,
    title: 'Course Not Found',
    detail: error.detail,
    instance: req.originalUrl,
  });
};

const handleInvalidRequestError = (res: Response, detail: string): void => {
  const errorResponse = {
    type: 'https://example.com/bad-request',
    title: 'Invalid Request',
    status: StatusCodes.BAD_REQUEST,
    detail,
    instance: res.req.originalUrl,
  };
  res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  logger.debug('Invalid Request');
};

const handleUnknownError = (res: Response, error: unknown): void => {
  const errorResponse = {
    type: 'https://example.com/internal-server-error',
    title: 'Internal Server Error',
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    detail: 'An unexpected error occurred.',
    instance: res.req.originalUrl,
  };
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  logger.error('Internal Server Error:', error);
};