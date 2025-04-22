import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockCourseRequestData } from './mocks/mock.course';
import { mockModuleRequestData } from './mocks/mock.module';

describe('Integration Tests for modules of Courses API', () => {

  describe('POST /courses/:id/modules', () => {
    it('should add a new module to the course', async () => {
      // 1. Create new course
      const courseResponse = await request(app)
        .post('/courses')
        .send(mockCourseRequestData);

      const createdCourseId = courseResponse.body.data.id;
      mockModuleRequestData.courseId = createdCourseId;

      // 2. Add new module to the created course
      const response = await request(app)
        .post(`/courses/${createdCourseId}/modules`)
        .send(mockModuleRequestData);

      // 3. Check the response
      expect(response.status).toBe(StatusCodes.CREATED);
      const createdModule = response.body.data;

      expect(createdModule.name).toBe(mockModuleRequestData.name);
      expect(createdModule.description).toBe(mockModuleRequestData.description);
      expect(createdModule.url).toBe(mockModuleRequestData.url);
      expect(createdModule.order).toBe(mockModuleRequestData.order);
      expect(createdModule.courseId).toBe(createdCourseId);
      expect(createdModule.id).toBeDefined();
    });

    it('should return 404 if the course does not exist', async () => {
      const nonExistentCourseId = 'non-existent-course-id';
      const response = await request(app)
        .post(`/courses/${nonExistentCourseId}/modules`)
        .send(mockModuleRequestData);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 400 if the module data is invalid', async () => {
      const courseResponse = await request(app)
        .post('/courses')
        .send(mockCourseRequestData);

      const createdCourseId = courseResponse.body.data.id;

      // Send invalid module data
      const invalidModuleData = {
        name: "",
        description: "Missing name",
        url: "https://example.com/intro-typescript",
        order: 1,
        courseId: createdCourseId,
      };

      const response = await request(app)
        .post(`/courses/${createdCourseId}/modules`)
        .send(invalidModuleData);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe('GET /courses/:id/modules', () => {
    it('should retrieve all modules for a given course ID', async () => {
      const courseResponse = await request(app)
        .post('/courses')
        .send(mockCourseRequestData);

      const createdCourseId = courseResponse.body.data.id;
      mockModuleRequestData.courseId = createdCourseId;

      // Add a module to the course
      await request(app)
        .post(`/courses/${createdCourseId}/modules`)
        .send(mockModuleRequestData);

      // Retrieve modules for the course
      const response = await request(app)
        .get(`/courses/${createdCourseId}/modules`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });
  });
  describe('GET /courses/:id/modules/:moduleId', () => {
    it('should retrieve a specific module by ID inside a course', async () => {
      const courseResponse = await request(app)
      .post('/courses')
        .send(mockCourseRequestData);
        
      const createdCourseId = courseResponse.body.data.id;
      mockModuleRequestData.courseId = createdCourseId;
      
      // Add a module to the course
      const moduleResponse = await request(app)
      .post(`/courses/${createdCourseId}/modules`)
      .send(mockModuleRequestData);
      
      const createdModuleId = moduleResponse.body.data.id;
      expect(moduleResponse.status).toBe(StatusCodes.CREATED); 
      
      // Retrieve the specific module
      const response = await request(app)
      .get(`/courses/${createdCourseId}/modules/${createdModuleId}`);
      
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.name).toBe(mockModuleRequestData.name);
      });
      
    it('should return 404 if the module does not exist', async () => {
      const nonExistentModuleId = 'non-existent-module-id';
      const courseResponse = await request(app)
      .post('/courses')
      .send(mockCourseRequestData);
      
      const createdCourseId = courseResponse.body.data.id;
      
      const response = await request(app)
      .get(`/courses/${createdCourseId}/modules/${nonExistentModuleId}`);
      
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    }); 
  });

  describe('DELETE /courses/:id/modules/:moduleId', () => {
    it('should delete a module from a course', async () => {
      const courseResponse = await request(app)
        .post('/courses')
        .send(mockCourseRequestData);

      const createdCourseId = courseResponse.body.data.id;
      mockModuleRequestData.courseId = createdCourseId;

      // Add a module to the course
      const moduleResponse = await request(app)
        .post(`/courses/${createdCourseId}/modules`)
        .send(mockModuleRequestData);

      const createdModuleId = moduleResponse.body.data.id;

      // Delete the module
      const response = await request(app)
        .delete(`/courses/${createdCourseId}/modules/${createdModuleId}`);

      expect(response.status).toBe(StatusCodes.NO_CONTENT);
    });

    it('should return 404 if the module does not exist', async () => {
      const nonExistentModuleId = 'non-existent-module-id';
      const courseResponse = await request(app)
        .post('/courses')
        .send(mockCourseRequestData);

      const createdCourseId = courseResponse.body.data.id;

      const response = await request(app)
        .delete(`/courses/${createdCourseId}/modules/${nonExistentModuleId}`);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  xdescribe('PATCH /courses/:id/modules/order', () => {
    it('should update the order of modules in a course', async () => {
      const courseResponse = await request(app)
        .post('/courses')
        .send(mockCourseRequestData);

      const createdCourseId = courseResponse.body.data.id;
      mockModuleRequestData.courseId = createdCourseId;

      // Add multiple modules to the course
      const moduleResponse1 = await request(app)
        .post(`/courses/${createdCourseId}/modules`)
        .send(mockModuleRequestData);

      const moduleResponse2 = await request(app)
        .post(`/courses/${createdCourseId}/modules`)
        .send({
          ...mockModuleRequestData,
          name: 'Second Module',
          order: 2,
        });

      const createdModuleId1 = moduleResponse1.body.data.id;
      const createdModuleId2 = moduleResponse2.body.data.id;

      // Update the order of modules
      const orderedModuleIds = [createdModuleId2, createdModuleId1];
      const response = await request(app)
        .patch(`/courses/${createdCourseId}/modules/order`)
        .send({ orderedModuleIds });

      const getAllModulesResponse = await request(app)
        .get(`/courses/${createdCourseId}/modules`);
      const modulesInArray = getAllModulesResponse.body.data;
      const firstModule = modulesInArray[0];
      const secondModule = modulesInArray[1];

      expect(response.status).toBe(StatusCodes.OK);
      expect(firstModule.id).toBe(createdModuleId2);
      expect(secondModule.id).toBe(createdModuleId1);

    });

    it('should return 400 if the orderedModuleIds is not an array', async () => {
      const courseResponse = await request(app)
        .post('/courses')
        .send(mockCourseRequestData);

      const createdCourseId = courseResponse.body.data.id;

      // Update the order of modules with invalid data
      const response = await request(app)
        .patch(`/courses/${createdCourseId}/modules/order`)
        .send({ orderedModuleIds: 'invalid-data' });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });

});
