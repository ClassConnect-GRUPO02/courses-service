import { Request, Response, NextFunction } from 'express';
import * as courseService from '../service/service';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import { Course } from '../models/course';
import { Module } from '../models/module';
import { Enrollment } from '../models/enrollment';

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

    const deletedCourse = await courseService.removeCourse(id);

    if (!deletedCourse || Object.keys(deletedCourse).length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({ error: `Course with ID ${id} not found` });
      return;
    } else {
      logger.debug('Course deleted:', deletedCourse);
    }

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

    const updatedCourse = await courseService.updateCourse(id, courseData);

    if (!updatedCourse) {
      res.status(StatusCodes.NOT_FOUND).json({ error: `Course with ID ${id} not found` });
      return;
    }

    res.status(StatusCodes.OK).json({ data: updatedCourse });
    logger.info(`Course with ID ${id} updated successfully`);
  } catch (error) {
    next(error);
  }
};

// -------------------------- MODULES --------------------------

export const addModuleToCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const moduleData = req.body;
    const module = new Module(moduleData);
    const createdModule = await courseService.addModuleToCourse(id, module);
    res.status(StatusCodes.CREATED).json({ data: createdModule });
    logger.info(`Module added to course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const deleteModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, moduleId } = req.params;
    if (!id || !moduleId) {
      handleInvalidRequestError(res, 'Invalid course or module ID');
      return;
    }
    await courseService.removeModule(id, moduleId);
    res.status(StatusCodes.NO_CONTENT).send();
    logger.info(`Module with ID ${moduleId} deleted from course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const getModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const modules = await courseService.getModules(id);
    res.status(StatusCodes.OK).json({ data: modules });
    logger.info(`Modules retrieved for course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const getModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, moduleId } = req.params;
    const module = await courseService.getModuleById(id, moduleId);
    res.status(StatusCodes.OK).json({ data: module });
    logger.info(`Module with ID ${moduleId} retrieved from course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

/*const handleCourseNotFoundError = (error: CourseNotFoundError, req: Request, res: Response): void => {
  res.status(error.status).json({
    type: error.type,
    title: 'Course Not Found',
    detail: error.detail,
    instance: req.originalUrl,
  });
};*/

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

/*const handleUnknownError = (res: Response, error: unknown): void => {
  const errorResponse = {
    type: 'https://example.com/internal-server-error',
    title: 'Internal Server Error',
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    detail: 'An unexpected error occurred.',
    instance: res.req.originalUrl,
  };
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  logger.error('Internal Server Error:', error);
};*/

export const enrollStudentToCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseId = req.params.id;
    const { userId } = req.body;
    
    if (!userId) {
      handleInvalidRequestError(res, 'Student ID is required');
      return;
    }

    const enrollment = new Enrollment({ courseId, userId });
    const enrolledCourse = await courseService.enrollStudent(enrollment);
    res.status(StatusCodes.OK).json({ data: enrolledCourse });
    logger.info(`Student with ID ${userId} enrolled in course with ID ${courseId} successfully`);
  } catch (error) {
    console.error('Error during enrollment:', error);
    next(error);
  }
};