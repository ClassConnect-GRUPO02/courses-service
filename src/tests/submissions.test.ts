import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { userTypes } from '../lib/user_types';

describe('Integration Tests for resources of Courses API', () => {

  const invalidToken = jwt.sign(
    { id: '',
      userType: userTypes.STUDENT,
     }, // payload
    Buffer.from(process.env.SECRET_KEY as string, "hex"), // secret key
    { algorithm: 'HS256' }
  );

  const studentToken = jwt.sign(
    { id: 'u2',
      userType: userTypes.STUDENT,
     }, // payload
    Buffer.from(process.env.SECRET_KEY as string, "hex"), // secret key
    { algorithm: 'HS256' }
  );

  const instructorToken = jwt.sign(
    { id: 'u1',
      userType: userTypes.INSTRUCTOR,
     }, // payload
    Buffer.from(process.env.SECRET_KEY as string, "hex"), // secret key
    { algorithm: 'HS256' }
  );

  describe('POST /courses/:id/tasks/:taskId/start-exam', () => {
    it('should return 200 and start the exam for a valid taskId', async () => {
      const courseId = 'c1';
      const taskId = 't2';

      const response = await request(app)
        .post(`/courses/${courseId}/tasks/${taskId}/start-exam`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('data');
    });

    xit('should return 404 if the task does not exist', async () => {
      const courseId = 'c1';
      const taskId = 'invalidTaskId';

      const response = await request(app)
        .post(`/courses/${courseId}/tasks/${taskId}/start-exam`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST /courses/:id/tasks/:taskId/submissions', () => {
    it('should return 201 and the task submission for valid data', async () => {
      const courseId = 'c1';
      const taskId = 't1';
      
      const response = await request(app)
        .post(`/courses/${courseId}/tasks/${taskId}/submissions`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: ['Respuesta 1', 'Respuesta 2'],
          file_url: 'https://example.com/solution.pdf',
        });
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toHaveProperty('data');
    });

    xit('should return 400 if the submission data is invalid', async () => {
      const courseId = 'c1';
      const taskId = 't1';

      const response = await request(app)
        .post(`/courses/${courseId}/tasks/${taskId}/submissions`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({}); // Invalid submission data
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    xit('should return 403 if the user is not authorized', async () => {
      const courseId = 'c1';
      const taskId = 't1';

      const response = await request(app)
        .post(`/courses/${courseId}/tasks/${taskId}/submissions`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({
          answers: ['Respuesta 1', 'Respuesta 2'],
          file_url: 'https://example.com/solution.pdf',
        });
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('PATCH /tasks/:taskId/submissions/:studentId/feedback', () => {
    it('should return 200 and the updated task submission for valid data', async () => {
      const taskId = 't1';
      const studentId = 'u2';
      const feedback = { grade: 85, feedback: 'Good job!' };

      const response = await request(app)
        .patch(`/tasks/${taskId}/submissions/${studentId}/feedback`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ ...feedback });
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.grade).toBe(feedback.grade);
      expect(response.body.data.feedback).toBe(feedback.feedback);
    });

    it('should return 404 if the task submission is not found', async () => {
      const taskId = 'invalidTaskId';
      const studentId = 'invalidStudentId';
      const feedback = { grade: 85, feedback: 'Good job!' };

      const response = await request(app)
        .patch(`/tasks/${taskId}/submissions/${studentId}/feedback`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ ...feedback });
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 401 if the user is not authorized', async () => {
      const taskId = 't1';
      const studentId = 'u2';
      const feedback = { grade: 85, feedback: 'Good job!' };

      const response = await request(app)
        .patch(`/tasks/${taskId}/submissions/${studentId}/feedback`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ ...feedback });
      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });
  });






  xdescribe('GET /tasks/:taskId/submissions/:studentId', () => {
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

  xdescribe('PATCH /tasks/:taskId/submissions/:studentId/feedback', () => {
    it('should return 200 and the updated task submission for valid data', async () => {
      const taskId = 't1';
      const studentId = 'u2';
      const feedback = { grade: 85, feedback: 'Good job!' };

      const SECRET_KEY = Buffer.from(process.env.SECRET_KEY as string, "hex");

      const token = jwt.sign(
        { id: 'u1',
          userType: userTypes.INSTRUCTOR,
         }, // payload
        SECRET_KEY!, // clave secreta
        { algorithm: 'HS256' }
      );

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