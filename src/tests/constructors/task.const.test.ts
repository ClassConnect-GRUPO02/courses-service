import { Task } from '../../models/task';
import { mockTaskRequestData } from '../mocks/mock.task';

describe('Task constructor', () => {
  it('should create a task with valid data', () => {
    const task = new Task(mockTaskRequestData);
    expect(task.title).toBe(mockTaskRequestData.title);
    expect(task.type).toBe('tarea');
  });

  it('should throw Creation Error if created_by is missing', () => {
    const data = { ...mockTaskRequestData };
    data.created_by = '';
    expect(() => new Task(data)).toThrow('The "created_by" field is required.');
  });

  it('should throw Creation Error if type is missing', () => {
    const data = { ...mockTaskRequestData, type:undefined };
    expect(() => new Task(data)).toThrow('The "type" field is required.');
  });

  it('should throw Creation Error if title is missing', () => {
    const data = { ...mockTaskRequestData };
    data.title = '';
    expect(() => new Task(data)).toThrow('The "title" field is required.');
  });

  it('should throw Creation Error if description is missing', () => {
    const data = { ...mockTaskRequestData };
    data.description = '';
    expect(() => new Task(data)).toThrow('The "description" field is required.');
  });

  it('should throw Creation Error if due_date is missing', () => {
    const data = { ...mockTaskRequestData };
    data.due_date = '';
    expect(() => new Task(data)).toThrow('The "due_date" field is required.');
  });

  it('should throw Creation Error if allow_late is missing', () => {
    const data = { ...mockTaskRequestData, allow_late: undefined };
    expect(() => new Task(data)).toThrow('The "allow_late" field is required.');
  });

  it('should throw Creation Error if late_policy is missing', () => {
    const data = { ...mockTaskRequestData, late_policy: undefined };
    expect(() => new Task(data)).toThrow('The "late_policy" field is required.');
  });

  it('should throw Creation Error if has_timer is missing', () => {
    const data = { ...mockTaskRequestData, has_timer: undefined };
    expect(() => new Task(data)).toThrow('The "has_timer" field is required.');
  });

  it('should throw Creation Error if published is missing', () => {
    const data = { ...mockTaskRequestData, published: undefined };
    expect(() => new Task(data)).toThrow('The "published" field is required.');
  });

  it('should throw Creation Error if allow_file_upload is missing', () => {
    const data = { ...mockTaskRequestData, allow_file_upload: undefined };
    expect(() => new Task(data)).toThrow('The "allow_file_upload" field is required.');
  });

  it('should throw Creation Error if answer_format is missing', () => {
    const data = { ...mockTaskRequestData, answer_format: undefined };
    expect(() => new Task(data)).toThrow('The "answer_format" field is required.');
  });
  //TODO: date validation throws a CourseCreationError

})