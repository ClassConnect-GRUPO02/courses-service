import { Module } from '../models/module';
import { CourseNotFoundError, ModuleNotFoundError } from '../models/errors';
import * as database from '../database/module_db';

export const addModuleToCourse = async (courseId: string, module: Module, instructorId: string): Promise<Module> => {
  const newModule = await database.addModuleToCourse(courseId, module, instructorId);
  if (!newModule) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }
  return newModule;
}

export const removeModule = async (courseId: string, moduleId: string, instructorId: string): Promise<void> => {
  const isDeleted = await database.deleteModule(courseId, moduleId, instructorId);
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

export const updateModulesOrder = async (courseId: string, orderedModuleIds: string[]): Promise<void> => {
    try {
      await database.updateModulesOrder(courseId, orderedModuleIds);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error updating modules order: ${error.message}`);
      }
      throw new Error("Unknown error updating modules order");
    }
  }

export const updateModule = async (courseId: string, moduleId: string, moduleData: Partial<Module>, instructorId: string): Promise<Module> => {
  const module = await database.updateModule(courseId, moduleId, moduleData, instructorId);
  if (!module) {
    throw new ModuleNotFoundError(`Module with ID ${moduleId} not found in course ${courseId}`);
  }
  return module;
}