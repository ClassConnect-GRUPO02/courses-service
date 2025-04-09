import { Request, Response, NextFunction } from 'express';
 import { StatusCodes } from 'http-status-codes';
 import { CourseCreationError, CourseNotFoundError } from '../models/errors';
 
 export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
   if (err instanceof CourseCreationError) {
     res.status(StatusCodes.BAD_REQUEST).json({
       type: 'https://example.com/bad-request',
       title: 'Invalid Request',
       detail: err.message,
       instance: req.originalUrl,
     });
   } else if (err instanceof CourseNotFoundError) {
     res.status(err.status).json({
       type: err.type,
       title: 'Course Not Found',
       detail: err.detail,
       instance: req.originalUrl,
     });
   }
    else {
     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
       type: 'https://example.com/internal-server-error',
       title: 'Internal Server Error',
       detail: 'An unexpected error occurred.',
       instance: req.originalUrl,
     });
   }
 };