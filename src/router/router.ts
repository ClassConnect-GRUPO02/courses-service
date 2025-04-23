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
router.patch('/courses/:id/modules/order', courseController.updateModuleOrder); // Change modules order
router.patch('/courses/:id/modules/:moduleId', courseController.updateModule); // Update specific module by ID inside course

router.post('/courses/:id/enrollments', courseController.enrollStudentToCourse); // Enroll student in course
router.get('/users/:id/courses', courseController.getCoursesByUserId); // Get all courses by user ID
router.get('/courses/:id/enrollments/:userId', courseController.isEnrolledInCourse);

router.get('/courses/:id/instructors/:instructorId', courseController.isInstructorInCourse); // Check if user is instructor in course

router.post('/modules/:moduleId/resources', courseController.addResourceToModule); // Add resource to module
//router.delete('/modules/:moduleId/resources/:resourceId', courseController.deleteResourceFromModule); // Delete resource from module
//router.get('/modules/:moduleId/resources', courseController.getResourcesByModuleId); // Get all resources from module
//router.get('/modules/:moduleId/resources/:resourceId', courseController.getResourceById); // Get resource by ID inside module
//router.patch('/modules/:moduleId/resources/:resourceId', courseController.updateResource); // Update specific resource by ID inside module

export default router;