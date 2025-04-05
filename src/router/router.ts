import express from 'express';
import * as courseController from '../controller/controller';

const router = express.Router();

router.get('/courses', courseController.getCourses);
router.get('/courses/:id', courseController.getCourse);
router.post('/courses', courseController.addCourse);
router.delete('/courses/:id', courseController.deleteCourse);

export default router;