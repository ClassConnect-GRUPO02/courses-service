import { ResourceCreationError } from "./errors";


export class Resource {
  id: string;
  description: string;
  type: string;
  url: string;
  order: number;
  moduleId: string

  constructor(data: Partial<Resource>) {
    this.id = '';
    this.description = requireField(data.description, 'description');
    this.type = requireField(data.type, 'type');
    this.url = requireField(data.url, 'url');
    this.order = requireNumber(data.order, 'order');
    this.moduleId = requireField(data.moduleId, 'module_id');
  }
}

function requireNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number') {
    throw new ResourceCreationError(`The "${fieldName}" field must be a number.`);
  }
  return value;
}

function requireField<T>(value: T | undefined | null, fieldName: string): T {
  if (value === undefined || value === null || value === '') {
    throw new ResourceCreationError(`The "${fieldName}" field is required.`);
  }
  return value;
}