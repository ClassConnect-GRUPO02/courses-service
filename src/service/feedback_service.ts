import * as database from '../database/course_db';
import * as enrollment_db from '../database/enrollment_db';
import * as feedback_db from '../database/feedback_db';
import * as instructor_db from '../database/instructor_db';
import { generateCourseFeedbackSummary, generateFeedbackSummary } from '../lib/ai';
import { AlreadyGaveFeedbackError, AlreadyGaveFeedbackToStudentError, CommentOrPuntuationNotFoundError, CourseNotFoundError, NotEnrolledError, NotInstructorError, PunctuationError } from '../models/errors';

// Export a function to add feedback to a course
export const addFeedbackToCourse = async (courseId: string, studentId: string, comment: string, punctuation: number) => {
    const course = await database.getCourseById(courseId);
    if (!course) {
        throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
    }

    if (comment.length < 1 || !comment || !punctuation) {
        throw new CommentOrPuntuationNotFoundError();
    }

    const isEnrolled = await enrollment_db.isEnrolledInCourse(courseId, studentId);
    if (!isEnrolled) {
        throw new NotEnrolledError(courseId, studentId);
    }

    if (punctuation < 1 || punctuation > 5) {
        throw new PunctuationError();
    }

    const alreadyExists = await feedback_db.feedbackAlreadyExists(courseId, studentId);
    if (alreadyExists) {
        throw new AlreadyGaveFeedbackError(courseId, studentId);
    }

    return await feedback_db.addFeedbackToCourse(courseId, studentId, comment, punctuation);
  };

// Export a function to add feedback to a student
export const addFeedbackToStudent = async (courseId: string, studentId: string, instructorId: string, comment: string, punctuation: number) => {
    const course = await database.getCourseById(courseId);
    if (!course) {
        throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
    }

    const isInstructor = await instructor_db.isInstructorInCourse(courseId, instructorId);
    if (!isInstructor) {
        throw new NotInstructorError(courseId, instructorId);
    }
    
    const isEnrolled = await enrollment_db.isEnrolledInCourse(courseId, studentId);
    if (!isEnrolled) {
        throw new NotEnrolledError(courseId, studentId);
    }

    const alreadyExists = await feedback_db.studentFeedbackAlreadyExists(courseId, studentId);
    if (alreadyExists) {
        throw new AlreadyGaveFeedbackToStudentError(courseId, studentId);
    }

    if (comment.length < 1 || !comment || !punctuation) {
        throw new CommentOrPuntuationNotFoundError();
    }

    if (punctuation < 1 || punctuation > 5) {
        throw new PunctuationError();
    }

    return await feedback_db.addFeedbackToStudent(courseId, studentId, instructorId, comment, punctuation);
};

// Export a function to get feedbacks as a student
export const getFeedbacksAsStudent = async (studentId: string) => {
    return await feedback_db.getFeedbacksAsStudent(studentId);
};
  
export const getFeedbacksByCourseId = async (courseId: string) => {
    const course = await database.getCourseById(courseId);
    if (!course) {
        throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
    }

    return await feedback_db.getFeedbacksByCourseId(courseId);
};

export const getStudentFeedbackSummary = async (studentId: string) => {
    const feedbacks = await feedback_db.getFeedbacksAsStudent(studentId);
  
    if (feedbacks.length === 0) {
      throw new Error('El alumno no tiene feedbacks.');
    }
  
    const text = feedbacks
      .map(f => `Comentario: ${f.comment}\nPuntuación: ${f.punctuation}`)
      .join('\n\n');
  
    const summary = await generateFeedbackSummary(text);
    return { summary };
  };

export const getCourseFeedbackSummary = async (courseId: string) => {
    const feedbacks = await feedback_db.getFeedbacksByCourseId(courseId);
  
    if (feedbacks.length === 0) {
      throw new Error('El curso no tiene feedbacks.');
    }
  
    const text = feedbacks
      .map(f => `Comentario: ${f.comment}\nPuntuación: ${f.punctuation}`)
      .join('\n\n');
  
    const summary = await generateCourseFeedbackSummary(text);
    return { summary };
  };