import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockCourseRequestData } from './mocks/mock.course';

describe('Integration Tests for Courses API', () => {
  let createdCourseId: string;

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
      const response = await request(app).post('/courses').send(mockCourseRequestData);
      expect(response.status).toBe(StatusCodes.CREATED);

      const created = response.body.data;
      expect(created.name).toBe(mockCourseRequestData.name);
      createdCourseId = created.id;
      expect(created.creatorId).toBe(mockCourseRequestData.creatorId);
    });
  });

  describe('PATCH /courses/:id', () => {
    it('should update the course by ID', async () => {
      const response = await request(app)
        .patch(`/courses/${createdCourseId}`)
        .send(updatedData);
  
      // Verificamos que el status de la respuesta sea correcto
      expect(response.status).toBe(StatusCodes.OK);
  
      // Verificamos que el curso actualizado tenga los valores esperados
      expect(response.body.data).toMatchObject({
        id: createdCourseId,
        name: updatedData.name,
        capacity: updatedData.capacity,
        level: updatedData.level,
      });
    });  

    it('should return 404 when trying to update non-existing course', async () => {
      const response = await request(app)
        .patch('/courses/99999999')
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
      const response = await request(app).delete(`/courses/99999999`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

});
