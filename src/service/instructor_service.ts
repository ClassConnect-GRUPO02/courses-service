import { AlreadyInstructorError, CourseNotFoundError, NotInstructorError } from '../models/errors';
import * as database from '../database/course_db';
import * as databaseInstructor from '../database/instructor_db';

export const addInstructorToCourse = async (courseId: string, instructorId: string, type: string): Promise<boolean> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  return await databaseInstructor.addInstructorToCourse(courseId, instructorId, type);
}

export const isInstructorInCourse = async (courseId: string, instructorId: string): Promise<boolean> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  return await databaseInstructor.isInstructorInCourse(courseId, instructorId);
}

export const addAuxInstructorToCourse = async (courseId: string, userId: string, instructorId: string): Promise<boolean> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const isInstructor = await databaseInstructor.isInstructorInCourse(courseId, instructorId);
  if (!isInstructor) {
    throw new NotInstructorError(courseId, instructorId);
  }

  const isAuxInstructor = await databaseInstructor.isInstructorInCourse(courseId, userId);
  if (isAuxInstructor) {
    throw new AlreadyInstructorError(courseId, userId);
  }

  return await databaseInstructor.addInstructorToCourse(courseId, userId, "AUXILIAR");
}
