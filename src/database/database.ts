import { InstructorType, PrismaClient } from '@prisma/client';
import { Course } from '../models/course';
import { v4 as uuidv4 } from 'uuid';
import { CourseNotFoundError, ModuleNotFoundError } from '../models/errors';
import { Module } from '../models/module';
import { Enrollment } from '../models/enrollment';
import { Task } from '../models/task';
import { Resource } from '../models/resource';

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


export const addTaskToCourse = async (courseId: string, task: Task): Promise<Task> => {

  const newTask = await prisma.task.create({
    data: {
      id: uuidv4(),
      course_id: courseId,
      created_by: task.created_by,
      type: task.type,
      title: task.title,
      description: task.description,
      instructions: task.instructions,
      due_date: new Date(task.due_date),
      allow_late: task.allow_late,
      late_policy: task.late_policy,
      has_timer: task.has_timer,
      time_limit_minutes: task.time_limit_minutes ?? null,
      published: task.published,
      visible_from: task.visible_from ? new Date(task.visible_from) : null,
      visible_until: task.visible_until ? new Date(task.visible_until) : null,
      allow_file_upload: task.allow_file_upload,
      answer_format: task.answer_format,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    },
  });

  return {
    ...newTask,
    id: newTask.id,
    due_date: newTask.due_date.toISOString(),
    visible_from: newTask.visible_from ? newTask.visible_from.toISOString() : null,
    visible_until: newTask.visible_until ? newTask.visible_until.toISOString() : null,
    created_at: newTask.created_at.toISOString(),
    updated_at: newTask.updated_at.toISOString(),
    deleted_at: newTask.deleted_at ? newTask.deleted_at.toISOString() : null,
  };
}

export const updateTask = async (courseId: string, taskId: string, task: Partial<Task>): Promise<Task> => {
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!existingTask) {
    throw new Error(`Task with ID ${taskId} not found`);
  }


  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      id: existingTask.id,
      course_id: courseId,
      created_by: existingTask.created_by,
      type: task.type ?? existingTask.type,
      title: task.title ?? existingTask.title,
      description: task.description ?? existingTask.description,
      instructions: task.instructions ?? existingTask.instructions,
      due_date: task.due_date ? new Date(task.due_date) : existingTask.due_date,
      allow_late: task.allow_late ?? existingTask.allow_late,
      late_policy: task.late_policy ?? existingTask.late_policy,
      has_timer: task.has_timer ?? existingTask.has_timer,
      time_limit_minutes: task.time_limit_minutes ?? existingTask.time_limit_minutes,
      published: task.published ?? existingTask.published,
      visible_from: task.visible_from ? new Date(task.visible_from) : existingTask.visible_from,
      visible_until: task.visible_until ? new Date(task.visible_until) : existingTask.visible_until,
      allow_file_upload: task.allow_file_upload ?? existingTask.allow_file_upload,
      answer_format: task.answer_format ?? existingTask.answer_format,
      created_at: existingTask.created_at,
      updated_at: new Date(),
      deleted_at: existingTask.deleted_at,
    },
  });

  return {
    ...updatedTask,
    id: updatedTask.id,
    due_date: updatedTask.due_date.toISOString(),
    visible_from: updatedTask.visible_from ? updatedTask.visible_from.toISOString() : null,
    visible_until: updatedTask.visible_until ? updatedTask.visible_until.toISOString() : null,
    created_at: updatedTask.created_at.toISOString(),
    updated_at: updatedTask.updated_at.toISOString(),
    deleted_at: updatedTask.deleted_at ? updatedTask.deleted_at.toISOString() : null,
  };
}

export const deleteTask = async (taskId: string): Promise<string> => {
  const deleted = await prisma.task.delete({
    where: { id: taskId },
  });

  return deleted.id;
}

export const getTasksByCourseId = async (courseId: string): Promise<Task[]> => {
  const tasks = await prisma.task.findMany({
    where: { course_id: courseId },
  });

  return tasks.map((task) => ({
    ...task,
    due_date: task.due_date.toISOString(),
    visible_from: task.visible_from ? task.visible_from.toISOString() : null,
    visible_until: task.visible_until ? task.visible_until.toISOString() : null,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
    deleted_at: task.deleted_at ? task.deleted_at.toISOString() : null,
  }));
}

export const getTaskById = async (courseId: string, taskId: string): Promise<Task | null> => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      course_id: courseId,
    },
  });

  if (!task) {
    return null;
  }

  return {
    ...task,
    due_date: task.due_date.toISOString(),
    visible_from: task.visible_from ? task.visible_from.toISOString() : null,
    visible_until: task.visible_until ? task.visible_until.toISOString() : null,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
    deleted_at: task.deleted_at ? task.deleted_at.toISOString() : null,
  };
}



// ---------------------- RESOURCE --------------------------------------

export const addResourceToModule = async (moduleId: string, resource: Resource): Promise<Resource> => {
  const newResource = await prisma.resource.create({
    data: {
      id: uuidv4(),
      description: resource.description,
      type: resource.type,
      url: resource.url,
      order: resource.order,
      moduleId: moduleId,
    },
  });

  return {...newResource, id: newResource.id };
}

export const deleteResourceFromModule = async (moduleId: string, resourceId: string): Promise<boolean> => {
  const resource = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      moduleId: moduleId,
    },
  });

  if (!resource) {
    return false;
  }

  await prisma.resource.delete({
    where: { id: resourceId },
  });
  return true;
}

// Get resources by module ID
// returns an array of Resource objects or an empty array if none are found
export const getResourcesByModuleId = async (moduleId: string): Promise<Resource[]> => {
  const resources = await prisma.resource.findMany({
    where: { moduleId },
    orderBy: { order: 'asc' },
  });

  return resources.map((resource) => ({
    ...resource,
    id: resource.id,
  }));
}

// Updates resource by ID inside module
// Returns the updated Resource object or null if not found
export const updateResource = async (moduleId: string, resourceId: string, updateData: Partial<Resource>): Promise<Resource | null> => {
  const existingResource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!existingResource) {
    return null;
  }

  const updatedResource = await prisma.resource.update({
    where: { id: resourceId },
    data: {
      description: updateData.description ?? existingResource.description,
      type: updateData.type ?? existingResource.type,
      url: updateData.url ?? existingResource.url,
      order: updateData.order ?? existingResource.order,
    },
  });

  return updatedResource;
}

// Updates resources order in module
export const updateResourcesOrder = async (moduleId: string, orderedResourceIds: string[]): Promise<void> => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
  });

  if (!module) {
    throw new ModuleNotFoundError(`Module with ID ${moduleId} not found`);
  }

  await Promise.all(
    orderedResourceIds.map((resourceId, index) =>
      prisma.resource.updateMany({
        where: { id: resourceId, moduleId },
        data: { order: index },
      })
    )
  );
}