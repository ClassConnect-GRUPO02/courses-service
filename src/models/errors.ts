import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  public readonly type: string;
  public readonly status: number;
  public readonly detail: string;

  constructor(type: string, status: number, detail: string) {
      super(detail);
      this.type = type;
      this.status = status;
      this.detail = detail;
      Object.setPrototypeOf(this, new.target.prototype); // Mantener la cadena de prototipos
  }
}

export class CourseNotFoundError extends AppError {
  constructor(courseID: string) {
      super(
          'CourseNotFoundError',
          404,
          `Course with ID ${courseID} not found`
      );
  }
}

export class CourseCreationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ModuleCreationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ModuleNotFoundError extends AppError {
  constructor(moduleID: string) {
    super(
      'ModuleNotFoundError',
      404,
      `Module with ID ${moduleID} not found`
    );
  }
}

export class CourseFullError extends AppError {
  constructor(courseID: string) {
    super(
      'CourseFullError',
      400,
      `Course with ID ${courseID} is full`
    );
  }
}

export class AlreadyEnrolledError extends AppError {
  constructor(courseID: string, studentID: string) {
    super(
      'AlreadyEnrolledError',
      400,
      `Student with ID ${studentID} is already enrolled in course with ID ${courseID}`
    );
  }
}


export class TaskCreationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ResourceCreationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ResourceNotFoundError extends AppError {
  constructor(resourceID: string) {
    super(
      'ResourceNotFoundError',
      404,
      `Resource with ID ${resourceID} not found`
    );
  }
}

export class NotEnrolledError extends AppError {
  constructor(courseID: string, studentID: string) {
    super(
      'NotEnrolledError',
      403,
      `Student with ID ${studentID} is not enrolled in course with ID ${courseID}`
    );
  }
}

export class NotInstructorError extends AppError {
  constructor(courseID: string, instructorID: string) {
    super(
      'NotInstructorError',
      403,
      `Instructor with ID ${instructorID} is not instructor in course with ID ${courseID}`
    );
  }
}

export class AlreadyInstructorError extends AppError {
  constructor(courseID: string, instructorID: string) {
    super(
      'AlreadyInstructorError',
      400,
      `Instructor with ID ${instructorID} is already an instructor in course with ID ${courseID}`
    );
  }
}

export class PunctuationError extends AppError {
  constructor() {
    super(
      'PunctuationError',
      400,
      'Punctuation must be between 1 and 5'
    );
  }
}

export class CommentOrPuntuationNotFoundError extends AppError {
  constructor() {
    super(
      'CommentOrPuntuationNotFoundError',
      400,
      'Comment or punctuation not found'
    );
  }
}

export class AlreadyGaveFeedbackError extends AppError {
  constructor(courseID: string, studentID: string) {
    super(
      'AlreadyGaveFeedbackError',
      400,
      `Feedback already exists for course ${courseID} by student ${studentID}`
    );
  }
}

export class AlreadyGaveFeedbackToStudentError extends AppError {
  constructor(courseID: string, studentID: string) {
    super(
      'AlreadyGaveFeedbackToStudentError',
      400,
      `Feedback already exists for student ${studentID} in course ${courseID}`
    );
  }
}

export class AlreadyFavoriteError extends AppError {
  constructor(courseID: string, studentID: string) {
    super(
      'AlreadyFavoriteError',
      400,
      `Course with ID ${courseID} is already in favorites for student with ID ${studentID}`
    );
  }
}

export class NotFavoriteError extends AppError {
  constructor(courseID: string, studentID: string) {
    super(
      'NotFavoriteError',
      400,
      `Course with ID ${courseID} is not in favorites for student with ID ${studentID}`
    );
  }
}

export class AuthorizationError extends AppError {
  constructor(id: string) {
    super(
      'AuthorizationError',
      StatusCodes.FORBIDDEN,
      `User with id: ${id} is not authorized to perform this action`
    );
  }
}

export class NotFoundError extends AppError {
  constructor(id: string, type: string) {
    super(
      'NotFoundError',
      StatusCodes.NOT_FOUND,
      `${type} with id: ${id} not found`
    );
  }
}