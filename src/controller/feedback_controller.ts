import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import * as feedbackService from '../service/feedback_service';

// -------------------------- COURSES FEEDBACK ---------------------------
export const addFeedbackToCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { student_id, comment, punctuation } = req.body;
    const createdFeedback = await feedbackService.addFeedbackToCourse(id, student_id, comment, punctuation);
    res.status(StatusCodes.CREATED).json({ data: createdFeedback });
    logger.info(`Feedback added to course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

// -------------------------- STUDENTS FEEDBACK ---------------------------
export const addFeedbackToStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, studentId } = req.params;
    const { instructor_id, comment, punctuation } = req.body;
    const createdFeedback = await feedbackService.addFeedbackToStudent(courseId, studentId, instructor_id, comment, punctuation);
    res.status(StatusCodes.CREATED).json({ data: createdFeedback });
    logger.info(`Feedback added to student with ID ${studentId} in course with ID ${courseId} successfully`);
  } catch (error) {
    next(error);
  }
}
