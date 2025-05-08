import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import * as favoritesService from '../service/favorites_service';

export const addCourseToFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, courseId } = req.params;
    const createdFavorite = await favoritesService.addCourseToFavorites(courseId, studentId);
    res.status(StatusCodes.CREATED).json({ data: createdFavorite });
    logger.info(`Course with ID ${courseId} added to favorites successfully for student with ID ${studentId}`);
  } catch (error) {
    next(error);
  }
}

export const removeCourseFromFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, courseId } = req.params;
    await favoritesService.removeCourseFromFavorites(courseId, studentId);
    res.status(StatusCodes.NO_CONTENT).send();
    logger.info(`Course with ID ${courseId} removed from favorites successfully for student with ID ${studentId}`);
  } catch (error) {
    next(error);
  }
}

// Returns if a course is favorite for a student
// GET /students/:studentId/favorite-courses/:courseId
// Returns 200 OK with { data: true } if the course is favorite, or { data: false } if not
export const isCourseFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, courseId } = req.params;
    const isFavorite = await favoritesService.isCourseFavorite(courseId, studentId);
    res.status(StatusCodes.OK).json({ data: isFavorite });
    logger.info(`Checked if course with ID ${courseId} is favorite for student with ID ${studentId}`);
  } catch (error) {
    next(error);
  }
}

export const getFavoriteCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;
    const favoriteCourses = await favoritesService.getFavoriteCourses(studentId);
    res.status(StatusCodes.OK).json({ data: favoriteCourses });
    logger.info(`Retrieved favorite courses for student with ID ${studentId}`);
  } catch (error) {
    next(error);
  }
}