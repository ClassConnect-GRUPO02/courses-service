import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockTaskRequestData } from './mocks/mock.task';
import { mockTaskSubmissionData } from './mocks/mock.task_sub';

describe('Integration Tests for tasks of Courses API', () => {
  describe('GET /tasks/student/:studentId', () => {
    it('should retrieve all tasks assigned to a student', async () => {
      const studentId = 'u2';
      const response = await request(app)
        .get(`/tasks/students/${studentId}`)
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
        .send();

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  xdescribe('POST /courses/:id/tasks/:taskId/submit', () => {
    it('should submit a task for a student', async () => {
      const taskSubmission = mockTaskSubmissionData;
      const courseId = 'c1';
      const taskId = 't2';

      const response = await request(app)
        .post(`/courses/${courseId}/tasks/${taskId}/submissions`)
        .send(taskSubmission);

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.message).toBe('Entrega registrada exitosamente');
    });
    it('should raise an error because of late submission', async () => {
      // Simulate a late submission (The task 't4' policy does not allow late submissions)
      const taskSubmission = mockTaskSubmissionData;
      const courseId = 'c1';
      const taskId = 't4';
      
      const response = await request(app)
      .post(`/courses/${courseId}/tasks/${taskId}/submissions`)
      .send(taskSubmission);
      
      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('GET /instructors/:instructorId/tasks', () => {
    it('should retrieve all tasks for an instructor', async () => {
      const instructorId = 'i1';
      const page = 1;
      const pageSize = 10;

      const response = await request(app)
        .get(`/instructors/${instructorId}/tasks?page=${page}&pageSize=${pageSize}`)
        .send();

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});