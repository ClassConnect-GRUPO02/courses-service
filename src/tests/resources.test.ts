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
  });
});