import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CourseCreationError, CourseFullError, CourseNotFoundError, ModuleCreationError, ModuleNotFoundError, AlreadyEnrolledError, ResourceCreationError, ResourceNotFoundError, NotEnrolledError, PunctuationError, CommentOrPuntuationNotFoundError, AlreadyGaveFeedbackError, NotInstructorError, AlreadyGaveFeedbackToStudentError, AlreadyFavoriteError, NotFavoriteError, AuthorizationError, NotFoundError, AlreadyInstructorError, NotTitularError } from '../models/errors';
import { NextFunction } from 'express';
 
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof CourseCreationError || err instanceof ModuleCreationError || err instanceof CourseFullError || err instanceof AlreadyEnrolledError || err instanceof ResourceCreationError || err instanceof PunctuationError || err instanceof CommentOrPuntuationNotFoundError || err instanceof AlreadyGaveFeedbackError || err instanceof AlreadyGaveFeedbackToStudentError || err instanceof AlreadyFavoriteError || err instanceof NotFavoriteError || err instanceof AlreadyInstructorError || err instanceof NotTitularError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      type: 'https://example.com/bad-request',
      title: 'Invalid Request',
      status: StatusCodes.BAD_REQUEST,
      detail: err.message,
      instance: req.originalUrl,
    });
    //logger.error(err.message);
  } else if (err instanceof CourseNotFoundError) {
    res.status(err.status).json({
      type: err.type,
      title: 'Course Not Found',
      status: StatusCodes.NOT_FOUND,
      detail: err.detail,
      instance: req.originalUrl,
    });
    //logger.error(err.message);
  } else if (err instanceof ModuleNotFoundError) {
    res.status(err.status).json({
      type: err.type,
      title: 'Module Not Found',
      status: StatusCodes.NOT_FOUND,
      detail: err.detail,
      instance: req.originalUrl,
    });
    //logger.error(err.message);
  } else if (err instanceof ResourceNotFoundError) {
    res.status(err.status).json({
      type: err.type,
      title: 'Resource Not Found',
      status: StatusCodes.NOT_FOUND,
      detail: err.detail,
      instance: req.originalUrl,
    });
    //logger.error(err.message);
  } else if (err instanceof NotEnrolledError || err instanceof NotInstructorError || err instanceof AuthorizationError) {
    res.status(err.status).json({
      type: err.type,
      title: 'Not Enrolled or Not Instructor',
      status: StatusCodes.FORBIDDEN,
      detail: err.detail,
      instance: req.originalUrl,
    });
    //logger.error(err.message);
  } else if (err instanceof NotFoundError) {
    res.status(err.status).json({
      type: err.type,
      title: 'Item Not Found',
      status: err.status,
      detail: err.detail,
      instance: req.originalUrl,
    });
    //logger.error(err.message);
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: 'https://example.com/internal-server-error',
      title: 'Internal Server Error',
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: 'An unexpected error occurred.',
      instance: req.originalUrl,
    });
    //logger.error('An unexpected error occurred:', err);
  }
  next();
};