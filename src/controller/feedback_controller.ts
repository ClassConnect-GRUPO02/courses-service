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

export const getFeedbacksAsStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;
    const feedbacks = await feedbackService.getFeedbacksAsStudent(studentId);
    res.status(StatusCodes.OK).json({ data: feedbacks });
    logger.info(`Retrieved feedbacks for student with ID ${studentId}`);
  } catch (error) {
    next(error);
  }
}

export const getStudentFeedbackSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;
    const result = await feedbackService.getStudentFeedbackSummary(studentId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCourseFeedbackSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await feedbackService.getCourseFeedbackSummary(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getFeedbacksByCourseId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const feedbacks = await feedbackService.getFeedbacksByCourseId(id);
    res.status(StatusCodes.OK).json({ data: feedbacks });
    logger.info(`Retrieved feedbacks for course with ID ${id}`);
  } catch (error) {
    next(error);
  }
}
