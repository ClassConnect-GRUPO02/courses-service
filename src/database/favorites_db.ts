import { v4 as uuidv4 } from 'uuid';
import { prisma } from './course_db';

export const addCourseToFavorites = async (courseId: string, studentId: string) => {
  return await prisma.favoriteCourse.create({
    data: {
      id: uuidv4(),
      course_id: courseId,
      student_id: studentId,
    },
  });
}

export const removeCourseFromFavorites = async (course_id: string, student_id: string) => {
  return await prisma.favoriteCourse.deleteMany({
    where: {
      course_id,
      student_id,
    },
  });
}

export const favoriteAlreadyExists = async (course_id: string, student_id: string): Promise<boolean> => {
  const favorite = await prisma.favoriteCourse.findFirst({
    where: {
      course_id,
      student_id,
    },
  });
  return favorite !== null;
}

export const getFavoriteCourses = async (student_id: string) => {
  return await prisma.favoriteCourse.findMany({
    where: {
      student_id,
    },
  });
}