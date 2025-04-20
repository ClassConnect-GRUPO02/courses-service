import { Course } from '../../src/models/course';
import { CourseCreationError } from '../../src/models/errors';

const baseCourseData = {
  name: "Curso de Node.js",
  description: "Aprende backend con Node.js",
  shortDescription: "Backend con Node",
  startDate: "2025-05-01",
  endDate: "2025-06-01",
  capacity: 30,
  enrolled: 5,
  category: "Programación",
  level: "Principiante" as const,
  modality: "Online" as const,
  prerequisites: ["JavaScript básico"],
  imageUrl: "http://imagen.com/curso.jpg",
  creatorId: "12345"
};


describe('Course constructor', () => {
  it('should create a course with valid data', () => {
    const course = new Course(baseCourseData);
    expect(course.name).toBe(baseCourseData.name);
    expect(course.level).toBe("Principiante");
  });

  it('should throw if name is missing', () => {
    const data: Partial<Course> = { ...baseCourseData };
    delete data.name;
    expect(() => new Course(data)).toThrowError(CourseCreationError);
    expect(() => new Course(data)).toThrow('The "name" field is required.');
  });

  it('should throw if description is missing', () => {
    const data: Partial<Course> = { ...baseCourseData };
    delete data.description;
    expect(() => new Course(data)).toThrow('The "description" field is required.');
  });

  it('should throw if shortDescription is missing', () => {
    const data: Partial<Course> = { ...baseCourseData };
    delete data.shortDescription;
    expect(() => new Course(data)).toThrow('The "shortDescription" field is required.');
  });

  it('should throw if startDate is missing', () => {
    const data: Partial<Course> = { ...baseCourseData };
    delete data.startDate;
    expect(() => new Course(data)).toThrow('The "startDate" field is required.');
  });

  it('should throw if endDate is missing', () => {
    const data: Partial<Course> = { ...baseCourseData };
    delete data.endDate;
    expect(() => new Course(data)).toThrow('The "endDate" field is required.');
  });

  it('should throw if capacity is missing', () => {
    const data: Partial<Course> = { ...baseCourseData };
    delete data.capacity;
    expect(() => new Course(data)).toThrow('The "capacity" field is required.');
  });

  it('should throw if enrolled is missing', () => {
    const data: Partial<Course> = { ...baseCourseData };
    delete data.enrolled;
    expect(() => new Course(data)).toThrow('The "enrolled" field is required.');
  });

  it('should throw if category is missing', () => {
    const data: Partial<Course> = { ...baseCourseData };
    delete data.category;
    expect(() => new Course(data)).toThrow('The "category" field is required.');
  });

  it('should throw if level is missing', () => {
    const data: Partial<Course> = { ...baseCourseData };
    delete data.level;
    expect(() => new Course(data)).toThrow('The "level" field is required.');
  });

  it('should throw if modality is missing', () => {
    const data: Partial<Course> = { ...baseCourseData };
    delete data.modality;
    expect(() => new Course(data)).toThrow('The "modality" field is required.');
  });

  it('should throw if prerequisites is missing', () => {
    const data: Partial<Course> = { ...baseCourseData };
    delete data.prerequisites;
    expect(() => new Course(data)).toThrow('The "prerequisites" field is required.');
  });

  it('should throw if imageUrl is missing', () => {
    const data: Partial<Course> = { ...baseCourseData };
    delete data.imageUrl;
    expect(() => new Course(data)).toThrow('The "imageUrl" field is required.');
  });
});
