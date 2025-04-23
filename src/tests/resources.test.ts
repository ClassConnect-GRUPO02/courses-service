import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockResourceRequestData } from './mocks/mock.resource';

describe('Integration Tests for resources of Courses API', () => {
  
  describe('POST /modules/:moduleId/resources', () => {
    it('should add a new resource to the module', async () => {
      // 1.Get module with id "m1" from database
      const courseId = 'c1';
      const moduleId = 'm1';
      const moduleResponse = await request(app) 
        .get(`/courses/${courseId}/modules/${moduleId}`)
        .send();
      expect(moduleResponse.status).toBe(StatusCodes.OK);
      
      // 2. Add new resource to the module
      const response = await request(app)
        .post(`/modules/${moduleId}/resources`)
        .send(mockResourceRequestData);
      // 3. Check the response
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
        .send(invalidResourceData);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
    it('should return 404 if the module does not exist', async () => {
      const nonExistentModuleId = 'non-existent-module-id';
      const response = await request(app)
        .post(`/modules/${nonExistentModuleId}/resources`)
        .send(mockResourceRequestData);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('DELETE /modules/:moduleId/resources/:resourceId', () => {
    it('should delete a resource from the module', async () => {
      const response = await request(app).delete(
        `/modules/m1/resources/r1`
      );
      expect(response.status).toBe(StatusCodes.NO_CONTENT);
    });
    it('should return 404 if the resource does not exist', async () => {
      const response = await request(app).delete(
        `/modules/m1/resources/99999999`
      );
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});