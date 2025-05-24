import { PrismaClient } from '@prisma/client';
import { Course } from '../models/course';
import { v4 as uuidv4 } from 'uuid';
import { CourseNotFoundError } from '../models/errors';
import { isTitularInCourse } from './instructor_db';

export const prisma = new PrismaClient();

export const getCourses = async (): Promise<Course[]> => {
  const coursesFromDB = await prisma.course.findMany();

  return coursesFromDB.map((course: {
    id: string;
    name: string;
    description: string;
    shortDescription: string;
    startDate: Date;
    endDate: Date;
    capacity: number;
    enrolled: number;
    category: string;
    level: string;
    modality: string;
    prerequisites: string;
    imageUrl: string;
    creatorId: string;
  }): Course => ({
    id: course.id,
    name: course.name,
    description: course.description,
    shortDescription: course.shortDescription,
    startDate: course.startDate.toISOString(),
    endDate: course.endDate.toISOString(),
    capacity: course.capacity,
    enrolled: course.enrolled,
    category: course.category,
    level: course.level as Course['level'],
    modality: course.modality as Course['modality'],
    prerequisites: course.prerequisites.split(','),
    imageUrl: course.imageUrl,
    creatorId: course.creatorId,
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
    capacity: course.capacity,
    enrolled: course.enrolled,
    category: course.category,
    level: course.level as Course['level'],
    modality: course.modality as Course['modality'],
    prerequisites: course.prerequisites.split(','),
    imageUrl: course.imageUrl,
    creatorId: course.creatorId,
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
      capacity: course.capacity,
      enrolled: course.enrolled,
      category: course.category,
      level: course.level,
      modality: course.modality,
      prerequisites: course.prerequisites.join(','),
      imageUrl: course.imageUrl,
      creatorId: course.creatorId,
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
    capacity: deleted.capacity,
    enrolled: deleted.enrolled,
    category: deleted.category,
    level: deleted.level as Course['level'],
    modality: deleted.modality as Course['modality'],
    prerequisites: deleted.prerequisites.split(','),
    imageUrl: deleted.imageUrl,
    creatorId: deleted.creatorId,
  };
};

export const updateCourse = async (id: string, updateData: Partial<Course>, instructorId: string): Promise<Course | null> => {
  const existingCourse = await prisma.course.findUnique({ where: { id } });

  if (!existingCourse) {
    return null;
  }

  const updated = await prisma.course.update({
    where: { id },
    data: {
      name: updateData.name ?? existingCourse.name,
      description: updateData.description ?? existingCourse.description,
      shortDescription: updateData.shortDescription ?? existingCourse.shortDescription,
      startDate: updateData.startDate ? new Date(updateData.startDate) : existingCourse.startDate,
      endDate: updateData.endDate ? new Date(updateData.endDate) : existingCourse.endDate,
      capacity: updateData.capacity ?? existingCourse.capacity,
      enrolled: updateData.enrolled ?? existingCourse.enrolled,
      category: updateData.category ?? existingCourse.category,
      level: updateData.level ?? existingCourse.level,
      modality: updateData.modality ?? existingCourse.modality,
      prerequisites: updateData.prerequisites
        ? updateData.prerequisites.join(',')
        : existingCourse.prerequisites,
      imageUrl: updateData.imageUrl ?? existingCourse.imageUrl,
      creatorId: updateData.creatorId ?? existingCourse.creatorId,
    },
  });

  const isTitular = await isTitularInCourse(existingCourse.id, instructorId);
  if (!isTitular && instructorId !== "") {
    await prisma.courseActivityLog.create({
      data: {
        course_id: existingCourse.id,
        user_id: instructorId,
        action: "update_course",
        metadata: {
          course_id: updated.id,
          course_name: updated.name,
          course_description: updated.description,
        },
      },
    });
  }

  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    shortDescription: updated.shortDescription,
    startDate: updated.startDate.toISOString(),
    endDate: updated.endDate.toISOString(),
    capacity: updated.capacity,
    enrolled: updated.enrolled,
    category: updated.category,
    level: updated.level as Course['level'],
    modality: updated.modality as Course['modality'],
    prerequisites: updated.prerequisites.split(','),
    imageUrl: updated.imageUrl,
    creatorId: updated.creatorId,
  };
};

// Retrieves all courses for a specific user ID
// Returns an array of Course objects
// Throws an error if the user is not found
export const getCoursesByUserId = async (userId: string): Promise<Course[]> => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: true,
    },
  });

  if (enrollments.length === 0) {
    throw new CourseNotFoundError(`No courses found for user with ID ${userId}`);
  }

  return enrollments.map((enrollment) => ({
    id: enrollment.course.id,
    name: enrollment.course.name,
    description: enrollment.course.description,
    shortDescription: enrollment.course.shortDescription,
    startDate: enrollment.course.startDate.toISOString(),
    endDate: enrollment.course.endDate.toISOString(),
    capacity: enrollment.course.capacity,
    enrolled: enrollment.course.enrolled,
    category: enrollment.course.category,
    level: enrollment.course.level as Course['level'],
    modality: enrollment.course.modality as Course['modality'],
    prerequisites: enrollment.course.prerequisites.split(','),
    imageUrl: enrollment.course.imageUrl,
    creatorId: enrollment.course.creatorId,
  }));
}

export const getCourseActivityLog = async (courseId: string): Promise<any[]> => {
  const courseActivityLog = await prisma.courseActivityLog.findMany({
    where: { course_id: courseId },
  });

  return courseActivityLog.map((log) => ({
    id: log.id,
    courseId: log.course_id,
    userId: log.user_id,
    action: log.action,
    metadata: log.metadata,
    createdAt: log.created_at.toISOString(),
  }));
}










