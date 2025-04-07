import { Course } from '../models/course';
import * as database from '../database/database';

export const getAllCourses = (): Course[] => {
  return database.getCourses();
};

export const getCourse = (id: string): Course => {
  return database.getCourseById(id);
};

export const createCourse = (course: Course): Course => {
  return database.addCourse(course);
};

export const removeCourse = (id: string): Course => {
  return database.deleteCourse(id);
};