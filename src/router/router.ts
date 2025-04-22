import express from 'express';
import * as courseController from '../controller/controller';

const router = express.Router();

router.get('/courses', courseController.getCourses);
router.get('/courses/:id', courseController.getCourse);
router.post('/courses', courseController.addCourse);
router.delete('/courses/:id', courseController.deleteCourse);
router.patch('/courses/:id', courseController.updateCourse);

router.post('/courses/:id/modules', courseController.addModuleToCourse); // Add module to course
router.delete('/courses/:id/modules/:moduleId', courseController.deleteModule); // Delete module from course
router.get('/courses/:id/modules', courseController.getModules); // Get all modules from course
router.get('/courses/:id/modules/:moduleId', courseController.getModule); // Get module by ID inside course
// router.patch('/courses/:id/modules/order', courseController.updateModule); // Change modules order
// router.patch('/courses/:id/modules/:moduleId', courseController.updateModule); // Update specific module by ID inside course

router.post('/courses/:id/enrollments', courseController.enrollStudentToCourse); // Enroll student in course
router.get('/users/:id/courses', courseController.getCoursesByUserId); // Get all courses by user ID
router.get('/courses/:id/enrollments/:userId', courseController.isEnrolledInCourse);

router.get('/courses/:id/instructors/:instructorId', courseController.isInstructorInCourse); // Check if user is instructor in course

// ----------------------------- TASKS AND EXAMS -----------------------------
router.post('/courses/:id/tasks', courseController.addTaskToCourse); // Add task to course
router.patch('/courses/:id/tasks/:taskId', courseController.updateTask); // Update task by ID inside course
router.delete('/courses/:id/tasks/:taskId', courseController.deleteTask); // Delete task from course
router.get('/courses/:id/tasks', courseController.getTasks); // Get all tasks from course
router.get('/courses/:id/tasks/:taskId', courseController.getTask); // Get task by ID inside course

export default router;