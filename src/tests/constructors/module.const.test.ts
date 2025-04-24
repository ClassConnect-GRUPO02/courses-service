import { Module } from '../../models/module';
import { mockModuleRequestData } from '../mocks/mock.module';

describe('Module constructor', () => {
  it('should create a module with valid data', () => {
    const module = new Module(mockModuleRequestData);
    expect(module.name).toBe(mockModuleRequestData.name);
    expect(module.courseId).toBe(mockModuleRequestData.courseId);
  }
  );
  it('should throw an error if name is missing', () => {
    const data = { ...mockModuleRequestData};
    data.name = '';
    expect(() => new Module(data)).toThrow('The "name" field is required.');
  }
  );
  it('should throw an error if description is missing', () => {
    const data = { ...mockModuleRequestData };
    data.description = '';
    expect(() => new Module(data)).toThrow('The "description" field is required.');
  }
  );
  it('should throw an error if url is missing', () => {
    const data = { ...mockModuleRequestData };
    data.url = '';
    expect(() => new Module(data)).toThrow('The "url" field is required.');
  }
  );
  it('should throw an error if order is missing', () => {
    const data = { ...mockModuleRequestData, order: undefined };
    expect(() => new Module(data)).toThrow(`The "order" field must be a number.`);
  }
  );
  it('should throw an error if courseId is missing', () => {
    const data = { ...mockModuleRequestData };
    data.courseId = '';
    expect(() => new Module(data)).toThrow('The "courseId" field is required.');
  }
  );
});