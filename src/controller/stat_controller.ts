import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import * as statService from '../service/stat_service';

export const getStatsForInstructorCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const stats = await statService.getStatsForInstructorCourses(id);

    res.status(StatusCodes.OK).json({ data: stats });
    logger.info(`Stats retrieved for instructor with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}
