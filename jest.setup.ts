import { Server } from 'http';
import app from './src/app';
import { Module } from './src/models/module';
import { v4 as uuidv4 } from 'uuid';
import { Enrollment } from './src/models/enrollment';
import { updateModulesOrder } from './src/database/database';

let server: Server;

// Simula una base de datos en memoria
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDB: Record<string, any> = {};
const mockInstructors: Instructor[] = [];
const enrollments: Enrollment[] = [];
const modules: Module[] = [
  { id: 'm1', name: 'Módulo 1', description: '', url: '', order: 0, courseId: 'c1' },
  { id: 'm2', name: 'Módulo 2', description: '', url: '', order: 1, courseId: 'c1' },
  { id: 'm3', name: 'Módulo 3', description: '', url: '', order: 2, courseId: 'c1' },
];


let courseIdCounter = 1;
let moduleIdCounter = 1;

export interface Instructor {
  id: string;
  courseId: string;
  userId: string;
  type: string;
}


jest.mock('./src/database/database', () => ({
  getCourses: jest.fn().mockImplementation(() => {
    return Promise.resolve(Object.values(mockDB));
  }),

  getCourseById: jest.fn().mockImplementation((id: string) => {
    return Promise.resolve(mockDB[id] || null);
  }),

  addCourse: jest.fn().mockImplementation((courseData) => {
    const id = (courseIdCounter++).toString();
    const newCourse = { ...courseData, id, modules: [] };
    mockDB[id] = newCourse;
    return Promise.resolve(newCourse);
  }),

  updateCourse: jest.fn().mockImplementation((id: string, updatedData) => {
    if (!mockDB[id]) return Promise.resolve(null);
    const updatedCourse = { ...mockDB[id], ...updatedData };
    mockDB[id] = updatedCourse;
    return Promise.resolve(updatedCourse);
  }),

  deleteCourse: jest.fn().mockImplementation((id: string) => {
    const deleted = mockDB[id];
    if (!deleted) return Promise.resolve(null);
    delete mockDB[id];
    return Promise.resolve(deleted);
  }),

  addModuleToCourse: jest.fn().mockImplementation((courseId, moduleData) => {
    if (!mockDB[courseId]) return Promise.resolve(null);
    const id = (moduleIdCounter++).toString();
    const newModule = { ...moduleData, id };
    mockDB[courseId].modules.push(newModule);
    return Promise.resolve(newModule);
  }),

  getModulesByCourseId: jest.fn().mockImplementation((courseId: string) => {
    if (!mockDB[courseId]) return Promise.resolve([]);
  
    const modules = mockDB[courseId].modules || [];
    const orderedModules = [...modules].sort((a, b) => a.order - b.order);
  
    return Promise.resolve(orderedModules);
  }),

  getModuleById: jest.fn().mockImplementation((courseId: string, moduleId: string) => {
    if (!mockDB[courseId]) return Promise.resolve(null);
    const module = mockDB[courseId].modules.find((mod: Module) => mod.id === moduleId);
    return Promise.resolve(module || null);
  }),

  deleteModule: jest.fn().mockImplementation((courseId: string, moduleId: string) => {
    if (!mockDB[courseId]) return Promise.resolve(false);
    const moduleIndex = mockDB[courseId].modules.findIndex((mod: Module) => mod.id === moduleId);
    if (moduleIndex === -1) return Promise.resolve(false);
    mockDB[courseId].modules.splice(moduleIndex, 1);
    return Promise.resolve(true);
  }),

  updateModulesOrder: jest.fn().mockImplementation((courseId: string, newOrder: string[]) => {
    newOrder.forEach((moduleId, index) => {
      const module = modules.find((m) => m.id === moduleId && m.courseId === courseId);
      if (module) {
        module.order = index;
      }
    });
    return Promise.resolve();
  }),

  addInstructorToCourse: jest.fn().mockImplementation((courseId: string, instructorId: string, type: string) => {
    const newInstructor = {
      id: uuidv4(),
      courseId,
      userId: instructorId,
      type,
    };
    mockInstructors.push(newInstructor);
    return Promise.resolve(true);
  }),

  isInstructorInCourse: jest.fn().mockImplementation((courseId: string, instructorId: string) => {
    const found = mockInstructors.find(
      (inst) => inst.courseId === courseId && inst.userId === instructorId
    );
    return Promise.resolve(!!found);
  }),

  enrollStudent: jest.fn().mockImplementation((courseId: string, studentId: string) => {
    const existing = enrollments.find(
      (e) => e.courseId === courseId && e.userId === studentId
    );

    if (existing) return Promise.resolve(null);

    const newEnrollment = new Enrollment({
      userId: studentId,
      courseId,
    });

    newEnrollment.id = uuidv4();
    newEnrollment.enrollmentDate = new Date().toISOString();

    enrollments.push(newEnrollment);
    return Promise.resolve(newEnrollment);
  }),

  isEnrolledInCourse: jest.fn().mockImplementation((courseId: string, userId: string) => {
    const course = mockDB[courseId];
    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }
    const found = enrollments.find(
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
