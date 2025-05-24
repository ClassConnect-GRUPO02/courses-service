import { v4 as uuidv4 } from 'uuid';
import { prisma } from './course_db';
import { $Enums, InstructorType } from '@prisma/client'

export interface InstructorPermissions {
  id: string;
  userId: string;
  courseId: string;
  type: $Enums.InstructorType;
  can_create_content: boolean;
  can_grade: boolean;
  can_update_course: boolean;
}

export const addInstructorToCourse = async (courseId: string, instructorId: string, type: string, can_create_content: boolean, can_grade: boolean, can_update_course: boolean): Promise<boolean> => {
  
  
  const newInstructor = await prisma.courseInstructor.create({
    data: {
      id: uuidv4(),
      courseId,
      userId: instructorId,
      type: type as InstructorType,
      can_create_content,
      can_grade,
      can_update_course
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

export const updateInstructorPermissions = async (courseId: string, instructorId: string, can_create_content: boolean, can_grade: boolean, can_update_course: boolean): Promise<boolean> => {
  const instructor = await prisma.courseInstructor.updateMany({
    where: {
      courseId,
      userId: instructorId,
    },
    data: {
      can_create_content,
      can_grade,
      can_update_course
    },
  });

  return !!instructor;
}

export const getInstructorPermissions = async (
  courseId: string,
  instructorId: string
): Promise<InstructorPermissions | null> => {
  const instructor = await prisma.courseInstructor.findFirst({
    where: {
      courseId,
      userId: instructorId,
    },
  });

  return instructor;
};