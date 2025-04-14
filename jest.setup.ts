import app from './src/main'; // Importa tu aplicación
import { Server } from 'http';

let server: Server;

beforeAll((done) => {
    server = app.listen(3001, () => {
      console.log('Test server running on http://localhost:3001');
      done();
    });
  });

jest.mock('./src/database/database', () => ({
    getCourses: jest.fn().mockResolvedValue([]),
    getCourseById: jest.fn().mockImplementation((id) => {
      if (id === '1') {
        return Promise.resolve({
          id: '1',
          name: 'Test Course',
          description: 'A course for testing',
          shortDescription: 'Test',
          startDate: '2023-05-01',
          endDate: '2023-06-01',
          instructor: { name: 'Test Instructor', profile: 'Test Profile' },
          capacity: 100,
          enrolled: 50,
          category: 'Test Category',
          level: 'Principiante',
          modality: 'Online',
          prerequisites: ['None'],
          imageUrl: 'http://example.com/test.png',
        });
      }
      throw new Error('Course not found');
    }),
    addCourse: jest.fn().mockResolvedValue({
      id: '2',
      name: 'New Course',
      description: 'A new course',
      shortDescription: 'New',
      startDate: '2023-07-01',
      endDate: '2023-08-01',
      instructor: { name: 'New Instructor', profile: 'New Profile' },
      capacity: 50,
      enrolled: 0,
      category: 'New Category',
      level: 'Intermedio',
      modality: 'Presencial',
      prerequisites: ['None'],
      imageUrl: 'http://example.com/new.png',
    }),
    deleteCourse: jest.fn().mockResolvedValue({}),
    updateCourse: jest.fn().mockResolvedValue({
      id: '1',
      name: 'Updated Course',
      description: 'An updated course',
      shortDescription: 'Updated',
      startDate: '2023-05-01',
      endDate: '2023-06-01',
      instructor: { name: 'Updated Instructor', profile: 'Updated Profile' },
      capacity: 100,
      enrolled: 50,
      category: 'Updated Category',
      level: 'Avanzado',
      modality: 'Híbrido',
      prerequisites: ['Updated Prerequisite'],
      imageUrl: 'http://example.com/updated.png',
    }),
  }));

afterAll((done) => {
    server.close(() => {
      console.log('Test server stopped');
      done();
    });
  });