import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockCourseRequestData } from './mocks/mock.course';

describe('Tests for favorite', () => {
  describe('POST /students/:studentId/favorite-courses/:courseId', () => {
    it('should add a course to favorites', async () => {
      const studentId = 'u4';
      const courseId = 'c1';
      const { body } = await request(app)
        .post(`/students/${studentId}/favorite-courses/${courseId}`)
        .send(mockCourseRequestData)
        .expect(StatusCodes.CREATED);
      expect(body).toHaveProperty('data');
      expect(body.data.course_id).toBe(courseId);
      expect(body.data.student_id).toBe(studentId);
    });

    it('should return 403 if course is already favorite', async () => {
      const studentId = 'u1';
      const courseId = 'c1';
      await request(app)
        .post(`/students/${studentId}/favorite-courses/${courseId}`)
        .send(mockCourseRequestData)
        .expect(StatusCodes.FORBIDDEN);
    });

    it('should return 403 if not enrolled in course', async () => {
      const studentId = 'u1';
      const courseId = 'c1';
      await request(app)
        .post(`/students/${studentId}/favorite-courses/${courseId}`)
        .send(mockCourseRequestData)
        .expect(StatusCodes.FORBIDDEN);
    });
  });

  describe('GET /students/:studentId/favorite-courses/:courseId', () => {
    it('should return 200 if course is favorite', async () => {
      const studentId = 'u2';
      const courseId = 'c1';
      const { body } = await request(app)
        .get(`/students/${studentId}/favorite-courses/${courseId}`)
        .expect(StatusCodes.OK);
        expect(body).toHaveProperty('data');
        expect(body.data).toBe(true);
      });
      
      it('should return 200 if course is not favorite', async () => {
        const studentId = 'u5';
        const courseId = 'c1';
        const { body } = await request(app)
        .get(`/students/${studentId}/favorite-courses/${courseId}`)
        .expect(StatusCodes.OK);
        expect(body).toHaveProperty('data');
        expect(body.data).toBe(false);
      });
    });


    describe('GET /students/:studentId/favorite-courses', () => {
      it('should return all favorite courses for a student', async () => {
        const studentId = 'u2';
        const { body } = await request(app)
          .get(`/students/${studentId}/favorite-courses`)
          .expect(StatusCodes.OK);
        expect(body).toHaveProperty('data');
        expect(body.data.length).toBe(1);
      });
    });

    describe('DELETE /students/:studentId/favorite-courses/:courseId', () => {
      it('should remove a course from favorites', async () => {
        const studentId = 'u2';
        const courseId = 'c1';
        await request(app)
          .delete(`/students/${studentId}/favorite-courses/${courseId}`)
          .expect(StatusCodes.NO_CONTENT);
      });
  
      it('should return 400 if course is not favorite', async () => {
        const studentId = 'u6';
        const courseId = 'c1';
        await request(app)
          .delete(`/students/${studentId}/favorite-courses/${courseId}`)
          .expect(StatusCodes.BAD_REQUEST);
      });
  
      it('should return 403 if not enrolled in course', async () => {
        const studentId = 'u1';
        const courseId = 'c1';
        await request(app)
          .delete(`/students/${studentId}/favorite-courses/${courseId}`)
          .expect(StatusCodes.FORBIDDEN);
      });
    });
});