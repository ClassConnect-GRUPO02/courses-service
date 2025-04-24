import { ModuleCreationError } from "./errors";

export class Module {
  id: string;
  name: string;
  description: string;
  url: string;
  order: number;
  courseId: string

  constructor(data: Partial<Module>) {
    this.id = ''; // Id is not needed because it will be asigned after
    this.name = requireField(data.name, 'name');
    this.description = requireField(data.description, 'description');
    this.url = requireField(data.url, 'url');
    this.order = requireNumber(data.order, 'order');
    this.courseId = requireField(data.courseId, 'courseId');
  }
}

function requireField<T>(value: T | undefined | null, fieldName: string): T {
  if (value === undefined || value === null || value === '') {
    throw new ModuleCreationError(`The "${fieldName}" field is required.`);
  }
  return value;
}

function requireNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number') {
    throw new ModuleCreationError(`The "${fieldName}" field must be a number.`);
  }
  return value;
}