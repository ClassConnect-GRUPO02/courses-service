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