import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockCourseRequestData } from './mocks/mock.course';
import jwt from 'jsonwebtoken';
import { userTypes } from '../lib/user_types';

describe('Integration Tests for Courses API', () => {
  let createdCourseId: string;

  const updatedData = {
    name: "Curso de Prueba Actualizado",
    capacity: 30,
    level: "Intermediate"
  };

  const SECRET_KEY = Buffer.from(process.env.SECRET_KEY as string, "hex");

  const token = jwt.sign(
    { id: 'u1',
      userType: userTypes.INSTRUCTOR,
      }, // payload
    SECRET_KEY!, // clave secreta
    { algorithm: 'HS256' }
  );

  describe('GET /courses', () => {
    it('should return an empty list of courses initially', async () => {
      const response = await request(app).get('/courses').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
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
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .send({ name: "Fake update" });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('GET /courses/:id', () => {
    it('should return the updated course by ID', async () => {
      const response = await request(app).get(`/courses/${createdCourseId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.name).toBe(updatedData.name);
    });
  });

  describe('DELETE /courses/:id', () => {
    it('should delete the course by ID', async () => {
      const response = await request(app).delete(`/courses/${createdCourseId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.NO_CONTENT);
    });

    it('should return 404 when deleting a non-existing course', async () => {
      const response = await request(app).delete(`/courses/99999999`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('GET /courses/:id/activity-log', () => {
    it('should get the activity log from a course', async () => {
      const response = await request(app).get(`/courses/c1/activity-log`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.OK)
    });
  });

});
