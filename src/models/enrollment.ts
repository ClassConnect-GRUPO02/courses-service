export class Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrollmentDate: string;

  constructor(data: Partial<Enrollment>) {
    if (!data.userId) throw new Error('The "userId" field is required.');
    if (!data.courseId) throw new Error('The "courseId" field is required.');

    this.id = ''; // Id is not needed because it will be asigned after
    this.userId = data.userId;
    this.courseId = data.courseId;
    this.enrollmentDate = '';
  }
}