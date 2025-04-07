import { Course } from '../models/course';
import { CourseNotFoundError } from '../models/errors';

const courses: Record<string, Course> = {};
let lastId = 0;

export const getCourses = (): Course[] => {
  return Object.values(courses);
};

export const getCourseById = (id: string): Course => {
  const course = courses[id];
  if (!course) {
    throw new CourseNotFoundError(id);
  }
  return course;
};

export const addCourse = (course: Course): Course => {
  lastId++;
  const newCourse: Course = {
    ...course,
    id: lastId.toString(),
  };
  courses[newCourse.id] = newCourse;
  return newCourse;
};

export const deleteCourse = (id: string): Course => {
  const course = courses[id];
  if (!course) {
    throw new CourseNotFoundError(id);
  }
  delete courses[id];
  return course;
};

export const resetDatabase = (): void => {
  Object.keys(courses).forEach((key) => delete courses[key]);
  lastId = 0;
};