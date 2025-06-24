import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { userTypes } from '../lib/user_types';
import { mockTaskSubmissionData } from './mocks/mock.task_sub';

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
      const taskId = 't2';
      
      const response = await request(app)
        .post(`/courses/${courseId}/tasks/${taskId}/submissions`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(mockTaskSubmissionData);
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 403 if the user is not authorized', async () => {
      const courseId = 'c1';
      const taskId = 't1';

      const response = await request(app)
        .post(`/courses/${courseId}/tasks/${taskId}/submissions`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .send(mockTaskSubmissionData);
      expect(response.status).toBe(StatusCodes.FORBIDDEN);
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

  describe('GET /tasks/:taskId/submissions/:studentId', () => {
    it('should return 200 and the task submission for a valid taskId and studentId', async () => {
      const taskId = 't1';
      const studentId = 'u2';

      const response = await request(app)
        .get(`/tasks/${taskId}/submissions/${studentId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 404 if the task submission is not found', async () => {
      const taskId = 'invalidTaskId';
      const studentId = 'u2';

      const response = await request(app)
        .get(`/tasks/${taskId}/submissions/${studentId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 403 if the user is not authorized', async () => {
      const taskId = 't1';
      const studentId = 'u2';

      const response = await request(app)
        .get(`/tasks/${taskId}/submissions/${studentId}`)
        .set('Authorization', `Bearer ${invalidToken}`);
      expect(response.status).toBe(StatusCodes.FORBIDDEN);
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
        .send({...feedback});
      
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.grade).toBe(85)
      expect(response.body.data.feedback).toBe('Good job!');
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

  describe('GET /courses/:id/instructors/:instructorId/tasks/:taskId/submissions', () => {
    it('should return 200 if an instructor is asking for tasks of his course', async() => {
      const id = "c1";
      const instructorId = "u1";
      const taskId = "t1"

      const response = await request(app)
        .get( `/courses/${id}/instructors/${instructorId}/tasks/${taskId}/submissions`)
        .set('Authorization', `Bearer ${instructorToken}`)

      expect(response.status).toBe(StatusCodes.OK)
    })
  })

  describe('POST /courses/:id/tasks/:taskId/submit', () => {
    it('should submit a task for a student', async () => {
      const taskSubmission = mockTaskSubmissionData;
      const courseId = 'c1';
      const taskId = 't3';

      const response = await request(app)
        .post(`/courses/${courseId}/tasks/${taskId}/submissions`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(taskSubmission);

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.message).toBe('Tarea entregada exitosamente');
    });

    it('should raise an error because of late submission', async () => {
      // Simulate a late submission (The task 't4' policy does not allow late submissions)
      const taskSubmission = mockTaskSubmissionData;
      const courseId = 'c1';
      const taskId = 't4';
      
      const response = await request(app)
      .post(`/courses/${courseId}/tasks/${taskId}/submissions`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send(taskSubmission);
      
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.detail).toBe('La entrega tardía no está permitida para esta tarea')
    });
  });
});