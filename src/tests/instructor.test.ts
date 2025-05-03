import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';

describe('Integration Tests for instructor of Courses API', () => {
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