import { PrismaClient } from '@prisma/client';
import { Course } from '../models/course';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const getCourses = async (): Promise<Course[]> => {
  const coursesFromDB = await prisma.course.findMany();

  return coursesFromDB.map((course) => ({
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
    throw new Error(`Course with ID ${id} not found`);
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