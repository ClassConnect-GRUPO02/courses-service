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
