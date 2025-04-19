import { PrismaClient } from '@prisma/client';
import { Course } from '../models/course';
import { v4 as uuidv4 } from 'uuid';
import { CourseNotFoundError } from '../models/errors';
import { Module } from '../models/module';
import { Enrollment } from '../models/enrollment';

const prisma = new PrismaClient();

export const getCourses = async (): Promise<Course[]> => {
  const coursesFromDB = await prisma.course.findMany();

  return coursesFromDB.map((course: {
    id: string;
    name: string;
    description: string;
    shortDescription: string;
    startDate: Date;
    endDate: Date;
    instructorName: string;
    instructorProfile: string;
    capacity: number;
    enrolled: number;
    category: string;
    level: string;
    modality: string;
    prerequisites: string;
    imageUrl: string;
  }): Course => ({
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
    throw new CourseNotFoundError(`Course with ID ${id} not found`);
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

export const updateCourse = async (id: string, updateData: Partial<Course>): Promise<Course> => {
  const existingCourse = await prisma.course.findUnique({ where: { id } });

  if (!existingCourse) {
    throw new CourseNotFoundError(`Course with ID ${id} not found`);
  }

  const updated = await prisma.course.update({
    where: { id },
    data: {
      name: updateData.name ?? existingCourse.name,
      description: updateData.description ?? existingCourse.description,
      shortDescription: updateData.shortDescription ?? existingCourse.shortDescription,
      startDate: updateData.startDate ? new Date(updateData.startDate) : existingCourse.startDate,
      endDate: updateData.endDate ? new Date(updateData.endDate) : existingCourse.endDate,
      instructorName: updateData.instructor?.name ?? existingCourse.instructorName,
      instructorProfile: updateData.instructor?.profile ?? existingCourse.instructorProfile,
      capacity: updateData.capacity ?? existingCourse.capacity,
      enrolled: updateData.enrolled ?? existingCourse.enrolled,
      category: updateData.category ?? existingCourse.category,
      level: updateData.level ?? existingCourse.level,
      modality: updateData.modality ?? existingCourse.modality,
      prerequisites: updateData.prerequisites
        ? updateData.prerequisites.join(',')
        : existingCourse.prerequisites,
      imageUrl: updateData.imageUrl ?? existingCourse.imageUrl,
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    shortDescription: updated.shortDescription,
    startDate: updated.startDate.toISOString(),
    endDate: updated.endDate.toISOString(),
    instructor: {
      name: updated.instructorName,
      profile: updated.instructorProfile,
    },
    capacity: updated.capacity,
    enrolled: updated.enrolled,
    category: updated.category,
    level: updated.level as Course['level'],
    modality: updated.modality as Course['modality'],
    prerequisites: updated.prerequisites.split(','),
    imageUrl: updated.imageUrl,
  };
};

// Adds a new module to a course
// Throws an error if the course is not found
// Returns the created Module object
export const addModuleToCourse = async (courseId: string, module: Module): Promise<Module | null> => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    return null;
  }
  const newModule = await prisma.module.create({
    data: {
      id: uuidv4(),
      name: module.name,
      description: module.description,
      url: module.url,
      order: module.order,
      courseId: courseId,
    },
  });
  return {
    ...newModule,
    id: newModule.id,
  };
};

// Retrieves all modules for a given course ID
// Returns an array of Module objects
export const getModulesByCourseId = async (courseId: string): Promise<Module[]> => {
  const modules = await prisma.module.findMany({
    where: { courseId },
  });

  return modules.map((module: Module) => ({
    id: module.id,
    name: module.name,
    description: module.description,
    url: module.url,
    order: module.order,
    courseId: module.courseId,
  }));
}

// Deletes a module by its ID returning true if it was found and deleted, false otherwise
export const deleteModule = async (courseId: string, moduleId: string): Promise<boolean> => {
  const module = await prisma.module.findFirst({
    where: {
      id: moduleId,
      courseId: courseId,
    },
  });

  if (!module) {
    return false;
  }

  await prisma.module.delete({
    where: { id: moduleId },
  });
  
  return true;
};


// Retrieves a module by its ID within a specific course
// Returns the Module object or null if it's not found
export const getModuleById = async (courseId: string, moduleId: string): Promise<Module | null> => {
  return await prisma.module.findFirst({
    where: {
      id: moduleId,
      courseId: courseId,
    },
  });
}

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
    instructor: {
      name: enrollment.course.instructorName,
      profile: enrollment.course.instructorProfile,
    },
    capacity: enrollment.course.capacity,
    enrolled: enrollment.course.enrolled,
    category: enrollment.course.category,
    level: enrollment.course.level as Course['level'],
    modality: enrollment.course.modality as Course['modality'],
    prerequisites: enrollment.course.prerequisites.split(','),
    imageUrl: enrollment.course.imageUrl,
  }));
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