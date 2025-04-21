import { Enrollment } from "../models/enrollment";
import { mockEnrollmentRequestData } from "./mocks/mock.enrollment";

describe('Enrollment constructor', () => {

  it('should create an enrollment with valid data', () => {
    const newEnrollment = new Enrollment(mockEnrollmentRequestData);
    expect(newEnrollment.courseId).toBe(mockEnrollmentRequestData.courseId);
    expect(newEnrollment.userId).toBe(mockEnrollmentRequestData.userId);
  });

  it('should throw an error if userId is missing', () => {
    expect(() => {
      new Enrollment({ ...mockEnrollmentRequestData, userId: undefined });
    }).toThrow('The "userId" field is required.');
  });

  it('should throw an error if courseId is missing', () => {
    expect(() => {
      new Enrollment({ ...mockEnrollmentRequestData, courseId: undefined });
    }).toThrow('The "courseId" field is required.');
  });

});