import { AlreadyInstructorError, CourseNotFoundError, NotInstructorError, NotTitularError } from '../models/errors';
import * as database from '../database/course_db';
import * as databaseInstructor from '../database/instructor_db';
import { Instructor, InstructorPermissions } from '../database/instructor_db';

export const addInstructorToCourse = async (courseId: string, instructorId: string, type: string, can_create_content: boolean, can_grade: boolean, can_update_course: boolean): Promise<boolean> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  return await databaseInstructor.addInstructorToCourse(courseId, instructorId, type, can_create_content, can_grade, can_update_course);
}

export const isInstructorInCourse = async (courseId: string, instructorId: string): Promise<boolean> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  return await databaseInstructor.isInstructorInCourse(courseId, instructorId);
}

export const addAuxInstructorToCourse = async (courseId: string, auxiliarId: string, titularId: string, can_create_content: boolean, can_grade: boolean, can_update_course: boolean): Promise<boolean> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const isInstructor = await databaseInstructor.isInstructorInCourse(courseId, titularId);
  if (!isInstructor) {
    throw new NotInstructorError(courseId, titularId);
  }

  const isAuxInstructor = await databaseInstructor.isInstructorInCourse(courseId, auxiliarId);
  if (isAuxInstructor) {
    throw new AlreadyInstructorError(courseId, auxiliarId);
  }

  return await databaseInstructor.addInstructorToCourse(courseId, auxiliarId, "AUXILIAR", can_create_content, can_grade, can_update_course);
}

export const removeInstructorFromCourse = async (courseId: string, auxiliarId: string, titularId: string): Promise<boolean> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const isInstructor = await databaseInstructor.isInstructorInCourse(courseId, auxiliarId);
  if (!isInstructor) {
    throw new NotInstructorError(courseId, auxiliarId);
  }

  const isTitular = await databaseInstructor.isTitularInCourse(courseId, titularId);
  if (!isTitular || titularId === undefined) {
    throw new NotTitularError(courseId, titularId);
  }

  return await databaseInstructor.removeInstructorFromCourse(courseId, auxiliarId);
}

export const updateInstructorPermissions = async (courseId: string, auxiliarId: string, titularId: string, can_create_content: boolean, can_grade: boolean, can_update_course: boolean): Promise<boolean> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const isInstructor = await databaseInstructor.isInstructorInCourse(courseId, auxiliarId);
  if (!isInstructor) {
    throw new NotInstructorError(courseId, auxiliarId);
  }

  const isTitular = await databaseInstructor.isTitularInCourse(courseId, titularId);
  if (!isTitular || titularId === undefined) {
    throw new NotTitularError(courseId, titularId);
  }

  return await databaseInstructor.updateInstructorPermissions(courseId, auxiliarId, can_create_content, can_grade, can_update_course);
}

export const getInstructorPermissions = async (
  courseId: string,
  instructorId: string
): Promise<InstructorPermissions> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }

  const isInstructor = await databaseInstructor.isInstructorInCourse(courseId, instructorId);
  if (!isInstructor) {
    throw new NotInstructorError(courseId, instructorId);
  }

  const permissions = await databaseInstructor.getInstructorPermissions(courseId, instructorId);

  if (!permissions) {
    // Este caso no debería pasar si ya validaste que es instructor, pero por seguridad:
    throw new Error(`Permissions for instructor ${instructorId} in course ${courseId} not found`);
  }

  return permissions;
};

// Receives an instructorId and returns the list of course IDs they are associated with
export const getCoursesIdsByInstructorId = async (instructorId: string): Promise<string[]> => {
  const coursesIds = await databaseInstructor.getCoursesIdsByInstructorId(instructorId);
  return coursesIds
}

export const getInstructorsByCourseId = async (courseId: string): Promise<Instructor[]> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }
  return await databaseInstructor.getInstructorsByCourseId(courseId);
}

export const getCoursesByInstructorId = async (instructorId: string): Promise<string[]> => {
  const courses = await databaseInstructor.getCoursesByInstructorId(instructorId);
  return courses;
}