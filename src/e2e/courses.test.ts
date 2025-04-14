import request from 'supertest';
import app from '../main';
import { StatusCodes } from 'http-status-codes';

describe('E2E Tests for Courses API', () => {
  let createdCourseId: string;

  const newCourse = {
    id: "test-course-001",
    name: "Curso de Prueba",
    description: "Aprendé TypeScript desde cero",
    shortDescription: "TS para principiantes",
    startDate: "2025-05-01T00:00:00.000Z",
    endDate: "2025-07-01T00:00:00.000Z",
    instructor: {
      name: "Martín Abramovich",
      profile: "https://example.com/martin"
    },
    capacity: 25,
    enrolled: 0,
    category: "Programación",
    level: "Beginner",
    modality: "Online",
    prerequisites: ["JavaScript", "Lógica de programación"],
    imageUrl: "https://example.com/imagen-del-curso.jpg"
  };

  const updatedData = {
    name: "Curso de Prueba Actualizado",
    capacity: 30,
    level: "Intermediate"
  };

  describe('GET /courses', () => {
    it('should return an empty list of courses initially', async () => {
      const response = await request(app).get('/courses');
      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /courses', () => {
    it('should create a new course', async () => {
      const response = await request(app).post('/courses').send(newCourse);
      expect(response.status).toBe(StatusCodes.CREATED);

      const created = response.body.data;
      expect(created.name).toBe(newCourse.name);
      createdCourseId = created.id;
    });
  });

  describe('PUT /courses/:id', () => {
    it('should update the course by ID', async () => {
      const response = await request(app)
        .put(`/courses/${createdCourseId}`)
        .send(updatedData);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.name).toBe(updatedData.name);
      expect(response.body.data.capacity).toBe(updatedData.capacity);
      expect(response.body.data.level).toBe(updatedData.level);
    });

    it('should return 404 when trying to update non-existing course', async () => {
      const response = await request(app)
        .put('/courses/non-existent-id')
        .send({ name: "Fake update" });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('GET /courses/:id', () => {
    it('should return the updated course by ID', async () => {
      const response = await request(app).get(`/courses/${createdCourseId}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.name).toBe(updatedData.name);
    });
  });

  describe('DELETE /courses/:id', () => {
    it('should delete the course by ID', async () => {
      const response = await request(app).delete(`/courses/${createdCourseId}`);
      expect(response.status).toBe(StatusCodes.NO_CONTENT);
    });

    it('should return 404 when deleting a non-existing course', async () => {
      const response = await request(app).delete(`/courses/${createdCourseId}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
