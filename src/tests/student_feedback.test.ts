import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockStudentFeedbackData } from './mocks/mock.student_feedback';

describe('Integration Tests for Student Feedback API', () => {
  it('should add feedback to a student', async () => {
    const courseId = 'c2';
    const studentId = 'u7';
    const feedbackRequest = mockStudentFeedbackData;
    const response = await request(app)
      .post(`/courses/${courseId}/students/${studentId}/feedback`)
      .send(mockStudentFeedbackData);
    expect(response.status).toBe(StatusCodes.CREATED);
    const createdFeedback = response.body.data;
    expect(createdFeedback.instructor_id).toBe(mockStudentFeedbackData.instructor_id);
    expect(createdFeedback.comment).toBe(mockStudentFeedbackData.comment);
    expect(createdFeedback.punctuation).toBe(mockStudentFeedbackData.punctuation);
  });


});