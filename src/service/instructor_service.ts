import { CourseNotFoundError } from '../models/errors';
import * as database from '../database/database';
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
