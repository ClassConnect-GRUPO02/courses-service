import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockTaskRequestData } from './mocks/mock.task';
import { mockTaskSubmissionData } from './mocks/mock.task_sub';
import jwt from 'jsonwebtoken';
import { userTypes } from '../lib/user_types';

describe('Integration Tests for tasks of Courses API', () => {

  const SECRET_KEY = Buffer.from(process.env.SECRET_KEY as string, "hex");

  const tokenProfessor = jwt.sign(
    { id: 'u1',
      userType: userTypes.INSTRUCTOR,
      }, // payload
    SECRET_KEY!, // clave secreta
    { algorithm: 'HS256' }
  );

  /*
  const tokenStudent = jwt.sign(
    { id: 'u2',
      userType: userTypes.STUDENT,
      }, // payload
    SECRET_KEY!, // clave secreta
    { algorithm: 'HS256' }
  );
  */

  describe('GET /tasks/student/:studentId', () => {
    it('should retrieve all tasks assigned to a student', async () => {
      const studentId = 'u2';
      const response = await request(app)
        .get(`/tasks/students/${studentId}`)
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send();
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /courses/:id/tasks', () => {
    it('should create a new task for a course', async () => {
      const courseId = 'c1';

      const response = await request(app)
        .post(`/courses/${courseId}/tasks`)
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(mockTaskRequestData);

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(mockTaskRequestData.title);
    });
  });
  describe('PATCH /courses/:id/tasks/:taskId', () => {
    it('should update an existing task for a course', async () => {
      const courseId = 'c1';
      const taskId = 't1';

      const response = await request(app)
        .patch(`/courses/${courseId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(mockTaskRequestData);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(mockTaskRequestData.title);
    });
  });
  describe('DELETE /courses/:id/tasks/:taskId', () => {
    it('should delete a task from a course', async () => {
      const courseId = 'c1';
      const taskId = 't1';

      const response = await request(app)
        .delete(`/courses/${courseId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send();

      expect(response.status).toBe(StatusCodes.NO_CONTENT);
    });
  });
  describe('GET /courses/:id/task/:taskId', () => {
    it('should retrieve a specific task from a course', async () => {
      const courseId = 'c1';
      const taskId = 't2';
      const taskTitle = 'Examen parcial';

      const response = await request(app)
        .get(`/courses/${courseId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send();

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(taskTitle);
    });
  });
  
  describe('GET /courses/:id/tasks', () => {
    it('should retrieve all tasks from a course', async () => {
      const courseId = 'c1';

      const response = await request(app)
        .get(`/courses/${courseId}/tasks`)
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send();

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });


  describe('GET /instructors/:instructorId/tasks', () => {
    it('should retrieve all tasks for an instructor', async () => {
      const instructorId = 'i1';
      const page = 1;
      const pageSize = 10;

      const response = await request(app)
        .get(`/instructors/${instructorId}/tasks?page=${page}&pageSize=${pageSize}`)
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send();

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});