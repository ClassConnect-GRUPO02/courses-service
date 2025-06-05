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
    const { titularId, can_create_content, can_grade, can_update_course } = req.body;
    const instructor = await instructorService.addAuxInstructorToCourse(id, auxiliarId, titularId, can_create_content, can_grade, can_update_course);
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

export const updateInstructorPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, auxiliarId } = req.params;
    const { titularId, can_create_content, can_grade, can_update_course } = req.body;
    const instructor = await instructorService.updateInstructorPermissions(id, auxiliarId, titularId, can_create_content, can_grade, can_update_course);
    res.status(StatusCodes.OK).json(instructor);
    logger.info(`Instructor permissions updated for user with ID ${auxiliarId} in course with ID ${id}`);
  } catch (error) {
    next(error);
  }
}

export const getInstructorPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, instructorId } = req.params;
    const permissions = await instructorService.getInstructorPermissions(id, instructorId);
    res.status(StatusCodes.OK).json(permissions);
    logger.info(`Instructor permissions retrieved for user with ID ${instructorId} in course with ID ${id}`);
  } catch (error) {
    next(error);
  }
}

export const getInstructorsByCourseId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const instructors = await instructorService.getInstructorsByCourseId(id);
    res.status(StatusCodes.OK).json(instructors);
    logger.info(`Instructors retrieved for course with ID ${id}`);
  } catch (error) {
    next(error);
  }
}

export const getCoursesByInstructorId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { instructorId } = req.params;
    const courses = await instructorService.getCoursesByInstructorId(instructorId);
    res.status(StatusCodes.OK).json(courses);
    logger.info(`Courses retrieved for instructor with ID ${instructorId}`);
  } catch (error) {
    next(error);
  }
}