import { AlreadyInstructorError, CourseNotFoundError, NotInstructorError, NotTitularError } from '../models/errors';
import * as database from '../database/course_db';
import * as databaseInstructor from '../database/instructor_db';

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

export const getInstructorPermissions = async (courseId: string, instructorId: string): Promise<any> => {
  const course = await database.getCourseById(courseId);
  if (!course) {
    throw new CourseNotFoundError(`Course with ID ${courseId} not found`);
  }
  const isInstructor = await databaseInstructor.isInstructorInCourse(courseId, instructorId);
  if (!isInstructor) {
    throw new NotInstructorError(courseId, instructorId);
  }
  return await databaseInstructor.getInstructorPermissions(courseId, instructorId);
}