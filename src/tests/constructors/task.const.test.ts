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
})