import { Request, Response, NextFunction } from 'express';
import * as courseService from '../service/course_service';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import { Course } from '../models/course';
import * as instructorService from '../service/instructor_service';
import { AuthenticatedRequest } from '../lib/auth';

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
    const course = new Course(courseData);

    const createdCourse = await courseService.createCourse(course);
    if (createdCourse) {
      const instructor = await instructorService.addInstructorToCourse(createdCourse.id, courseData.creatorId, "TITULAR", true, true, true);
      if (instructor) {
        logger.info('Instructor added');
      } else {
        logger.info('Instructor not added');
      }
    }
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

export const updateCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const courseData: Partial<Course> = req.body;
    const instructorId = req.user?.Id; // extracted from JWT
    if (!instructorId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing instructor ID" });
      return;
    }

    const updatedCourse = await courseService.updateCourse(id, courseData, instructorId);

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

export const getCoursesByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const courses = await courseService.getCoursesByUserId(id);
    res.status(StatusCodes.OK).json({ data: courses });
    logger.info(`Courses retrieved for user with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

// -------------------------- ACTIVITY LOGGING --------------------------
export const getCourseActivityLog = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const instructorId = req.user?.Id; // extracted from JWT
    if (!instructorId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing instructor ID" });
      return;
    }
    const activityLog = await courseService.getCourseActivityLog(id, instructorId);
    res.status(StatusCodes.OK).json({ data: activityLog });
    logger.info(`Activity log retrieved for course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

// -------------------------- ERROR HANDLING --------------------------

/*const handleCourseNotFoundError = (error: CourseNotFoundError, req: Request, res: Response): void => {
  res.status(error.status).json({
    type: error.type,
    title: 'Course Not Found',
    detail: error.detail,
    instance: req.originalUrl,
  });
};*/

export const handleInvalidRequestError = (res: Response, detail: string): void => {
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

