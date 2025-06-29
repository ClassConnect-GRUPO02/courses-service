/* istanbul ignore file */

export const mockCourseRequestData = {
  name: 'Math',
  description: 'Basic Math Course',
  shortDescription: 'Learn the basics of math',
  startDate: '2023-05-01',
  endDate: '2023-06-01',
  capacity: 100,
  enrolled: 0,
  category: 'Science',
  level: 'Principiante' as const,
  modality: 'Online' as const,
  prerequisites: ['Basic Algebra'],
  imageUrl: 'http://example.com/image.png',
  creatorId: '12345',
};
