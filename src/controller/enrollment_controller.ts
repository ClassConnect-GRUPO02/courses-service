import { Request, Response, NextFunction } from 'express';
import * as courseService from '../service/service';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import { Enrollment } from '../models/enrollment';
import { handleInvalidRequestError } from './course_controller';


// -------------------------- ENROLLMENT --------------------------

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

export const isEnrolledInCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const isEnrolled = await courseService.isEnrolledInCourse(id, userId);
    res.status(StatusCodes.OK).json({ isEnrolled: isEnrolled });
    logger.info(`Enrollment status checked for user with ID ${userId} in course with ID ${id}`);
  }
  catch (error) {
    next(error)
  }
};