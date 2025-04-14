import { Course } from '../models/course';
import * as database from '../database/database';
import { CourseNotFoundError } from '../models/errors';
import { Module } from '../models/module';

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
  return await database.updateCourse(id, updateData);
};

export const addModuleToCourse = async (courseId: string, module: Module): Promise<Module> => {
  return await database.addModuleToCourse(courseId, module);
}

export const removeModule = async (courseId: string, moduleId: string): Promise<void> => {
  return await database.deleteModule(courseId, moduleId);
}

export const getModules = async (courseId: string): Promise<Module[]> => {
  return await database.getModulesByCourseId(courseId);
}