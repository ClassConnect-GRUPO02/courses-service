import { Course } from "../../models/course";
import { mockCourseRequestData } from "../mocks/mock.course";

describe('Course constructor', () => {
  it('should create a course with valid data', () => {
    const course = new Course(mockCourseRequestData);
    expect(course.name).toBe(mockCourseRequestData.name);
    expect(course.level).toBe("Principiante");
  });

  it('should throw if name is missing', () => {
    const data = {...mockCourseRequestData};
    data.name = '';
    expect(() => new Course(data)).toThrow('The "name" field is required.');
  });

  it('should throw if description is missing', () => {
    const data = {...mockCourseRequestData};
    data.description = '';
    expect(() => new Course(data)).toThrow('The "description" field is required.');
  });

  it('should throw if shortDescription is missing', () => {
    const data = { ...mockCourseRequestData };
    data.shortDescription = '';
    expect(() => new Course(data)).toThrow('The "shortDescription" field is required.');
  });

  it('should throw if startDate is missing', () => {
    const data = { ...mockCourseRequestData };
    data.startDate = '';
    expect(() => new Course(data)).toThrow('The "startDate" field is required.');
  });

  it('should throw if endDate is missing', () => {
    const data = { ...mockCourseRequestData };
    data.endDate = 'invalid-date';
    expect(() => new Course(data)).toThrow(`Invalid date format for "endDate".`);
  });

  it('should throw if capacity is missing', () => {
    const data = { ...mockCourseRequestData, capacity: undefined };
    expect(() => new Course(data)).toThrow(`The "capacity" field must be a number.`);
  });

  it('should throw if enrolled is missing', () => {
    const data = { ...mockCourseRequestData, enrolled: undefined };
    expect(() => new Course(data)).toThrow(`The "enrolled" field must be a number.`);
  });

  it('should throw if category is missing', () => {
    const data = { ...mockCourseRequestData, category: undefined };
    expect(() => new Course(data)).toThrow('The "category" field is required.');
  });

  it('should throw if level is missing', () => {
    const data = { ...mockCourseRequestData, level:undefined };
    expect(() => new Course(data)).toThrow('The "level" field is required.');
  });

  it('should throw if modality is missing', () => {
    const data = { ...mockCourseRequestData, modality: undefined };
    expect(() => new Course(data)).toThrow('The "modality" field is required.');
  });

  it('should throw if prerequisites is missing', () => {
    const data = { ...mockCourseRequestData, prerequisites: undefined };
    expect(() => new Course(data)).toThrow('The "prerequisites" field is required.');
  });

  it('should throw if imageUrl is missing', () => {
    const data = { ...mockCourseRequestData };
    data.imageUrl = '';
    expect(() => new Course(data)).toThrow('The "imageUrl" field is required.');
  });

  it ('should throw if creatorId is missing', () => {
    const data = { ...mockCourseRequestData };
    data.creatorId = '';
    expect(() => new Course(data)).toThrow('The "creatorId" field is required.');
  });
});
