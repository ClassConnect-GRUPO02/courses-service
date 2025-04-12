import { ModuleCreationError } from "./errors";

export class Module {
  id: string;
  name: string;
  description: string;
  url: string;
  order: number;
  courseId: string

  constructor(data: Partial<Module>) {
    if (!data.name) throw new ModuleCreationError('The "name" field is required.');
    if (!data.description) throw new ModuleCreationError('The "description" field is required.');
    if (!data.url) throw new ModuleCreationError('The "url" field is required.');
    if (data.order === undefined) throw new ModuleCreationError('The "order" field is required.');
    if (!data.courseId) throw new ModuleCreationError('The "courseId" field is required.');

    this.id = data.id || ''; // Id is not needed because it will be asigned after
    this.name = data.name;
    this.description = data.description;
    this.url = data.url;
    this.order = data.order;
    this.courseId = data.courseId;
  }
}