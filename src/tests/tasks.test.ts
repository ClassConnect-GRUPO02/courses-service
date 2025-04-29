import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';

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
});