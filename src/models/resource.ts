import { ResourceCreationError } from "./errors";


export class Resource {
  id: string;
  description: string;
  type: string;
  url: string;
  moduleId: string

  constructor(data: Partial<Resource>) {
    this.id = '';
    this.description = requireField(data.description, 'description');
    this.type = requireField(data.type, 'type');
    this.url = requireField(data.url, 'url');
    this.moduleId = requireField(data.moduleId, 'module_id');
  }
}



function requireField<T>(value: T | undefined | null, fieldName: string): T {
  if (value === undefined || value === null || value === '') {
    throw new ResourceCreationError(`The "${fieldName}" field is required.`);
  }
  return value;
}