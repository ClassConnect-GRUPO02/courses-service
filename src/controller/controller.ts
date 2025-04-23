import { Request, Response, NextFunction } from 'express';
import * as courseService from '../service/service';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import { Course } from '../models/course';
import { Module } from '../models/module';
import { Enrollment } from '../models/enrollment';
import { Resource } from '../models/resource';

export const getCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courses = await courseService.getAllCourses();
    res.status(StatusCodes.OK).json({ data: courses });
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourse(id);
    res.status(StatusCodes.OK).json(course);
  } catch (error) {
    next(error);
  }
};

export const addCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseData: Course = req.body;

    logger.debug('BODY RECIBIDO:', JSON.stringify(courseData, null, 2));
    const course = new Course(courseData);

    const createdCourse = await courseService.createCourse(course);
    if (createdCourse) {
      const instructor = await courseService.addInstructorToCourse(createdCourse.id, courseData.creatorId, "TITULAR");
      if (instructor) {
        logger.info('Instructor added');
      } else {
        logger.info('Instructor not added');
      }
    }
    res.status(StatusCodes.CREATED).json({ data: createdCourse });
    logger.info('Course added successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      handleInvalidRequestError(res, 'Invalid course ID');
      return;
    }

    const deletedCourse = await courseService.removeCourse(id);

    if (!deletedCourse || Object.keys(deletedCourse).length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({ error: `Course with ID ${id} not found` });
      return;
    } else {
      logger.debug('Course deleted:', deletedCourse);
    }

    res.status(StatusCodes.NO_CONTENT).send();
    logger.info(`Course with ID ${id} deleted successfully`);
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const courseData: Partial<Course> = req.body;

    const updatedCourse = await courseService.updateCourse(id, courseData);

    if (!updatedCourse) {
      res.status(StatusCodes.NOT_FOUND).json({ error: `Course with ID ${id} not found` });
      return;
    }

    res.status(StatusCodes.OK).json({ data: updatedCourse });
    logger.info(`Course with ID ${id} updated successfully`);
  } catch (error) {
    next(error);
  }
};

// -------------------------- MODULES --------------------------

export const addModuleToCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const moduleData = req.body;
    const module = new Module(moduleData);
    const createdModule = await courseService.addModuleToCourse(id, module);
    res.status(StatusCodes.CREATED).json({ data: createdModule });
    logger.info(`Module added to course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const deleteModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, moduleId } = req.params;
    if (!id || !moduleId) {
      handleInvalidRequestError(res, 'Invalid course or module ID');
      return;
    }
    await courseService.removeModule(id, moduleId);
    res.status(StatusCodes.NO_CONTENT).send();
    logger.info(`Module with ID ${moduleId} deleted from course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const getModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const modules = await courseService.getModules(id);
    res.status(StatusCodes.OK).json({ data: modules });
    logger.info(`Modules retrieved for course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const getModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, moduleId } = req.params;
    const module = await courseService.getModuleById(id, moduleId);
    res.status(StatusCodes.OK).json({ data: module });
    logger.info(`Module with ID ${moduleId} retrieved from course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

export const updateModuleOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseId = req.params.id;
    const { orderedModuleIds } = req.body;

    if (!Array.isArray(orderedModuleIds) || orderedModuleIds.length === 0) {
      res.status(400).json({ error: 'orderedModuleIds must be a non-empty array.' });
      return;
    }

    await courseService.updateModulesOrder(courseId, orderedModuleIds);

    res.status(200).json({ message: 'Module order updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, moduleId } = req.params;
    const moduleData: Partial<Module> = req.body;
    const updatedModule = await courseService.updateModule(id, moduleId, moduleData);
    if (!updatedModule) {
      res.status(StatusCodes.NOT_FOUND).json({ error: `Module with ID ${moduleId} not found in course ${id}` });
      return;
    }
    res.status(StatusCodes.OK).json({ data: updatedModule });
    logger.debug("Module updated:", updatedModule);
  } catch(error) {
    logger.error("Error updating module:", error);
    next(error);
  }
}


// -------------------------- ENROLLMENT --------------------------

export const enrollStudentToCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseId = req.params.id;
    const { userId } = req.body;
    
    if (!userId) {
      handleInvalidRequestError(res, 'Student ID is required');
      return;
    }

    const enrollment = new Enrollment({ courseId, userId });
    const enrolledCourse = await courseService.enrollStudent(enrollment);
    res.status(StatusCodes.OK).json({ data: enrolledCourse });
    logger.info(`Student with ID ${userId} enrolled in course with ID ${courseId} successfully`);
  } catch (error) {
    console.error('Error during enrollment:', error);
    next(error);
  }
};

export const getCoursesByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const courses = await courseService.getCoursesByUserId(id);
    res.status(StatusCodes.OK).json({ data: courses });
    logger.info(`Courses retrieved for user with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const isEnrolledInCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const isEnrolled = await courseService.isEnrolledInCourse(id, userId);
    res.status(StatusCodes.OK).json({ isEnrolled: isEnrolled });
    logger.info(`Enrollment status checked for user with ID ${userId} in course with ID ${id}`);
  }
  catch (error) {
    next(error)
  }
};

// -------------------------- INSTRUCTORS --------------------------

export const isInstructorInCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, instructorId } = req.params;
    const isInstructor = await courseService.isInstructorInCourse(id, instructorId);
    res.status(StatusCodes.OK).json({ isInstructor: isInstructor });
    logger.info(`Instructor status checked for user with ID ${instructorId} in course with ID ${id}`);
  } catch (error) {
    next(error);
  }
}

// -------------------------- ERROR HANDLING --------------------------

/*const handleCourseNotFoundError = (error: CourseNotFoundError, req: Request, res: Response): void => {
  res.status(error.status).json({
    type: error.type,
    title: 'Course Not Found',
    detail: error.detail,
    instance: req.originalUrl,
  });
};*/

const handleInvalidRequestError = (res: Response, detail: string): void => {
  const errorResponse = {
    type: 'https://example.com/bad-request',
    title: 'Invalid Request',
    status: StatusCodes.BAD_REQUEST,
    detail,
    instance: res.req.originalUrl,
  };
  res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  logger.debug('Invalid Request');
};

/*const handleUnknownError = (res: Response, error: unknown): void => {
  const errorResponse = {
    type: 'https://example.com/internal-server-error',
    title: 'Internal Server Error',
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    detail: 'An unexpected error occurred.',
    instance: res.req.originalUrl,
  };
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  logger.error('Internal Server Error:', error);
};*/

// -------------------------- RESOURCES -------------------------------------

export const addResourceToModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const resourceData = req.body;
    const newResource = new Resource(resourceData);
    const resource = await courseService.addResourceToModule( moduleId, newResource);
    res.status(StatusCodes.CREATED).json({ data: resource });
    logger.debug(`Resource added to module with ID ${moduleId} successfully`);
  } catch (error) {
    logger.debug('Error adding resource:', error);
    next(error);
  }
}

// Deletes a resource from a module
export const deleteResourceFromModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { moduleId, resourceId } = req.params;
    if (!moduleId || !resourceId) {
      handleInvalidRequestError(res, 'Invalid module or resource ID');
      return;
    }
    await courseService.deleteResourceFromModule(moduleId, resourceId);
    res.status(StatusCodes.NO_CONTENT).send();
    logger.debug(`Resource with ID ${resourceId} deleted from module with ID ${moduleId} successfully`);
  } catch (error) {
    next(error);
  }
}

// Get resources from a module
export const getResourcesByModuleId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const resources = await courseService.getResourcesByModuleId(moduleId);
    res.status(StatusCodes.OK).json({ data: resources });
    logger.debug(`Resources retrieved from module with ID ${moduleId} successfully`);
  } catch (error) {
    next(error);
  }
}

// Updates a resource in a module
export const updateResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { moduleId, resourceId } = req.params;
    const resourceData: Partial<Resource> = req.body;
    const updatedResource = await courseService.updateResource(moduleId, resourceId, resourceData);
    res.status(StatusCodes.OK).json({ data: updatedResource });
    logger.debug("Resource updated:", updatedResource);
  } catch(error) {
    logger.error("Error updating resource:", error);
    next(error);
  }
}