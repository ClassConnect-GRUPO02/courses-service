import { v4 as uuidv4 } from 'uuid';
import { prisma } from './database';
import { Module } from '../models/module';
import { CourseNotFoundError } from '../models/errors';

// Adds a new module to a course
// Throws an error if the course is not found
// Returns the created Module object
export const addModuleToCourse = async (courseId: string, module: Module): Promise<Module | null> => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    return null;
  }
  const newModule = await prisma.module.create({
    data: {
      id: uuidv4(),
      name: module.name,
      description: module.description,
      url: module.url,
      order: module.order,
      courseId: courseId,
    },
  });
  return {
    ...newModule,
    id: newModule.id,
  };
};

// Retrieves all modules for a given course ID
// Returns an array of Module objects
export const getModulesByCourseId = async (courseId: string): Promise<Module[]> => {
  return prisma.module.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
  });
};

// Deletes a module by its ID returning true if it was found and deleted, false otherwise
export const deleteModule = async (courseId: string, moduleId: string): Promise<boolean> => {
  const module = await prisma.module.findFirst({
    where: {
      id: moduleId,
      courseId: courseId,
    },
  });

  if (!module) {
    return false;
  }

  await prisma.module.delete({
    where: { id: moduleId },
  });
  
  return true;
};


// Retrieves a module by its ID within a specific course
// Returns the Module object or null if it's not found
export const getModuleById = async (courseId: string, moduleId: string): Promise<Module | null> => {
  return await prisma.module.findFirst({
    where: {
      id: moduleId,
      courseId: courseId,
    },
  });
}

export const updateModulesOrder = async (courseId: string, orderedModuleIds: string[]): Promise<void> => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  await Promise.all(
    orderedModuleIds.map((moduleId, index) =>
      prisma.module.updateMany({
        where: { id: moduleId, courseId },
        data: { order: index },
      })
    )
  );
};

export const updateModule = async (courseId: string, moduleId: string, updateData: Partial<Module>): Promise<Module | null> => {
  const existingModule = await prisma.module.findUnique({
    where: { id: moduleId },
  });

  if (!existingModule) {
    return null;
  }

  const updatedModule = await prisma.module.update({
    where: { id: moduleId },
    data: {
      name: updateData.name ?? existingModule.name,
      description: updateData.description ?? existingModule.description,
      url: updateData.url ?? existingModule.url,
      order: updateData.order ?? existingModule.order,
    },
  });

  return updatedModule;
}