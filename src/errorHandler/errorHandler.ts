import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CourseCreationError, CourseNotFoundError, ModuleCreationError, ModuleNotFoundError } from '../models/errors';
import { NextFunction } from 'express';
 
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof CourseCreationError || err instanceof ModuleCreationError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      type: 'https://example.com/bad-request',
      title: 'Invalid Request',
      status: StatusCodes.BAD_REQUEST,
      detail: err.message,
      instance: req.originalUrl,
    });
  } else if (err instanceof CourseNotFoundError) {
    res.status(err.status).json({
      type: err.type,
      title: 'Course Not Found',
      status: StatusCodes.NOT_FOUND,
      detail: err.detail,
      instance: req.originalUrl,
    });
  } else if (err instanceof ModuleNotFoundError) {
    res.status(err.status).json({
      type: err.type,
      title: 'Module Not Found',
      status: StatusCodes.NOT_FOUND,
      detail: err.detail,
      instance: req.originalUrl,
    });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: 'https://example.com/internal-server-error',
      title: 'Internal Server Error',
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: 'An unexpected error occurred.',
      instance: req.originalUrl,
    });
  }
};