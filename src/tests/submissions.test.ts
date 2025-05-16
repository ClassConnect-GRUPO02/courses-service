import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';

describe('Integration Tests for resources of Courses API', () => {
  describe('GET /tasks/:taskId/submissions/:studentId', () => {
    it('should return 200 and the task submission for a valid taskId and studentId', async () => {
      const taskId = 't1';
      const studentId = 'u2';

      const response = await request(app)
        .get(`/tasks/${taskId}/submissions/${studentId}`)
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 404 if the task submission is not found', async () => {
      const taskId = 'invalidTaskId';
      const studentId = 'invalidStudentId';

      const response = await request(app)
        .get(`/tasks/${taskId}/submissions/${studentId}`)
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('PATCH /tasks/:taskId/submissions/:studentIt/feedback', () => {
    it('should return 200 and the updated task submission for valid data', async () => {
      const taskId = 't1';
      const studentId = 'u2';
      const feedback = { grade: 85, feedback: 'Good job!' };

      const response = await request(app)
        .patch(`/tasks/${taskId}/submissions/${studentId}/feedback`)
        .send({ studentId, ...feedback });
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 404 if the task submission is not found', async () => {
      const taskId = 'invalidTaskId';
      const studentId = 'invalidStudentId';
      const feedback = { grade: 85, feedback: 'Good job!' };

      const response = await request(app)
        .patch(`/tasks/${taskId}/submissions/feedback`)
        .send({ studentId, ...feedback });
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});