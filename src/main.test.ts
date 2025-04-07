import request from 'supertest';
import app from './main';
import { StatusCodes } from 'http-status-codes';
import dotenv from 'dotenv';

dotenv.config();
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://${HOST}:${PORT}`;

describe('E2E Tests for Courses API', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('GET /courses', () => {
    it('should return an empty list of courses initially', async () => {
      const response = await request(BASE_URL).get('/courses');
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('POST /courses', () => {
    it('should create a new course', async () => {
      const newCourse = { title: 'Math', description: 'Basic Math Course' };
      const response = await request(BASE_URL).post('/courses').send(newCourse);

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.data).toMatchObject({
        title: 'Math',
        description: 'Basic Math Course',
      });
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 400 if course data is invalid', async () => {
      const invalidCourse = { title: 'Math' }; // Falta "description"
      const response = await request(BASE_URL).post('/courses').send(invalidCourse);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.title).toBe('Invalid Request');
    });
  });

  describe('GET /courses/:id', () => {
    it('should return a course by ID', async () => {
      const newCourse = { title: 'Science', description: 'Basic Science Course' };
      const createdResponse = await request(BASE_URL).post('/courses').send(newCourse);
      const courseId = createdResponse.body.data.id;

      const response = await request(BASE_URL).get(`/courses/${courseId}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toMatchObject({
        id: courseId,
        title: 'Science',
        description: 'Basic Science Course',
      });
    });

    it('should return 404 if course is not found', async () => {
      const response = await request(BASE_URL).get('/courses/999');
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.title).toBe('Course Not Found');
    });
  });

  describe('DELETE /courses/:id', () => {
    it('should delete a course by ID', async () => {
      const newCourse = { title: 'History', description: 'Basic History Course' };
      const createdResponse = await request(BASE_URL).post('/courses').send(newCourse);
      const courseId = createdResponse.body.data.id;

      const response = await request(BASE_URL).delete(`/courses/${courseId}`);
      expect(response.status).toBe(StatusCodes.NO_CONTENT);

      // Verificar que el curso ya no existe
      const getResponse = await request(BASE_URL).get(`/courses/${courseId}`);
      expect(getResponse.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 404 if course is not found', async () => {
      const response = await request(BASE_URL).delete('/courses/999');
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.title).toBe('Course Not Found');
    });
  });
});

async function clearDatabase() {
  const response = await request(BASE_URL).get('/courses');
  const courses = response.body.data;

  for (const course of courses) {
    await request(BASE_URL).delete(`/courses/${course.id}`);
  }
}