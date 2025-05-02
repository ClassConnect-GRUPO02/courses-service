import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockTaskRequestData } from './mocks/mock.task';

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
});