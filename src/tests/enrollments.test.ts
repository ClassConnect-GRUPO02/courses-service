import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockCourseRequestData } from './mocks/mock.course';

describe('Integration Tests for Enrollments of Courses API', () => {

  describe('POST /courses/:id/enrollments', () => {
    it('should add student to a course', async () => {
      const response = await request(app).post('/courses').send(mockCourseRequestData);
      expect(response.status).toBe(StatusCodes.CREATED);

      const createdCourseId = response.body.data.id;
      const enrollmentData = {
        userId: "123456789",
      };
      const enrollmentResponse = await request(app)
        .post(`/courses/${createdCourseId}/enrollments`)
        .send(enrollmentData);
      expect(enrollmentResponse.status).toBe(StatusCodes.OK);
      const enrolledCourse = enrollmentResponse.body.data;
      expect(enrolledCourse.courseId).toBe(createdCourseId);
      expect(enrolledCourse.userId).toBe(enrollmentData.userId);
      expect(enrolledCourse.id).toBeDefined();
    });

    it('should return 404 if the course does not exist', async () => {
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {}); // silence console.error
      const nonExistentCourseId = 'non-existent-course-id';
      const enrollmentData = {
        userId: "123456789",
      };
      const response = await request(app)
        .post(`/courses/${nonExistentCourseId}/enrollments`)
        .send(enrollmentData);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      consoleErrorMock.mockRestore(); // Restore original console.error
    });

    it('should return 400 if the student ID is missing', async () => {
      const response = await request(app).post('/courses').send(mockCourseRequestData);
      expect(response.status).toBe(StatusCodes.CREATED);

      const createdCourseId = response.body.data.id;
      const enrollmentResponse = await request(app)
        .post(`/courses/${createdCourseId}/enrollments`)
        .send({}); // Missing userId
      expect(enrollmentResponse.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if the student is already enrolled', async () => {
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {}); // silence console.error
      const response = await request(app).post('/courses').send(mockCourseRequestData);
      expect(response.status).toBe(StatusCodes.CREATED);

      const createdCourseId = response.body.data.id;
      const enrollmentData = {
        userId: "123456789",
      };
      await request(app)
        .post(`/courses/${createdCourseId}/enrollments`)
        .send(enrollmentData);
      const enrollmentResponse = await request(app)
        .post(`/courses/${createdCourseId}/enrollments`)
        .send(enrollmentData);
      expect(enrollmentResponse.status).toBe(StatusCodes.BAD_REQUEST);
      consoleErrorMock.mockRestore();
    });
  });

  describe('GET /courses/:id/enrollments/:userId', () => {
    it('should return if a student is enrolled in a course', async () => {
      const response = await request(app).post('/courses').send(mockCourseRequestData);
      expect(response.status).toBe(StatusCodes.CREATED);

      const createdCourseId = response.body.data.id;
      const enrollmentData = {
        userId: "123456789",
      };
      await request(app)
        .post(`/courses/${createdCourseId}/enrollments/`)
        .send(enrollmentData);
      const enrollmentResponse = await request(app)
        .get(`/courses/${createdCourseId}/enrollments/${enrollmentData.userId}`);
      expect(enrollmentResponse.status).toBe(StatusCodes.OK);
      expect(enrollmentResponse.body.isEnrolled).toBe(true);
    });
  });

  describe('GET /courses/:id/enrollments', () => {
    it('should return all enrollments for a course', async () => {
      const courseId = "c1";
      const enrollmentsResponse = await request(app)
        .get(`/courses/${courseId}/enrollments`);
      expect(enrollmentsResponse.status).toBe(StatusCodes.OK);
      expect(enrollmentsResponse.body.data.length).toBe(5);
    });
  });

  describe('GET /users/:id/courses', () => {
    it('should return all courses for a user ID', async () => {
      const userId = "u3";
      const coursesResponse = await request(app)
        .get(`/users/${userId}/courses`);
      expect(coursesResponse.status).toBe(StatusCodes.OK);
      expect(coursesResponse.body.data.length).toBe(1);
      expect(coursesResponse.body.data[0].id).toBe("c1");
    });
  });
});