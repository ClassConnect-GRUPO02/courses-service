import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';


const token = jwt.sign(
  { id: 'u1' }, // payload
  process.env.SECRET_KEY!, // clave secreta
  { algorithm: 'HS256' }
);


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

  describe('PATCH /tasks/:taskId/submissions/:studentId/feedback', () => {
    it('should return 200 and the updated task submission for valid data', async () => {
      const taskId = 't1';
      const studentId = 'u2';
      const feedback = { grade: 85, feedback: 'Good job!' };

      const response = await request(app)
        .patch(`/tasks/${taskId}/submissions/${studentId}/feedback`)
        .set('Authorization', `Bearer ${token}`)
        .send({...feedback});
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

    it('should return 403 if the user is not authorized', async () => {
      const taskId = 't1';
      const studentId = 'u2';
      const feedback = { grade: 85, feedback: 'Good job!' };

      const response = await request(app)
        .patch(`/tasks/${taskId}/submissions/${studentId}/feedback`)
        .set('Authorization', `Bearer invalidToken`)
        .send({ ...feedback });
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });
});