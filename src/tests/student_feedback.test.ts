import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockStudentFeedbackData } from './mocks/mock.student_feedback';

describe('Integration Tests for Student Feedback API', () => {
  describe('POST /courses/:courseId/students/:studentId/feedback', () => {
    it('should add feedback to a student', async () => {
      const courseId = 'c2';
      const studentId = 'u7';
      const response = await request(app)
        .post(`/courses/${courseId}/students/${studentId}/feedback`)
        .send(mockStudentFeedbackData);
      expect(response.status).toBe(StatusCodes.CREATED);
      const createdFeedback = response.body.data;
      expect(createdFeedback.instructor_id).toBe(mockStudentFeedbackData.instructor_id);
      expect(createdFeedback.comment).toBe(mockStudentFeedbackData.comment);
      expect(createdFeedback.punctuation).toBe(mockStudentFeedbackData.punctuation);
    });

    it('should return 400 if feedback already exists', async () => {
      const courseId = 'c2';
      const studentId = 'u7';
      const response = await request(app)
        .post(`/courses/${courseId}/students/${studentId}/feedback`)
        .send(mockStudentFeedbackData);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 403 if user is not instructor', async () => {
      const courseId = 'c1';
      const studentId = 'u3';
      const response = await request(app)
        .post(`/courses/${courseId}/students/${studentId}/feedback`)
        .send(mockStudentFeedbackData);
      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it ('should return 403 if student is not enrolled in course', async () => {
      const courseId = 'c2';
      const studentId = 'u4';
      const response = await request(app)
        .post(`/courses/${courseId}/students/${studentId}/feedback`)
        .send(mockStudentFeedbackData);
      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('GET /students/:studentId/feedback', () => {
    it('should get feedbacks for a student', async () => {
      const studentId = 'u2';
      const response = await request(app)
        .get(`/students/${studentId}/feedback`);
      expect(response.status).toBe(StatusCodes.OK);
      const feedbacks = response.body.data;
      expect(feedbacks.length).toBe(1);
    });
  });

});