import { Server } from 'http';
import app from './src/app';

let server: Server;

// Simula una base de datos en memoria
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
    console.log('Updated course:', updatedCourse);
    return Promise.resolve(updatedCourse);
  }),

  deleteCourse: jest.fn().mockImplementation((id: string) => {
    const deleted = mockDB[id];
    if (!deleted) return Promise.resolve(null);
    delete mockDB[id];
    return Promise.resolve(deleted);
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
