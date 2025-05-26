import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import { Task } from '../models/task';
import { handleInvalidRequestError } from './course_controller';
import * as taskService from '../service/task_service';
import { AuthenticatedRequest } from "../lib/auth"
import { userTypes } from '../lib/user_types';


// -------------------------- TASKS / EXAMS ---------------------------

export const addTaskToCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const taskData = req.body;
    const instructorId = req.user?.Id; // extraído del JWT
    if (!instructorId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing instructor ID" });
      return;
    }
    const task = new Task(taskData);
    const createdTask = await taskService.addTaskToCourse(id, task, instructorId);
    res.status(StatusCodes.CREATED).json({ data: createdTask });
    logger.info(`Task added to course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

export const updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, taskId } = req.params;
    const taskData: Partial<Task> = req.body;
    const instructorId = req.user?.Id; // extraído del JWT
    if (!instructorId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing instructor ID" });
      return;
    }
    const updatedTask = await taskService.updateTask(id, taskId, taskData, instructorId);
    res.status(StatusCodes.OK).json({ data: updatedTask });
    logger.info(`Task with ID ${taskId} updated in course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

export const deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, taskId } = req.params;
    if (!id || !taskId) {
      handleInvalidRequestError(res, 'Invalid course or task ID');
      return;
    }
    const instructorId = req.user?.Id; // extraído del JWT
    if (!instructorId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing instructor ID" });
      return;
    }
    await taskService.removeTask(id, taskId, instructorId);
    res.status(StatusCodes.NO_CONTENT).send();
    logger.info(`Task with ID ${taskId} deleted from course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const tasks = await taskService.getTasks(id);
    res.status(StatusCodes.OK).json({ data: tasks });
    logger.info(`Tasks retrieved for course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

export const getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, taskId } = req.params;
    const task = await taskService.getTaskById(taskId);
    res.status(StatusCodes.OK).json({ data: task });
    logger.info(`Task with ID ${taskId} retrieved from course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

// -------------------------- COMPLETE TASKS (STUDENTS) ---------------------------
export const submitTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, taskId } = req.params;
    const { student_id , answers, fileUrl } = req.body;
    const submission = await taskService.submitTask(id, taskId, student_id, answers, fileUrl);
    res.status(StatusCodes.CREATED).json({ data: submission });
    logger.info(`Task with ID ${taskId} submitted for course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

// -------------------------- INSTRUCTORS ---------------------------
export const listTasksByInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { instructorId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await taskService.getTasksByInstructor(instructorId, page, pageSize);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// -------------------------- GET TASKS BY STUDENT ID ---------------------------

// This endpoint retrieves all tasks assigned to a specific student
// It is assumed that the student ID is passed as a URL parameter
// Example: GET /tasks/students/:studentId
export const getTasksByStudentId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;
    const tasks = await taskService.getTasksByStudentId(studentId);
    res.status(StatusCodes.OK).json({ data: tasks });
    logger.info(`Tasks retrieved for student with ID ${studentId} successfully`);
  } catch (error) {
    next(error);
  }
}

// -------------------------- GRADE TASK ---------------------------

// Adds feedback to a task
// This endpoint is used to grade a task by the instructor
// router.patch('/tasks/:taskId/submissions/feedback', taskController.addFeedbackToTask)
export const addFeedbackToTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskId, studentId } = req.params;
    const { grade, feedback } = req.body;
    const teacherId = req.user?.Id; // extraído del JWT
    const userType = req.user?.userType; // extraído del JWT
    if (userType !== userTypes.INSTRUCTOR) {
      res.status(StatusCodes.FORBIDDEN).json({ message: "Only instructors can add feedback" });
      return;
    }

    if (!teacherId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing teacher ID" });
      return;
    }

    const updatedSubmission = await taskService.addFeedbackToTask(taskId, studentId, grade, feedback, teacherId);
    res.status(StatusCodes.OK).json({ data: updatedSubmission });
    logger.info(`Feedback added to task with ID ${taskId} successfully`);
  } catch (error) {
    next(error);
  }
};

// Retrieves a specific task submission for a student
// This endpoint is used to get the submission details for a specific task
// router.get('/tasks/:taskId/submissions/:studentId', taskController.getTaskSubmission)
export const getTaskSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskId, studentId } = req.params;
    const submission = await taskService.getTaskSubmission(taskId, studentId);
    res.status(StatusCodes.OK).json({ data: submission });
    logger.info(`Task submission retrieved for task with ID ${taskId} and student with ID ${studentId} successfully`);
  } catch (error) {
    next(error);
  }
}

// Retrieves all task submissions for a specific task
// This endpoint is used to get all submissions for a specific task it must only be used by the instructors
// router.get('/courses/:id/instructors/:instructorId/tasks/:taskId/submissions', taskController.getTaskSubmissions)
export const getTaskSubmissions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.userType !== userTypes.INSTRUCTOR) {
      res.status(StatusCodes.FORBIDDEN).json({ message: "Only instructors can access task submissions" });
      return;
    } else if (req.user?.Id !== req.params.instructorId) {
      res.status(StatusCodes.FORBIDDEN).json({ message: "You are not authorized to access this resource" });
      return;
    }
    const { id, instructorId, taskId } = req.params;
    const submissions = await taskService.getTaskSubmissions(id, instructorId, taskId);
    res.status(StatusCodes.OK).json({ data: submissions });
    logger.info(`Task submissions retrieved for task with ID ${taskId} successfully`);
  } catch (error) {
    next(error);
  }
}


// Generates a resume of the feedback provided (Only used by instructors)
export const getFeedbackWithAI = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { taskSubmissionId } = req.params;
    const userId = req.user?.Id;
    const userType = req.user?.userType;

    if (!userId || !userType) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
      return;
    } else if (userType !== userTypes.INSTRUCTOR) {
      res.status(StatusCodes.FORBIDDEN).json({ error: 'Only instructors can do this operation' });
      return;
    }
    logger.debug(`User ID: ${userId}, User Type: ${userType}`);

    const response = await taskService.getFeedbackWithAI(taskSubmissionId, userId);
    res.status(StatusCodes.OK).json({ data: response });

  } catch (error) {
    logger.error('Error getting feedback with IA:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
}