import { Course } from '../models/course';
import * as database from '../database/course_db';
import { CourseNotFoundError, NotTitularError } from '../models/errors';
import { isTitularInCourse } from '../database/instructor_db';
import { CourseActivityLog } from '../database/course_db';

export const getAllCourses = async (): Promise<Course[]> => {
  return await database.getCourses();
};

export const getCourse = async (id: string): Promise<Course> => {
  return await database.getCourseById(id);
};

export const createCourse = async (course: Course): Promise<Course> => {
  return await database.addCourse(course);
};

export const removeCourse = async (id: string): Promise<Course> => {
  return await database.deleteCourse(id);
};

export const updateCourse = async (id: string, updateData: Partial<Course>, instructorId: string): Promise<Course> => {
  const course = await database.updateCourse(id, updateData, instructorId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${id} not found`);
  }
  return course;
};

export const getCoursesByUserId = async (userId: string): Promise<Course[]> => {
  return await database.getCoursesByUserId(userId);
};

export const getCourseActivityLog = async (
  courseId: string,
  instructorId: string
): Promise<CourseActivityLog[]> => {

  const isTitular = await isTitularInCourse(courseId, instructorId);
  if (!isTitular) {
    throw new NotTitularError(courseId, instructorId);
  }

  return await database.getCourseActivityLog(courseId);
};







