import { Server } from 'http';
import app from './src/app';
import { v4 as uuidv4 } from 'uuid';
import { mockDB } from './src/tests/mocks/mock.db';
import { AnswerInput, createTaskSubmission } from './src/database/task_db';
import { remove } from 'winston';
import { getCoursesIdsByInstructorId, getInstructorPermissions, isTitularInCourse, updateInstructorPermissions } from './src/database/instructor_db';
import { SubmissionStatus } from '@prisma/client';

let server: Server;

export interface Instructor {
  id: string;
  courseId: string;
  userId: string;
  type: string;
}

jest.mock('./src/database/course_db', () => ({
  getCourses: jest.fn().mockImplementation(() => {
    return Promise.resolve(mockDB.courses); 
  }),

  getCourseById: jest.fn().mockImplementation((id: string) => {
    return Promise.resolve(mockDB.courses.find(course => course.id === id) || null);
  }),

  addCourse: jest.fn().mockImplementation((courseData) => {
    const id = uuidv4().toString();
    const newCourse = { ...courseData, id, modules: [] };
    mockDB.courses.push(newCourse); 
    return Promise.resolve(newCourse);
  }),

  updateCourse: jest.fn().mockImplementation((id: string, updatedData) => {
    const course = mockDB.courses.find(course => course.id === id);
    if (!course) return Promise.resolve(null);
    const updatedCourse = { ...course, ...updatedData };
    const index = mockDB.courses.findIndex(course => course.id === id);
    mockDB.courses[index] = updatedCourse; 
    return Promise.resolve(updatedCourse);
  }),

  deleteCourse: jest.fn().mockImplementation((id: string) => {
    const courseIndex = mockDB.courses.findIndex(course => course.id === id);
    if (courseIndex === -1) return Promise.resolve(null);
    const deleted = mockDB.courses[courseIndex];
    mockDB.courses.splice(courseIndex, 1);
    return Promise.resolve(deleted);
  }),

  getCoursesByUserId: jest.fn().mockImplementation((userId: string) => {
    const enrollments = mockDB.enrollments.filter(enrollment => enrollment.userId === userId);
    const courseIds = enrollments.map(enrollment => enrollment.courseId);
    const courses = mockDB.courses.filter(course => courseIds.includes(course.id));
    return Promise.resolve(courses)
  }),

}));

jest.mock('./src/database/module_db', () => ({
  addModuleToCourse: jest.fn().mockImplementation((courseId, moduleData) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) return Promise.resolve(null);
    const id = uuidv4().toString();
    const newModule = { ...moduleData, id };
    mockDB.modules.push(newModule); 
    return Promise.resolve(newModule);
  }),

  getModulesByCourseId: jest.fn().mockImplementation((courseId: string) => {
    const courseModules = mockDB.modules.filter(module => module.courseId === courseId);
    const orderedModules = courseModules.sort((a, b) => a.order - b.order); 
    return Promise.resolve(orderedModules);
  }),

  getModuleById: jest.fn().mockImplementation((courseId: string, moduleId: string) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) return Promise.resolve(null);
    const module = mockDB.modules.find(mod => mod.id === moduleId); 
    return Promise.resolve(module || null);
  }),

  deleteModule: jest.fn().mockImplementation((courseId: string, moduleId: string) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) return Promise.resolve(false);
    const moduleIndex = mockDB.modules.findIndex(mod => mod.id === moduleId);
    if (moduleIndex === -1) return Promise.resolve(false);
    mockDB.modules.splice(moduleIndex, 1); 
    return Promise.resolve(true);
  }),

  updateModulesOrder: jest.fn().mockImplementation((courseId: string, newOrder: string[]) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) return Promise.resolve();
    newOrder.forEach((moduleId, index) => {
      const module = mockDB.modules.find(m => m.id === moduleId);
      if (module) {
        module.order = index; 
      }
    });
    return Promise.resolve();
  }),
  
  updateModule: jest.fn().mockImplementation((courseId: string, moduleId: string, updatedData) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) return Promise.resolve(null);
    const moduleIndex = mockDB.modules.findIndex(mod => mod.id === moduleId);
    if (moduleIndex === -1) return Promise.resolve(null);
    const updatedModule = { ...mockDB.modules[moduleIndex], ...updatedData };
    mockDB.modules[moduleIndex] = updatedModule; 
    return Promise.resolve(updatedModule);
  }),
}));

jest.mock('./src/database/enrollment_db', () => ({
  enrollStudent: jest.fn().mockImplementation((courseId: string, studentId: string) => {
    const existing = mockDB.enrollments.find(
      (e) => e.courseId === courseId && e.userId === studentId
    );

    if (existing) return Promise.resolve(null);

    const newEnrollment = {
      id: uuidv4(),
      userId: studentId,
      courseId,
      enrollmentDate: new Date().toISOString(),
    };

    mockDB.enrollments.push(newEnrollment); 
    return Promise.resolve(newEnrollment);
  }),

  isEnrolledInCourse: jest.fn().mockImplementation((courseId: string, userId: string) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }
    const found = mockDB.enrollments.find(
      (enrollment) => enrollment.courseId === courseId && enrollment.userId === userId
    );
    return Promise.resolve(!!found);
  }),

  getEnrollmentsByCourseId: jest.fn().mockImplementation((courseId: string) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }
    const enrollments = mockDB.enrollments.filter(enrollment => enrollment.courseId === courseId);
    return Promise.resolve(enrollments.map((enrollment) => ({
      ...enrollment,
      enrollmentDate: new Date(enrollment.enrollmentDate).toISOString(), // 👈 conversión a string
    })));
  }),

}));

jest.mock('./src/database/instructor_db', () => ({
  addInstructorToCourse: jest.fn().mockImplementation((courseId: string, instructorId: string, type: string) => {
    const newInstructor = {
      id: uuidv4(),
      courseId,
      userId: instructorId,
      type,
      can_create_content: true,
      can_grade: true,
      can_update_course: true,
    };
    mockDB.instructors.push(newInstructor); 
    return Promise.resolve(true);
  }),

  isInstructorInCourse: jest.fn().mockImplementation((courseId: string, instructorId: string) => {
    const found = mockDB.instructors.find(
      (inst) => inst.courseId === courseId && inst.userId === instructorId
    );
    return Promise.resolve(!!found);
  }),

  removeInstructorFromCourse: jest.fn().mockImplementation((courseId, instructorId) => {
    const index = mockDB.instructors.findIndex(
      (inst) => inst.courseId === courseId && inst.userId === instructorId
    );

    if (index === -1) return Promise.resolve(false);

    mockDB.instructors.splice(index, 1); // elimina uno
    return Promise.resolve(true); // retorna `true` porque se eliminó
  }),

  isTitularInCourse: jest.fn().mockImplementation((courseId: string, instructorId: string) => {
    if (!instructorId) {
      return Promise.resolve(false);
    }
    const found = mockDB.instructors.find(
      (inst) => inst.courseId === courseId && inst.userId === instructorId && inst.type === 'TITULAR'
    );
    return Promise.resolve(!!found);
  }),

  updateInstructorPermissions: jest.fn().mockImplementation((courseId: string, instructorId: string, can_create_content: boolean, can_grade: boolean, can_update_course: boolean) => {
    const instructorIndex = mockDB.instructors.findIndex(
      (inst) => inst.courseId === courseId && inst.userId === instructorId
    );
    if (instructorIndex === -1) return Promise.resolve(false);
    
    const updatedInstructor = {
      ...mockDB.instructors[instructorIndex],
      can_create_content,
      can_grade,
      can_update_course,
    };
    
    mockDB.instructors[instructorIndex] = updatedInstructor; 
    return Promise.resolve(true);
  }),

  getInstructorPermissions: jest.fn().mockImplementation((courseId: string, instructorId: string) => {
    const instructor = mockDB.instructors.find(
      (inst) => inst.courseId === courseId && inst.userId === instructorId
    );
    if (!instructor) return Promise.resolve(null);
    return Promise.resolve(instructor);
  }),

  getCoursesIdsByInstructorId: jest.fn().mockImplementation((instructorId: string) => {
    const coursesIds = mockDB.instructors
      .filter(inst => inst.userId === instructorId)
      .map(inst => inst.courseId);
    return Promise.resolve(coursesIds);
  }),
}));

jest.mock('./src/database/resource_db', () => ({
  // Mocks for resources

  addResourceToModule: jest.fn().mockImplementation((moduleId: string, resourceData) => {
    const module = mockDB.modules.find(mod => mod.id === moduleId);
    if (!module) return Promise.resolve(null);
    const id = uuidv4().toString();
    const newResource = { ...resourceData, id };
    mockDB.resources.push(newResource); 
    return Promise.resolve(newResource);
  }),

  // Deletes resource from module
  deleteResourceFromModule: jest.fn().mockImplementation((moduleId: string, resourceId: string) => {
    const module = mockDB.modules.find(mod => mod.id === moduleId);
    if (!module) return Promise.resolve(false);
    const resourceIndex = mockDB.resources.findIndex(res => res.id === resourceId);
    if (resourceIndex === -1) return Promise.resolve(false);
    mockDB.resources.splice(resourceIndex, 1); 
    return Promise.resolve(true);
  }),

  // Get resources by module ID
  getResourcesByModuleId: jest.fn().mockImplementation((moduleId: string) => {
    const module = mockDB.modules.find(mod => mod.id === moduleId);
    if (!module) return Promise.resolve([]);
    const resources = mockDB.resources
      .filter(res => res.moduleId === moduleId)
      .sort((a, b) => a.order - b.order); // orden por campo "order"
    return Promise.resolve(resources);
  }),

  // Update resource by ID inside module
  updateResource: jest.fn().mockImplementation((moduleId: string, resourceId: string, resourceData) => {
    const module = mockDB.modules.find(mod => mod.id === moduleId);
    if (!module) return Promise.resolve(null);
    const resourceIndex = mockDB.resources.findIndex(res => res.id === resourceId);
    if (resourceIndex === -1) return Promise.resolve(null);
    const updatedResource = { ...mockDB.resources[resourceIndex], ...resourceData };
    mockDB.resources[resourceIndex] = updatedResource; 
    return Promise.resolve(updatedResource);
  }),

  // Updates resources order in a module
  updateResourcesOrder: jest.fn().mockImplementation((moduleId: string, orderedResourceIds: string[]) => {
    const module = mockDB.modules.find(mod => mod.id === moduleId);
    if (!module) return Promise.resolve();
    orderedResourceIds.forEach((resourceId, index) => {
      const resource = mockDB.resources.find(res => res.id === resourceId);
      if (resource) {
        resource.order = index; 
      }
    });
    return Promise.resolve();
  }),
}));

jest.mock('./src/database/task_db', () => ({
  addTaskToCourse: jest.fn().mockImplementation((courseId: string, taskData) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) return Promise.resolve(null);
    const id = uuidv4().toString();
    const newTask = { ...taskData, id };
    mockDB.tasks.push(newTask);
    return Promise.resolve(newTask);
  }),

  getTasksByStudentId: jest.fn().mockImplementation((studentId: string) => {
    const enrolledCoursesIds = mockDB.enrollments
    .filter((enrollment) => enrollment.userId === studentId)
    .map((enrollment) => enrollment.courseId);

    const tasks = mockDB.tasks.filter(
      (task) => enrolledCoursesIds.includes(task.course_id) && task.published
    );

    return tasks.map((task) => ({
      ...task,
      due_date: new Date(task.due_date).toISOString(),
      visible_from: task.visible_from ? new Date(task.visible_from).toISOString() : null,
      visible_until: task.visible_until ? new Date(task.visible_until).toISOString() : null,
      created_at: new Date(task.created_at).toISOString(),
      updated_at: new Date(task.updated_at).toISOString(),
      deleted_at: task.deleted_at ? new Date(task.deleted_at).toISOString() : null,
    }));
  }),

  updateTask: jest.fn().mockImplementation((courseId: string, taskId: string, taskData) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) return Promise.resolve(null);
    const taskIndex = mockDB.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return Promise.resolve(null);
    const updatedTask = { ...mockDB.tasks[taskIndex], ...taskData };
    mockDB.tasks[taskIndex] = updatedTask; 
    return Promise.resolve(updatedTask);
  }),
  
  getTasksByCourseId: jest.fn().mockImplementation((courseId: string) => {
    const course = mockDB.courses.find(course => course.id === courseId);
    if (!course) return Promise.resolve([]);
    const tasks = mockDB.tasks.filter(task => task.course_id === courseId);
    return Promise.resolve(tasks.map((task) => ({
      ...task,
      due_date: new Date(task.due_date).toISOString(),
      visible_from: task.visible_from ? new Date(task.visible_from).toISOString() : null,
      visible_until: task.visible_until ? new Date(task.visible_until).toISOString() : null,
      created_at: new Date(task.created_at).toISOString(),
      updated_at: new Date(task.updated_at).toISOString(),
      deleted_at: task.deleted_at ? new Date(task.deleted_at).toISOString() : null,
    })));
  }),

  deleteTask: jest.fn().mockImplementation((taskId: string) => {
    const taskIndex = mockDB.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return Promise.resolve(null);
    const deletedTask = mockDB.tasks[taskIndex];
    mockDB.tasks.splice(taskIndex, 1); 
    return Promise.resolve(deletedTask);
  }),

  getTaskById: jest.fn().mockImplementation((taskId: string) => {
    const task = mockDB.tasks.find(task => task.id === taskId);
    if (!task) return Promise.resolve(null);
    return Promise.resolve({
      ...task,
      due_date: new Date(task.due_date).toISOString(),
      visible_from: task.visible_from ? new Date(task.visible_from).toISOString() : null,
      visible_until: task.visible_until ? new Date(task.visible_until).toISOString() : null,
      created_at: new Date(task.created_at).toISOString(),
      updated_at: new Date(task.updated_at).toISOString(),
      deleted_at: task.deleted_at ? new Date(task.deleted_at).toISOString() : null,
    });
  }),

  createEmptyTaskSubmission: jest.fn().mockImplementation(
    (task_id: string, student_id: string, started_at: Date) => {
      const submission = {
        id: uuidv4(),
        task_id,
        student_id,
        started_at: started_at.toISOString(),
        submitted_at: '',
        status: 'started',
        answers: [],
        file_url: '',
        grade: 0,
        feedback: '',
        time_spent: 0,
      };
      mockDB.taskSubmission.push(submission);
      return Promise.resolve({ ...submission });
    }),

  updateTaskSubmissionWithAnswers: jest.fn().mockImplementation(
  async (
    submissionId: string,
    answers: AnswerInput[],
    file_url: string | null,
    submitted_at: Date,
    status: 'submitted' | 'late'
  ) => {
    // Elimina respuestas anteriores
    mockDB.studentAnswer = mockDB.studentAnswer.filter(
      (a) => a.submission_id !== submissionId
    );

    // Agrega nuevas respuestas
    const newAnswers = answers.map((a) => ({
      id: uuidv4(),
      submission_id: submissionId,
      question_id: a.question_id,
      answer_text: a.answer_text,
      selected_option_id: null,
    }));

    mockDB.studentAnswer.push(...newAnswers);

    // Actualiza la submission
    const submission = mockDB.taskSubmission.find((s) => s.id === submissionId);
    if (!submission) throw new Error('Submission not found');

    submission.submitted_at = submitted_at.toISOString();
    submission.status = status;
    submission.file_url = file_url? file_url : '';

    return Promise.resolve({ ...submission });
  }),

  getTaskSubmission: jest.fn().mockImplementation((taskId: string, studentId: string) => {
    const submission = mockDB.taskSubmission.find(sub => sub.task_id === taskId && sub.student_id === studentId && (sub.status === 'submitted' || sub.status === 'late'));
    if (!submission) return Promise.resolve(null);
    return Promise.resolve({
      ...submission,
      submitted_at: new Date(submission.submitted_at).toISOString(),
    });
  }),

  createTaskSubmission: jest.fn().mockImplementation((task_id: string, student_id: string, answers: AnswerInput[], file_url: string, submitted_at: Date, status: string) => {
    const submissionId = uuidv4();
    const newSubmission = {
      id: submissionId,
      task_id,
      student_id,
      started_at: submitted_at.toISOString(),
      submitted_at: submitted_at.toISOString(),
      status,
      grade: 0,
      feedback: '',
      time_spent: 0,
      file_url,
    }
    mockDB.taskSubmission.push(newSubmission);
    answers.forEach(a => {
    mockDB.studentAnswer.push({
      id: uuidv4(),
      submission_id: submissionId,
      question_id: a.question_id,
      answer_text: a.answer_text,
    });
  });
    return Promise.resolve(newSubmission);
  }),

  findTasksByInstructor: jest.fn().mockImplementation((instructorId: string, skip: number, pageSize: number) => {
    const tasks = mockDB.tasks.filter(task => task.created_by === instructorId);
    const total = tasks.length;
    const paginatedTasks = tasks.slice(skip, skip + pageSize);
    return Promise.resolve([paginatedTasks, total]);
  }),

  countTasksByInstructor: jest.fn().mockImplementation((instructorId: string) => {
    const tasks = mockDB.tasks.filter(task => task.created_by === instructorId);
    return Promise.resolve(tasks.length);
  }),

  updateTaskSubmission: jest.fn().mockImplementation((taskId: string, studentId: string, grade: number, feedback: string, instructorId: string) => {
    const submissionIndex = mockDB.taskSubmission.findIndex(
      sub => sub.task_id === taskId && sub.student_id === studentId
    );

    if (submissionIndex === -1) return Promise.resolve(null);

    const updatedSubmission = {
      ...mockDB.taskSubmission[submissionIndex],
      grade,      
      feedback     
    };

    mockDB.taskSubmission[submissionIndex] = updatedSubmission;

    return Promise.resolve(updatedSubmission);
  }),

}));

jest.mock('./src/database/favorites_db', () => ({
  addCourseToFavorites: jest.fn().mockImplementation((courseId: string, studentId: string) => {
    const newFavorite = {
      id: uuidv4(),
      course_id: courseId,
      student_id: studentId,
    };
    mockDB.favorites.push(newFavorite);
    return Promise.resolve(newFavorite);
  }),
  removeCourseFromFavorites: jest.fn().mockImplementation((courseId: string, studentId: string) => {
    const favoriteIndex = mockDB.favorites.findIndex(fav => fav.course_id === courseId && fav.student_id === studentId);
    if (favoriteIndex === -1) return Promise.resolve(null);
    const deletedFavorite = mockDB.favorites[favoriteIndex];
    mockDB.favorites.splice(favoriteIndex, 1);
    return Promise.resolve(deletedFavorite);
  }),

  favoriteAlreadyExists: jest.fn().mockImplementation((courseId: string, studentId: string) => {
    const found = mockDB.favorites.find(fav => fav.course_id === courseId && fav.student_id === studentId);
    return Promise.resolve(!!found);
  }),
  
  getFavoriteCourses: jest.fn().mockImplementation((studentId: string) => {
    const favorites = mockDB.favorites.filter(fav => fav.student_id === studentId);
    return Promise.resolve(favorites.map(fav => ({
      ...fav,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })));
  }),
}));

jest.mock('./src/database/feedback_db', () => ({
  addFeedbackToStudent: jest.fn().mockImplementation((course_id: string, student_id: string, instructor_id: string, comment: string, punctuation: number) => {
    const newFeedback = {
      id: uuidv4(),
      course_id,
      student_id,
      instructor_id,
      comment,
      punctuation,
    };
    mockDB.studentFeedback.push(newFeedback);
    return Promise.resolve(newFeedback);
  }),

  getFeedbacksAsStudent: jest.fn().mockImplementation((student_id: string) => {
    const feedbacks = mockDB.studentFeedback.filter(feedback => feedback.student_id === student_id);
    return Promise.resolve(feedbacks);
  }),

  studentFeedbackAlreadyExists: jest.fn().mockImplementation((course_id: string, student_id: string) => {
    const found = mockDB.studentFeedback.find(feedback => feedback.course_id === course_id && feedback.student_id === student_id);
    return Promise.resolve(!!found);
  }),

  addFeedbackToCourse: jest.fn().mockImplementation((course_id: string, student_id: string, comment: string, punctuation: number) => {
    const newFeedback = {
      id: uuidv4(),
      course_id,
      student_id,
      comment,
      punctuation,
    };
    mockDB.courseFeedback.push(newFeedback);
    return Promise.resolve(newFeedback);
  }),

  feedbackAlreadyExists: jest.fn().mockImplementation((course_id: string, student_id: string) => {
    const found = mockDB.courseFeedback.find(feedback => feedback.course_id === course_id && feedback.student_id === student_id);
    return Promise.resolve(!!found);
  }),

  getFeedbacksByCourseId: jest.fn().mockImplementation((course_id: string) => {
    const feedbacks = mockDB.courseFeedback.filter(feedback => feedback.course_id === course_id);
    return Promise.resolve(feedbacks);
  }),
}));

jest.mock('./src/lib/ai', () => ({
  getFeedbackWithAI: jest.fn().mockImplementation((taskSubmissionId: string) => {
    const submission = mockDB.taskSubmission.find(sub => sub.id === taskSubmissionId);
    if (!submission) return Promise.resolve(null);
    const aiFeedback = `AI feedback for submission ${taskSubmissionId}`;
    return Promise.resolve({
      taskSubmissionId,
      feedback: aiFeedback,
      grade: submission.grade,
      timeSpent: submission.time_spent,
      fileUrl: submission.file_url,
    });
  }),
}));




beforeAll((done) => {
  server = app.listen(3001, () => {
    console.log('Test server running on http://localhost:3001');
    done();
  });
});

afterAll((done) => {
  server.close(() => {
    console.log('Test server stopped');
    done();
  });
});
