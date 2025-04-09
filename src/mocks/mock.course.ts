import { Course } from '../models/course';
 
 export const mockCourse: Course = {
   id: '',
   name: 'Math',
   description: 'Basic Math Course',
   shortDescription: 'Learn the basics of math',
   startDate: '2023-05-01',
   endDate: '2023-06-01',
   instructor: {
     name: 'John Doe',
     profile: 'Professor of Mathematics',
   },
   capacity: 100,
   enrolled: 50,
   category: 'Science',
   level: 'Principiante',
   modality: 'Online',
   prerequisites: ['Basic Algebra'],
   isEnrolled: false,
   imageUrl: 'http://example.com/image.png',
 };