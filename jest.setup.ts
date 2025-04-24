import { Server } from 'http';
import app from './src/app';
import { v4 as uuidv4 } from 'uuid';


import { mockDB } from './src/tests/mocks/mock.db';

let server: Server;

export interface Instructor {
  id: string;
  courseId: string;
  userId: string;
  type: string;
}

jest.mock('./src/database/database', () => ({
  getCourses: jest.fn().mockImplementation(() => {
    return Promise.resolve(mockDB.courses); 
  }),

  getCourseById: jest.fn().mockImplementation((id: string) => {
    return Promise.resolve(mockDB.courses.find(course => course.id === id) || null);
  }),

  addCourse: jest.fn().mockImplementation((courseData) => {
    const id = uuidv4().toString();
    const newCourse = { ...courseData, id, modules: [] };
    mockDB.courses.push(newCourse); 
    return Promise.resolve(newCourse);
  }),

  updateCourse: jest.fn().mockImplementation((id: string, updatedData) => {
    const course = mockDB.courses.find(course => course.id === id);
    if (!course) return Promise.resolve(null);
    const updatedCourse = { ...course, ...updatedData };
    const index = mockDB.courses.findIndex(course => course.id === id);
    mockDB.courses[index] = updatedCourse; 
    return Promise.resolve(updatedCourse);
  }),

  deleteCourse: jest.fn().mockImplementation((id: string) => {
    const courseIndex = mockDB.courses.findIndex(course => course.id === id);
    if (courseIndex === -1) return Promise.resolve(null);
    const deleted = mockDB.courses[courseIndex];
    mockDB.courses.splice(courseIndex, 1);
    return Promise.resolve(deleted);
  }),

  

  addInstructorToCourse: jest.fn().mockImplementation((courseId: string, instructorId: string, type: string) => {
    const newInstructor = {
      id: uuidv4(),
      courseId,
      userId: instructorId,
      type,
    };
    mockDB.instructors.push(newInstructor); 
    return Promise.resolve(true);
  }),

  isInstructorInCourse: jest.fn().mockImplementation((courseId: string, instructorId: string) => {
    const found = mockDB.instructors.find(
      (inst) => inst.courseId === courseId && inst.userId === instructorId
    );
    return Promise.resolve(!!found);
  }),

  // Mocks for resources

  addResourceToModule: jest.fn().mockImplementation((moduleId: string, resourceData) => {
    const module = mockDB.modules.find(mod => mod.id === moduleId);
    if (!module) return Promise.resolve(null);
    const id = uuidv4().toString();
    const newResource = { ...resourceData, id };
    mockDB.resources.push(newResource); 
    return Promise.resolve(newResource);
  }),

  // Deletes resource from module
  deleteResourceFromModule: jest.fn().mockImplementation((moduleId: string, resourceId: string) => {
    const module = mockDB.modules.find(mod => mod.id === moduleId);
    if (!module) return Promise.resolve(false);
    const resourceIndex = mockDB.resources.findIndex(res => res.id === resourceId);
    if (resourceIndex === -1) return Promise.resolve(false);
    mockDB.resources.splice(resourceIndex, 1); 
    return Promise.resolve(true);
  }),

  // Get resources by module ID
  getResourcesByModuleId: jest.fn().mockImplementation((moduleId: string) => {
    const module = mockDB.modules.find(mod => mod.id === moduleId);
    if (!module) return Promise.resolve([]);
    const resources = mockDB.resources
      .filter(res => res.moduleId === moduleId)
      .sort((a, b) => a.order - b.order); // orden por campo "order"
    return Promise.resolve(resources);
  }),

  // Update resource by ID inside module
  updateResource: jest.fn().mockImplementation((moduleId: string, resourceId: string, resourceData) => {
    const module = mockDB.modules.find(mod => mod.id === moduleId);
    if (!module) return Promise.resolve(null);
    const resourceIndex = mockDB.resources.findIndex(res => res.id === resourceId);
    if (resourceIndex === -1) return Promise.resolve(null);
    const updatedResource = { ...mockDB.resources[resourceIndex], ...resourceData };
    mockDB.resources[resourceIndex] = updatedResource; 
    return Promise.resolve(updatedResource);
  }),

  // Updates resources order in a module
  updateResourcesOrder: jest.fn().mockImplementation((moduleId: string, orderedResourceIds: string[]) => {
    const module = mockDB.modules.find(mod => mod.id === moduleId);
    if (!module) return Promise.resolve();
    orderedResourceIds.forEach((resourceId, index) => {
      const resource = mockDB.resources.find(res => res.id === resourceId);
      if (resource) {
        resource.order = index; 
      }
    });
    return Promise.resolve();
  }),

}));

jest.mock('./src/database/module_db', () => ({
  addModuleToCourse: jest.fn().mockImplementation((courseId, moduleData) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) return Promise.resolve(null);
    const id = uuidv4().toString();
    const newModule = { ...moduleData, id };
    mockDB.modules.push(newModule); 
    return Promise.resolve(newModule);
  }),

  getModulesByCourseId: jest.fn().mockImplementation((courseId: string) => {
    const courseModules = mockDB.modules.filter(module => module.courseId === courseId);
    const orderedModules = courseModules.sort((a, b) => a.order - b.order); 
    return Promise.resolve(orderedModules);
  }),

  getModuleById: jest.fn().mockImplementation((courseId: string, moduleId: string) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) return Promise.resolve(null);
    const module = mockDB.modules.find(mod => mod.id === moduleId); 
    return Promise.resolve(module || null);
  }),

  deleteModule: jest.fn().mockImplementation((courseId: string, moduleId: string) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) return Promise.resolve(false);
    const moduleIndex = mockDB.modules.findIndex(mod => mod.id === moduleId);
    if (moduleIndex === -1) return Promise.resolve(false);
    mockDB.modules.splice(moduleIndex, 1); 
    return Promise.resolve(true);
  }),

  updateModulesOrder: jest.fn().mockImplementation((courseId: string, newOrder: string[]) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) return Promise.resolve();
    newOrder.forEach((moduleId, index) => {
      const module = mockDB.modules.find(m => m.id === moduleId);
      if (module) {
        module.order = index; 
      }
    });
    return Promise.resolve();
  }),
}));

jest.mock('./src/database/enrollment_db', () => ({
  enrollStudent: jest.fn().mockImplementation((courseId: string, studentId: string) => {
    const existing = mockDB.enrollments.find(
      (e) => e.courseId === courseId && e.userId === studentId
    );

    if (existing) return Promise.resolve(null);

    const newEnrollment = {
      id: uuidv4(),
      userId: studentId,
      courseId,
      enrollmentDate: new Date().toISOString(),
    };

    mockDB.enrollments.push(newEnrollment); 
    return Promise.resolve(newEnrollment);
  }),

  isEnrolledInCourse: jest.fn().mockImplementation((courseId: string, userId: string) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }
    const found = mockDB.enrollments.find(
      (enrollment) => enrollment.courseId === courseId && enrollment.userId === userId
    );
    return Promise.resolve(!!found);
  }),

}));


beforeAll((done) => {
  server = app.listen(3001, () => {
    console.log('Test server running on http://localhost:3001');
    done();
  });
});

afterAll((done) => {
  server.close(() => {
    console.log('Test server stopped');
    done();
  });
});
