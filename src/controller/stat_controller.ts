import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import * as statService from '../service/stat_service';

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
