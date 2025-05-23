import express from 'express';
import * as courseController from '../controller/course_controller';
import * as moduleController from '../controller/module_controller';
import * as enrollmentController from '../controller/enrollment_controller';
import * as instructorController from '../controller/instructor_controller';
import * as taskController from '../controller/task_controller';
import * as resourceController from '../controller/resource_controller';
import * as feedbackController from '../controller/feedback_controller';
import * as favoritesController from '../controller/favorites_controller';
import { authenticateJWT } from "../lib/auth"

const router = express.Router();

// ----------------------------- COURSES -----------------------------
router.get('/courses', courseController.getCourses);
router.get('/courses/:id', courseController.getCourse);
router.post('/courses', courseController.addCourse);
router.delete('/courses/:id', courseController.deleteCourse);
router.patch('/courses/:id', courseController.updateCourse);

// ----------------------------- MODULES -----------------------------
router.post('/courses/:id/modules', moduleController.addModuleToCourse); // Add module to course
router.delete('/courses/:id/modules/:moduleId', moduleController.deleteModule); // Delete module from course
router.get('/courses/:id/modules', moduleController.getModules); // Get all modules from course
router.get('/courses/:id/modules/:moduleId', moduleController.getModule); // Get module by ID inside course
router.patch('/courses/:id/modules/order', moduleController.updateModuleOrder); // Change modules order
router.patch('/courses/:id/modules/:moduleId', moduleController.updateModule); // Update specific module by ID inside course

// ----------------------------- ENROLLMENTS -----------------------------
router.post('/courses/:id/enrollments', enrollmentController.enrollStudentToCourse); // Enroll student in course
router.get('/users/:id/courses', courseController.getCoursesByUserId); // Get all courses by user ID
router.get('/courses/:id/enrollments', enrollmentController.getEnrollmentsByCourseId); // Get all enrollments by course ID
router.get('/courses/:id/enrollments/:userId', enrollmentController.isEnrolledInCourse);

// ----------------------------- INSTRUCTORS -----------------------------
router.get('/courses/:id/instructors/:instructorId', instructorController.isInstructorInCourse); // Check if user is instructor in course
router.get('/instructors/:instructorId/tasks', taskController.listTasksByInstructor); // GET /instructors/:instructorId/tasks?page=1&pageSize=10
router.post('/courses/:id/instructors/:auxiliarId', instructorController.addInstructorToCourse); // Add instructor to course
router.delete('/courses/:id/instructors/:auxiliarId', instructorController.removeInstructorFromCourse); // Remove instructor from course
router.patch('/courses/:id/instructors/:auxiliarId', instructorController.updateInstructorPermissions); // Update instructor in course
router.get('/courses/:id/instructors/:instructorId/permissions', instructorController.getInstructorPermissions); // Get all instructors by course ID


// ----------------------------- TASKS AND EXAMS -----------------------------
router.post('/courses/:id/tasks', taskController.addTaskToCourse); // Add task to course
router.patch('/courses/:id/tasks/:taskId', taskController.updateTask); // Update task by ID inside course
router.delete('/courses/:id/tasks/:taskId', taskController.deleteTask); // Delete task from course
router.get('/courses/:id/tasks', taskController.getTasks); // Get all tasks from course
router.get('/courses/:id/tasks/:taskId', taskController.getTask); // Get task by ID inside course

router.get('/tasks/students/:studentId', taskController.getTasksByStudentId); // Get all tasks by student ID

// ----------------------------- COMPLETE TASKS (STUDENTS) -----------------------------
router.post('/courses/:id/tasks/:taskId/submissions', taskController.submitTask); // Complete task by ID inside course
router.get('/tasks/:taskId/submissions/:studentId', taskController.getTaskSubmission); // Get task submission by ID inside course

// ----------------------------- ADD FEEDBACK TO TASK --------------------------------
// This endpoint must only be used by instructors
router.patch('/tasks/:taskId/submissions/:studentId/feedback', authenticateJWT, taskController.addFeedbackToTask); // Grade task by ID inside course
router.get('/courses/:id/instructors/:instructorId/tasks/:taskId/submissions', taskController.getTaskSubmissions); // Get all task submissions by ID inside course 

// ----------------------------- RESOURCES -----------------------------
router.post('/modules/:moduleId/resources', resourceController.addResourceToModule); // Add resource to module
router.delete('/modules/:moduleId/resources/:resourceId', resourceController.deleteResourceFromModule); // Delete resource from module
router.get('/modules/:moduleId/resources', resourceController.getResourcesByModuleId); // Get all resources from module
//router.get('/modules/:moduleId/resources/:resourceId', resourceController.getResourceById); // Get resource by ID inside module
router.patch('/modules/:moduleId/resources/order', resourceController.updateResourcesOrder); // Change resources order
router.patch('/modules/:moduleId/resources/:resourceId', resourceController.updateResource); // Update specific resource by ID inside module

// ----------------------------- COURSES FEEDBACK -----------------------------
router.post('/courses/:id/feedback', feedbackController.addFeedbackToCourse); // Add feedback to course
router.get('/courses/:id/feedback', feedbackController.getFeedbacksByCourseId); // Get all feedback by course ID
router.get('/courses/:id/feedback-summary', feedbackController.getCourseFeedbackSummary);

// ------------------------------ STUDENTS FEEDBACK -----------------------------
router.post('/courses/:courseId/students/:studentId/feedback', feedbackController.addFeedbackToStudent); // Add feedback to student
router.get('/students/:studentId/feedback', feedbackController.getFeedbacksAsStudent); // Get all feedback by student ID
router.get('/students/:studentId/feedback-summary', feedbackController.getStudentFeedbackSummary);

// ------------------------------ FAVORITE COURSES -----------------------------
router.post('/students/:studentId/favorite-courses/:courseId', favoritesController.addCourseToFavorites); // Add course to favorites
router.delete('/students/:studentId/favorite-courses/:courseId', favoritesController.removeCourseFromFavorites); // Remove course from favorites
router.get('/students/:studentId/favorite-courses', favoritesController.getFavoriteCourses); // Get all favorite courses by student ID
router.get('/students/:studentId/favorite-courses/:courseId', favoritesController.isCourseFavorite); // Check if course is favorite

export default router;