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

export const addInstructorToCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, auxiliarId } = req.params;
    const { titularId } = req.body;
    const instructor = await instructorService.addAuxInstructorToCourse(id, auxiliarId, titularId);
    res.status(StatusCodes.CREATED).json(instructor);
    logger.info(`Instructor with ID ${auxiliarId} added to course with ID ${id}`);
  } catch (error) {
    next(error);
  }
}

export const removeInstructorFromCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, auxiliarId } = req.params;
    const { titularId } = req.body;
    const instructor = await instructorService.removeInstructorFromCourse(id, auxiliarId, titularId);
    res.status(StatusCodes.OK).json(instructor);
    logger.info(`Instructor with ID ${auxiliarId} removed from course with ID ${id}`);
  } catch (error) {
    next(error);
  }
}