import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { MockCourseFeedbackRequest } from './mocks/mock.course_feedback';

describe('Integration Tests for Course Feedback API', () => {
  describe('POST /courses/:id/feedback', () => {
    it('should add feedback to a course', async () => {
      const courseId = 'c1';
      const feedbackRequest = MockCourseFeedbackRequest;

      const response = await request(app)
        .post(`/courses/${courseId}/feedback`)
        .send(feedbackRequest);
      expect(response.status).toBe(StatusCodes.CREATED);
      const createdFeedback = response.body.data;
      expect(createdFeedback.student_id).toBe(feedbackRequest.student_id);
      expect(createdFeedback.comment).toBe(feedbackRequest.comment);
      expect(createdFeedback.punctuation).toBe(feedbackRequest.punctuation);
    });

    it('should return 400 if feedback already exists', async () => {
      const courseId = 'c1';
      const feedbackRequest = {
        student_id: 'u2',
        comment: 'Great course!',
        punctuation: 5,
      };
      const response = await request(app)
        .post(`/courses/${courseId}/feedback`)
        .send(feedbackRequest);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it ('should return 403 if student is not enrolled in course', async () => {
      const courseId = 'c2';
      const feedbackRequest = {
        student_id: 'u4',
        comment: 'Great course!',
        punctuation: 5,
      };
      const response = await request(app)
        .post(`/courses/${courseId}/feedback`)
        .send(feedbackRequest);
      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 400 if comment or punctuation is not provided', async () => {
      const courseId = 'c1';
      const feedbackRequest = {
        student_id: 'u2',
        comment: '',
        punctuation: 0,
      };
      const response = await request(app)
        .post(`/courses/${courseId}/feedback`)
        .send(feedbackRequest);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if punctuation is not between 1 and 5', async () => {
      const courseId = 'c2';
      const feedbackRequest = {
        student_id: 'u9',
        comment: 'Great course!',
        punctuation: 6,
      };
      const response = await request(app)
        .post(`/courses/${courseId}/feedback`)
        .send(feedbackRequest);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });
  
  describe('GET /courses/:id/feedback', () => {
    it('should return all feedbacks for a course', async () => {
      const courseId = 'c1';
      const response = await request(app)
        .get(`/courses/${courseId}/feedback`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.length).toBe(2);
    });
  });

  /*
  describe('GET /courses/:id/feedback-summary', () => {
    it('should return feedback summary for a course', async () => {
      const courseId = 'c1';
      const response = await request(app)
        .get(`/courses/${courseId}/feedback-summary`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.summary).toBeDefined();
    });

    it('should return 404 if no feedbacks exist for the course', async () => {
      const courseId = 'c3';
      const response = await request(app)
        .get(`/courses/${courseId}/feedback-summary`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
  */
});