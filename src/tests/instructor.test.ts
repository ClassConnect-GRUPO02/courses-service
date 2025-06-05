import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';

describe('Integration Tests for instructor of Courses API', () => {
  describe('GET courses/:id/instructors/:instructorId', () => {
    it('should check if the user is an instructor in the course', async () => {
      const response = await request(app)
        .get('/courses/c1/instructors/u1')

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.isInstructor).toBe(true);
    });
    it ('should return that the course does not exist', async () => {
      const courseId = 'c9999';
      const response = await request(app)
        .get(`/courses/${courseId}/instructors/u1`)

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST courses/:id/instructors/:auxiliarId', () => {
    it('should add an instructor to the course', async () => {
      const response = await request(app)
        .post('/courses/c1/instructors/u99')
        .send({
          titularId: 'u1',
          can_create_content: true,
          can_grade: true,
          can_update_course: true
        });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toBe(true);
    });
  });

  
  describe('PATCH courses/:id/instructors/:auxiliarId', () => {
    it('should update instructor permissions', async () => {
      const response = await request(app)
        .patch('/courses/c1/instructors/u99')
        .send({
          titularId: 'u1',
          can_create_content: false,
          can_grade: true,
          can_update_course: false
        });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBe(true);
    });
  });

  describe('GET courses/:id/instructors/:instructorId/permissions', () => {
    it('should get instructor permissions', async () => {
      const response = await request(app)
        .get('/courses/c1/instructors/u99/permissions');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.courseId).toEqual('c1');
      expect(response.body.userId).toBe('u99');
      expect(response.body.type).toBe('AUXILIAR');
      expect(response.body.can_create_content).toBe(false);
      expect(response.body.can_grade).toBe(true);
      expect(response.body.can_update_course).toBe(false);
    });
  });

  describe('DELETE courses/:id/instructors/:auxiliarId', () => {
    it('should remove an instructor from the course', async () => {
      const response = await request(app)
        .delete('/courses/c1/instructors/u99')
        .send({
          titularId: 'u1'
        });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBe(true);
    });
  });
});