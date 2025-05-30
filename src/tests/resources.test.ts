import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockResourceRequestData } from './mocks/mock.resource';
import { Resource } from '../models/resource';
import jwt from 'jsonwebtoken';
import { userTypes } from '../lib/user_types';

describe('Integration Tests for resources of Courses API', () => {

  const SECRET_KEY = Buffer.from(process.env.SECRET_KEY as string, "hex");

  const token = jwt.sign(
    { id: 'u1',
      userType: userTypes.INSTRUCTOR,
      }, // payload
    SECRET_KEY!, // clave secreta
    { algorithm: 'HS256' }
  );
  
  describe('POST /modules/:moduleId/resources', () => {
    it('should add a new resource to the module', async () => {
      const moduleId = 'm1';
      
      const response = await request(app)
        .post(`/modules/${moduleId}/resources`)
        .set('Authorization', `Bearer ${token}`)
        .send(mockResourceRequestData);
      
        expect(response.status).toBe(StatusCodes.CREATED);
      const createdResource = response.body.data;
      expect(createdResource.description).toBe(mockResourceRequestData.description);
      expect(createdResource.url).toBe(mockResourceRequestData.url);
      expect(createdResource.type).toBe(mockResourceRequestData.type);
      expect(createdResource.moduleId).toBe(moduleId);
      expect(createdResource.id).toBeDefined();
    });

    it('should return 400 if the resource data is invalid', async () => {
      const courseId = 'c1';
      const moduleId = 'm1';
      const moduleResponse = await request(app) 
        .get(`/courses/${courseId}/modules/${moduleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send();
      expect(moduleResponse.status).toBe(StatusCodes.OK);
      
      // Send invalid resource data
      const invalidResourceData = {
        description: "desc",
        url: "https://example.com/intro-typescript",
        type: "video",
        order: "asd",
        moduleId: moduleId,
      };
      const response = await request(app)
        .post(`/modules/${moduleId}/resources`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidResourceData);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 404 if the module does not exist', async () => {
      const nonExistentModuleId = 'non-existent-module-id';
      const response = await request(app)
        .post(`/modules/${nonExistentModuleId}/resources`)
        .set('Authorization', `Bearer ${token}`)
        .send(mockResourceRequestData);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  
  describe('GET /modules/:moduleId/resources', () => {
    it('should get all resources from the module', async () => {
      const response = await request(app)
        .get(`/modules/m1/resources`)
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.length).toBe(3);
    });
  });
  
  describe('PATCH /modules/:moduleId/resources/:resourceId', () => {
    it('should update a resource in the module', async () => {
      const updatedData = {
        description: "Updated description",
        type: "video",
        url: "https://example.com/updated-url",
        order: 2, // En realidad no debería cambiarle el orden desde este endpoint
      };
      const response = await request(app)
        .patch(`/modules/m1/resources/r1`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.description).toBe(updatedData.description);
      expect(response.body.data.url).toBe(updatedData.url);
      expect(response.body.data.type).toBe(updatedData.type);
    });
  });

  describe('PATCH /modules/:moduleId/resources/order', () => {
    it('should update the order of resources in a module', async () => {
      const moduleResponse = await request(app)
        .get(`/courses/c1/modules/m1`)
        .set('Authorization', `Bearer ${token}`)
        .send();
      expect(moduleResponse.status).toBe(StatusCodes.OK);
  
      const initialResources = await request(app)
        .get(`/modules/m1/resources`)
        .set('Authorization', `Bearer ${token}`)
        .send();
      expect(initialResources.status).toBe(StatusCodes.OK);
  
      // Confirmar que el orden inicial es distinto
      const originalOrder = initialResources.body.data.map((r: Resource) => r.id);
      expect(originalOrder).toEqual(expect.arrayContaining(['r1', 'r2']));
  
      const newOrderIds = ['r2', 'r1'];
  
      const patchResponse = await request(app)
        .patch(`/modules/m1/resources/order`)
        .set('Authorization', `Bearer ${token}`)
        .send({ orderedResourceIds: newOrderIds });
  
      expect(patchResponse.status).toBe(StatusCodes.OK);
      expect(patchResponse.body.message).toBe('Resource order updated successfully.');
  
      const updatedResources = await request(app)
      .get(`/modules/m1/resources`)
      .set('Authorization', `Bearer ${token}`)
      .send();
      expect(updatedResources.status).toBe(StatusCodes.OK);
  
      expect(updatedResources.body.data[0].id).toBe('r2');
      expect(updatedResources.body.data[1].id).toBe('r1');
    });
  });
  
  describe('DELETE /modules/:moduleId/resources/:resourceId', () => {
    it('should delete a resource from the module', async () => {
      const response = await request(app)
      .delete(`/modules/m1/resources/r1`)
      .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.NO_CONTENT);
    });

    it('should return 404 if the resource does not exist', async () => {
      const response = await request(app)
      .delete(`/modules/m1/resources/99999999`)
      .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });


});