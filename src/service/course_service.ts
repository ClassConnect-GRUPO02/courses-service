import { Course } from '../models/course';
import * as database from '../database/course_db';
import { CourseNotFoundError } from '../models/errors';

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

export const updateCourse = async (id: string, updateData: Partial<Course>): Promise<Course> => {
  const course = await database.updateCourse(id, updateData);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${id} not found`);
  }
  return course;
};

export const getCoursesByUserId = async (userId: string): Promise<Course[]> => {
  return await database.getCoursesByUserId(userId);
};








