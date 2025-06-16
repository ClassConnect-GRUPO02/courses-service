import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import * as statService from '../service/stat_service';
import * as enrollmentService from '../service/enrollment_service';

export const getStatsForInstructorCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { instructorId } = req.params;
    const stats = await statService.getStatsForInstructorCourses(instructorId);

    res.status(StatusCodes.OK).json({ data: stats });
    logger.info(`Stats retrieved for instructor with ID ${instructorId} successfully`);
  } catch (error) {
    next(error);
  }
}

export const getCourseStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    const from: string = req.query.from as string || new Date(0).toISOString();
    const to: string = req.query.to as string || new Date().toISOString();
    const stats = await statService.getCourseStats(courseId, from, to);
    res.status(StatusCodes.OK).json({ data: stats });
    logger.info(`Stats retrieved for course with ID ${courseId} successfully`);
  } catch (error) {
    next(error);
  }
}

export const getCourseStudentsStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    const from: string = req.query.from as string || new Date(0).toISOString();
    const to: string = req.query.to as string || new Date().toISOString();
    const stats = await statService.getCourseStudentsStats(courseId, from, to);

    res.status(StatusCodes.OK).json({ data: stats });
    logger.info(`Stats retrieved for course with ID ${courseId} successfully`);
  } catch (error) {
    next(error);
  }
}

export const getCourseStudentStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { studentId } = req.params;
    const from: string = req.query.from as string || new Date(0).toISOString();
    const to: string = req.query.to as string || new Date().toISOString();
    const studentIsEnrolled = await enrollmentService.isEnrolledInCourse(courseId, studentId);
    if (!studentIsEnrolled) {
      res.status(StatusCodes.NOT_FOUND).json({ error: `The student ${studentId} is not enrolled in the course ${courseId}` });
      return;
    }
    const stats = await statService.getCourseStudentStats(courseId, studentId, from, to);

    res.status(StatusCodes.OK).json({ data: stats });
    logger.info(`Stats retrieved for course with ID ${courseId} successfully`);
  } catch (error) {
    next(error);
  }
}
