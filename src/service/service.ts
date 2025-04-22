import { Course } from '../models/course';
import * as database from '../database/database';
import { AlreadyEnrolledError, CourseFullError, CourseNotFoundError, ModuleNotFoundError } from '../models/errors';
import { Module } from '../models/module';
import { Enrollment } from '../models/enrollment';

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

export const enrollStudent = async (enrollment: Enrollment ): Promise<Enrollment> => {
  const course = await database.getCourseById(enrollment.courseId);
  
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${enrollment.courseId} not found`);
  }
  
  if (course.enrolled >= course.capacity) {
    throw new CourseFullError(`Course with ID ${enrollment.courseId} is full`);
  } else {
    const enroll = await database.enrollStudent(enrollment.courseId, enrollment.userId);
    if (!enroll) {
      throw new AlreadyEnrolledError(enrollment.courseId, enrollment.userId);
    }
    course.enrolled += 1;
    await database.updateCourse(enrollment.courseId, course);
    return enroll;
  }
};

export const getCoursesByUserId = async (userId: string): Promise<Course[]> => {
  return await database.getCoursesByUserId(userId);
};

export const isEnrolledInCourse = async (courseId: string, userId: string): Promise<boolean> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }
  return await database.isEnrolledInCourse(courseId, userId);
}

export const addInstructorToCourse = async (courseId: string, instructorId: string, type: string): Promise<boolean> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  return await database.addInstructorToCourse(courseId, instructorId, type);
}

export const isInstructorInCourse = async (courseId: string, instructorId: string): Promise<boolean> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  return await database.isInstructorInCourse(courseId, instructorId);
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

export const updateModule = async (courseId: string, moduleId: string, moduleData: Partial<Module>): Promise<Module> => {
  const module = await database.updateModule(courseId, moduleId, moduleData);
  if (!module) {
    throw new ModuleNotFoundError(`Module with ID ${moduleId} not found in course ${courseId}`);
  }
  return module;
}

