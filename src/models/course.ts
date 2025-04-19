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
  creatorId: string; // Optional field for the creator of the course

  constructor(data: Partial<Course>) {
    if (!data.name) throw new CourseCreationError('The "name" field is required.');
    if (!data.description) throw new CourseCreationError('The "description" field is required.');
    if (!data.shortDescription) throw new CourseCreationError('The "shortDescription" field is required.');
    if (!data.startDate) throw new CourseCreationError('The "startDate" field is required.');
    if (!data.endDate) throw new CourseCreationError('The "endDate" field is required.');
    if (data.capacity === undefined) throw new CourseCreationError('The "capacity" field is required.');
    if (data.enrolled === undefined) throw new CourseCreationError('The "enrolled" field is required.');
    if (!data.category) throw new CourseCreationError('The "category" field is required.');
    if (!data.level) throw new CourseCreationError('The "level" field is required.');
    if (!data.modality) throw new CourseCreationError('The "modality" field is required.');
    if (!data.prerequisites) throw new CourseCreationError('The "prerequisites" field is required.');
    if (!data.imageUrl) throw new CourseCreationError('The "imageUrl" field is required.');
    if (!data.creatorId) throw new CourseCreationError('The "creatorId" field is required.');

    this.id = data.id || ''; // Id is not needed because it will be asigned after
    this.name = data.name;
    this.description = data.description;
    this.shortDescription = data.shortDescription;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.capacity = data.capacity;
    this.enrolled = data.enrolled;
    this.category = data.category;
    this.level = data.level;
    this.modality = data.modality;
    this.prerequisites = data.prerequisites;
    this.imageUrl = data.imageUrl;
    this.creatorId = data.creatorId;
  }
}