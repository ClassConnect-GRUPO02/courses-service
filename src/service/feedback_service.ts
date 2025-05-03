import * as database from '../database/course_db';
import * as enrollment_db from '../database/enrollment_db';
import * as feedback_db from '../database/feedback_db';
import { CourseNotFoundError, NotEnrolledError } from '../models/errors';

// Export a function to add feedback to a course
export const addFeedbackToCourse = async (courseId: string, studentId: string, comment: string, punctuation: number) => {
    const course = await database.getCourseById(courseId);
    if (!course) {
        throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
    }

    const isEnrolled = await enrollment_db.isEnrolledInCourse(courseId, studentId);
    if (!isEnrolled) {
        throw new NotEnrolledError(courseId, studentId);
    }

    if (punctuation < 1 || punctuation > 5) {
        throw new Error(`Punctuation must be between 1 and 5`);
    }

    if (comment.length > 500 || comment.length < 1) {
        throw new Error(`Comment must be between 1 and 500 characters`);
    }

    const alreadyExists = await feedback_db.feedbackAlreadyExists(courseId, studentId);
    if (alreadyExists) {
        throw new Error(`Feedback already exists for course ${courseId} by student ${studentId}`);
    }

    return await feedback_db.addFeedbackToCourse(courseId, studentId, comment, punctuation);
  };