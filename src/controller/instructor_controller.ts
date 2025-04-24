import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import * as instructorService from '../service/instructor_service';

// -------------------------- INSTRUCTORS --------------------------

export const isInstructorInCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, instructorId } = req.params;
    const isInstructor = await instructorService.isInstructorInCourse(id, instructorId);
    res.status(StatusCodes.OK).json({ isInstructor: isInstructor });
    logger.info(`Instructor status checked for user with ID ${instructorId} in course with ID ${id}`);
  } catch (error) {
    next(error);
  }
}