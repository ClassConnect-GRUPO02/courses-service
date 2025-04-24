import { Enrollment } from '../models/enrollment';
import { CourseNotFoundError, CourseFullError, AlreadyEnrolledError } from '../models/errors';
import * as database from '../database/database';

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

export const isEnrolledInCourse = async (courseId: string, userId: string): Promise<boolean> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }
  return await database.isEnrolledInCourse(courseId, userId);
}
