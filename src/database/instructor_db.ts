import { v4 as uuidv4 } from 'uuid';
import { prisma } from './course_db';
import { InstructorType } from '@prisma/client'

export const addInstructorToCourse = async (courseId: string, instructorId: string, type: string): Promise<boolean> => {
  const newInstructor = await prisma.courseInstructor.create({
    data: {
      id: uuidv4(),
      courseId,
      userId: instructorId,
      type: type as InstructorType,
    },
  });

  return !!newInstructor;
}

export const isInstructorInCourse = async (courseId: string, instructorId: string): Promise<boolean> => {

  const instructor = await prisma.courseInstructor.findFirst({
    where: {
      courseId,
      userId: instructorId,
    },
  });

  return !!instructor;
}

export const isTitularInCourse = async (courseId: string, instructorId: string): Promise<boolean> => {
  if (!instructorId) {
    return false;
  }

  const instructor = await prisma.courseInstructor.findFirst({
    where: {
      courseId,
      userId: instructorId,
      type: 'TITULAR',
    },
  });

  return !!instructor;
}

export const removeInstructorFromCourse = async (courseId: string, instructorId: string): Promise<boolean> => {
  const instructor = await prisma.courseInstructor.deleteMany({
    where: {
      courseId,
      userId: instructorId,
    },
  });

  return !!instructor;
}