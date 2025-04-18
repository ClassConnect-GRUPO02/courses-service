import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockCourseRequestData } from '../mocks/mock.course';

describe('E2E Tests for modules of Courses API', () => {

  const newModuleData = {
    name: "Introducción a TypeScript",
    description: "Aprendé los conceptos básicos de TypeScript",
    url: "https://example.com/intro-typescript",
    order: 1,
    courseId: "", // This will fill with the id of the course
  };

  describe('POST /courses/:id/modules', () => {
    it('should add a new module to the course', async () => {
      // 1. Create new course
      const courseResponse = await request(app)
        .post('/courses')
        .send(mockCourseRequestData);

      const createdCourseId = courseResponse.body.data.id;
      newModuleData.courseId = createdCourseId;

      // 2. Add new module to the created course
      const response = await request(app)
        .post(`/courses/${createdCourseId}/modules`)
        .send(newModuleData);

      // 3. Check the response
      expect(response.status).toBe(StatusCodes.CREATED);
      const createdModule = response.body.data;

      expect(createdModule.name).toBe(newModuleData.name);
      expect(createdModule.description).toBe(newModuleData.description);
      expect(createdModule.url).toBe(newModuleData.url);
      expect(createdModule.order).toBe(newModuleData.order);
      expect(createdModule.courseId).toBe(createdCourseId);
      expect(createdModule.id).toBeDefined();
    });

    it('should return 404 if the course does not exist', async () => {
      const nonExistentCourseId = 'non-existent-course-id';
      const response = await request(app)
        .post(`/courses/${nonExistentCourseId}/modules`)
        .send(newModuleData);

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
      newModuleData.courseId = createdCourseId;

      // Add a module to the course
      await request(app)
        .post(`/courses/${createdCourseId}/modules`)
        .send(newModuleData);

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
      newModuleData.courseId = createdCourseId;
      
      // Add a module to the course
      const moduleResponse = await request(app)
      .post(`/courses/${createdCourseId}/modules`)
      .send(newModuleData);
      
      const createdModuleId = moduleResponse.body.data.id;
      expect(moduleResponse.status).toBe(StatusCodes.CREATED); 
      
      // Retrieve the specific module
      const response = await request(app)
      .get(`/courses/${createdCourseId}/modules/${createdModuleId}`);
      
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.name).toBe(newModuleData.name);
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
      newModuleData.courseId = createdCourseId;

      // Add a module to the course
      const moduleResponse = await request(app)
        .post(`/courses/${createdCourseId}/modules`)
        .send(newModuleData);

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

});
