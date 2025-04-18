import { Server } from 'http';
import app from './src/app';
import { addModuleToCourse, getModulesByCourseId } from './src/database/database';

let server: Server;

// Simula una base de datos en memoria
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDB: Record<string, any> = {};

jest.mock('./src/database/database', () => ({
  getCourses: jest.fn().mockImplementation(() => {
    return Promise.resolve(Object.values(mockDB));
  }),

  getCourseById: jest.fn().mockImplementation((id: string) => {
    return Promise.resolve(mockDB[id] || null);
  }),

  addCourse: jest.fn().mockImplementation((courseData) => {
    const id = "1".toString();
    const newCourse = { ...courseData, id };
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
    const newModule = { ...moduleData, id: "1".toString() };
    if (!mockDB[courseId].modules) mockDB[courseId].modules = [];
    mockDB[courseId].modules.push(newModule);
    return Promise.resolve(newModule);
  }),

  getModulesByCourseId: jest.fn().mockImplementation((courseId: string) => {
    if (!mockDB[courseId]) return Promise.resolve([]);
    return Promise.resolve(mockDB[courseId].modules || []);
  }
  ),
  
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
