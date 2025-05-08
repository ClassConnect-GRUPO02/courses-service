import * as database from '../database/course_db';
import * as enrollment_db from '../database/enrollment_db';
import * as favorites_db from '../database/favorites_db';
import { AlreadyFavoriteError, CourseNotFoundError, NotEnrolledError, NotFavoriteError } from '../models/errors';

export const addCourseToFavorites = async (courseId: string, studentId: string) => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const isEnrolled = await enrollment_db.isEnrolledInCourse(courseId, studentId);
  if (!isEnrolled) {
    throw new NotEnrolledError(courseId, studentId);
  }  

  const alreadyExists = await favorites_db.favoriteAlreadyExists(courseId, studentId);
  if (alreadyExists) {
    throw new AlreadyFavoriteError(courseId, studentId);
  }

  return await favorites_db.addCourseToFavorites(courseId, studentId);
}

export const removeCourseFromFavorites = async (courseId: string, studentId: string) => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const isEnrolled = await enrollment_db.isEnrolledInCourse(courseId, studentId);
  if (!isEnrolled) {
    throw new NotEnrolledError(courseId, studentId);
  }
  
  const alreadyExists = await favorites_db.favoriteAlreadyExists(courseId, studentId);
  if (!alreadyExists) {
    throw new NotFavoriteError(courseId, studentId);
  }

  return await favorites_db.removeCourseFromFavorites(courseId, studentId);
}

// Returns if a course is favorite for a student
export const isCourseFavorite = async (courseId: string, studentId: string) => {
  return await favorites_db.favoriteAlreadyExists(courseId, studentId);
}

export const getFavoriteCourses = async (studentId: string) => {
  return await favorites_db.getFavoriteCourses(studentId);
}