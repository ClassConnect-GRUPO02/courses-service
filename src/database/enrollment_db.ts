import { v4 as uuidv4 } from 'uuid';
import { prisma } from './course_db';
import { Enrollment } from '../models/enrollment';
import { CourseNotFoundError } from '../models/errors';

// Enrolls a student in a course by its ID in table course_student
// Throws an error if the course is not found or if the student is already enrolled
export const enrollStudent = async (courseId: string, studentId: string): Promise<Enrollment | null> => {
  
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      courseId,
      userId: studentId,
    },
  });

  if (existingEnrollment) {
    return null; // Student is already enrolled
  }
  
  await prisma.enrollment.create({
    data: {
      id: uuidv4(),
      courseId,
      userId: studentId,
      enrollmentDate: new Date().toISOString(),
    },
  });

  const result = await prisma.enrollment.findFirst({
    where: {
      courseId,
      userId: studentId,
    },
  });
  
  if (!result) return null;
  
  return {
    ...result,
    enrollmentDate: result.enrollmentDate.toISOString(), // 👈 conversión a string
  };
}

// Checks if a user is enrolled in a specific course
// Returns true if enrolled, false otherwise
// Throws an error if the course is not found
// or if the user is not found
export const isEnrolledInCourse = async (courseId: string, userId: string): Promise<boolean> => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      courseId,
      userId,
    },
  });

  return !!enrollment;
};