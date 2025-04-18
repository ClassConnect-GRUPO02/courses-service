import { Course } from '../models/course';
import * as database from '../database/database';
import { CourseNotFoundError, ModuleNotFoundError } from '../models/errors';
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

export const updateCourse = (id: string, updateData: Partial<Course>): Promise<Course> => {
  const existingCourse = database.getCourseById(id);

  if (!existingCourse) {
    throw new CourseNotFoundError(`Course with ID ${id} not found`);
  }

  const updatedCourse = { ...existingCourse, ...updateData, id }; // mantener el mismo ID

  return database.updateCourse(id, updatedCourse);
};


export const addModuleToCourse = async (courseId: string, module: Module): Promise<Module> => {
  const newModule = await database.addModuleToCourse(courseId, module);
  if (!newModule) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }
  return newModule;
}

export const removeModule = async (courseId: string, moduleId: string): Promise<void> => {
  const isDeleted = await database.deleteModule(courseId, moduleId);
  if (!isDeleted) {
    throw new ModuleNotFoundError(`Module with ID ${moduleId} not found in course ${courseId}`);
  }
};

export const getModules = async (courseId: string): Promise<Module[]> => {
  return await database.getModulesByCourseId(courseId);
}

export const getModuleById = async (courseId: string, moduleId: string): Promise<Module> => {
  const module = await database.getModuleById(courseId, moduleId);
  if (!module) {
    throw new ModuleNotFoundError(`Module with ID ${moduleId} not found in course ${courseId}`);
  }
  return module;
}