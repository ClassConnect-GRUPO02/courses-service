import { Course } from '../models/course';
import * as database from '../database/database';
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

export const updateCourse = (id: string, updateData: Partial<Course>): Promise<Course> => {
  const existingCourse = database.getCourseById(id);

  if (!existingCourse) {
    throw new CourseNotFoundError(`Course with ID ${id} not found`);
  }

  const updatedCourse = { ...existingCourse, ...updateData, id }; // mantener el mismo ID

  return database.updateCourse(id, updatedCourse);
};