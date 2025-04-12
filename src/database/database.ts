import { PrismaClient } from '@prisma/client';
import { Course } from '../models/course';
import { v4 as uuidv4 } from 'uuid';
import { CourseNotFoundError } from '../models/errors';
import { Module } from '../models/module';

const prisma = new PrismaClient();

export const getCourses = async (): Promise<Course[]> => {
  const coursesFromDB = await prisma.course.findMany();

  return coursesFromDB.map((course: {
    id: string;
    name: string;
    description: string;
    shortDescription: string;
    startDate: Date;
    endDate: Date;
    instructorName: string;
    instructorProfile: string;
    capacity: number;
    enrolled: number;
    category: string;
    level: string;
    modality: string;
    prerequisites: string;
    imageUrl: string;
  }): Course => ({
    id: course.id,
    name: course.name,
    description: course.description,
    shortDescription: course.shortDescription,
    startDate: course.startDate.toISOString(),
    endDate: course.endDate.toISOString(),
    instructor: {
      name: course.instructorName,
      profile: course.instructorProfile,
    },
    capacity: course.capacity,
    enrolled: course.enrolled,
    category: course.category,
    level: course.level as Course['level'],
    modality: course.modality as Course['modality'],
    prerequisites: course.prerequisites.split(','),
    imageUrl: course.imageUrl,
  }));
};

export const getCourseById = async (id: string): Promise<Course> => {
  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${id} not found`);
  }

  return {
    id: course.id,
    name: course.name,
    description: course.description,
    shortDescription: course.shortDescription,
    startDate: course.startDate.toISOString(),
    endDate: course.endDate.toISOString(),
    instructor: {
      name: course.instructorName,
      profile: course.instructorProfile,
    },
    capacity: course.capacity,
    enrolled: course.enrolled,
    category: course.category,
    level: course.level as Course['level'],
    modality: course.modality as Course['modality'],
    prerequisites: course.prerequisites.split(','),
    imageUrl: course.imageUrl,
  };
};

export const addCourse = async (course: Course): Promise<Course> => {
  const newCourse = await prisma.course.create({
    data: {
      id: uuidv4(),
      name: course.name,
      description: course.description,
      shortDescription: course.shortDescription,
      startDate: new Date(course.startDate),
      endDate: new Date(course.endDate),
      instructorName: course.instructor.name,
      instructorProfile: course.instructor.profile,
      capacity: course.capacity,
      enrolled: course.enrolled,
      category: course.category,
      level: course.level,
      modality: course.modality,
      prerequisites: course.prerequisites.join(','),
      imageUrl: course.imageUrl,
    },
  });

  return {
    ...course,
    id: newCourse.id,
  };
};

export const deleteCourse = async (id: string): Promise<Course> => {
  const deleted = await prisma.course.delete({
    where: { id },
  });

  return {
    id: deleted.id,
    name: deleted.name,
    description: deleted.description,
    shortDescription: deleted.shortDescription,
    startDate: deleted.startDate.toISOString(),
    endDate: deleted.endDate.toISOString(),
    instructor: {
      name: deleted.instructorName,
      profile: deleted.instructorProfile,
    },
    capacity: deleted.capacity,
    enrolled: deleted.enrolled,
    category: deleted.category,
    level: deleted.level as Course['level'],
    modality: deleted.modality as Course['modality'],
    prerequisites: deleted.prerequisites.split(','),
    imageUrl: deleted.imageUrl,
  };
};

export const updateCourse = async (id: string, updateData: Partial<Course>): Promise<Course> => {
  const existingCourse = await prisma.course.findUnique({ where: { id } });

  if (!existingCourse) {
    throw new CourseNotFoundError(`Course with ID ${id} not found`);
  }

  const updated = await prisma.course.update({
    where: { id },
    data: {
      name: updateData.name ?? existingCourse.name,
      description: updateData.description ?? existingCourse.description,
      shortDescription: updateData.shortDescription ?? existingCourse.shortDescription,
      startDate: updateData.startDate ? new Date(updateData.startDate) : existingCourse.startDate,
      endDate: updateData.endDate ? new Date(updateData.endDate) : existingCourse.endDate,
      instructorName: updateData.instructor?.name ?? existingCourse.instructorName,
      instructorProfile: updateData.instructor?.profile ?? existingCourse.instructorProfile,
      capacity: updateData.capacity ?? existingCourse.capacity,
      enrolled: updateData.enrolled ?? existingCourse.enrolled,
      category: updateData.category ?? existingCourse.category,
      level: updateData.level ?? existingCourse.level,
      modality: updateData.modality ?? existingCourse.modality,
      prerequisites: updateData.prerequisites
        ? updateData.prerequisites.join(',')
        : existingCourse.prerequisites,
      imageUrl: updateData.imageUrl ?? existingCourse.imageUrl,
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    shortDescription: updated.shortDescription,
    startDate: updated.startDate.toISOString(),
    endDate: updated.endDate.toISOString(),
    instructor: {
      name: updated.instructorName,
      profile: updated.instructorProfile,
    },
    capacity: updated.capacity,
    enrolled: updated.enrolled,
    category: updated.category,
    level: updated.level as Course['level'],
    modality: updated.modality as Course['modality'],
    prerequisites: updated.prerequisites.split(','),
    imageUrl: updated.imageUrl,
  };
};


export const addModuleToCourse = async (courseId: string, module: any): Promise<Module> => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
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