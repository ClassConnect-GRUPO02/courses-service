import { CourseCreationError } from "../models/errors";


export class Course {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolled: number;
  category: string;
  level: "Principiante" | "Intermedio" | "Avanzado";
  modality: "Online" | "Presencial" | "Híbrido";
  prerequisites: string[];
  isEnrolled?: boolean;
  imageUrl: string;
  creatorId: string;
  
  constructor(data: Partial<Course>) {
    if (!data.startDate) throw new CourseCreationError('The "startDate" field is required.');
    if (!data.endDate) throw new CourseCreationError('The "endDate" field is required.');
    if (!data.level) throw new CourseCreationError('The "level" field is required.');
    if (!data.modality) throw new CourseCreationError('The "modality" field is required.');
    if (!data.prerequisites) throw new CourseCreationError('The "prerequisites" field is required.');
    
    this.id = data.id || '';
    this.name = requireField(data.name, 'name');
    this.description = requireField(data.description, 'description');
    this.shortDescription = requireField(data.shortDescription, 'shortDescription');
    this.startDate = validateDateString(data.startDate, "startDate");
    this.endDate = validateDateString(data.endDate, "endDate");
    this.capacity = requireNumber(data.capacity, 'capacity');
    this.enrolled = requireNumber(data.enrolled, 'enrolled');
    this.category = requireField(data.category, 'category');
    this.level = data.level;
    this.modality = data.modality;
    this.prerequisites = data.prerequisites;
    this.imageUrl = requireField(data.imageUrl, 'imageUrl');
    this.creatorId = requireField(data.creatorId, 'creatorId');
  }
}

export function validateDateString(value: string, fieldName: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new CourseCreationError(`Invalid date format for "${fieldName}".`);
  }
  return value;
}

function requireField<T>(value: T | undefined | null, fieldName: string): T {
  if (value === undefined || value === null || value === '') {
    throw new CourseCreationError(`The "${fieldName}" field is required.`);
  }
  return value;
}

function requireNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number') {
    throw new CourseCreationError(`The "${fieldName}" field must be a number.`);
  }
  return value;
}