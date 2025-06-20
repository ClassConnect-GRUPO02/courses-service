// Fechas dinamicas utiles
const now = new Date();
const dueDate = new Date(now);
dueDate.setDate(now.getDate() + 7); // 7 días en el futuro

const visibleFrom = new Date(now);
visibleFrom.setDate(now.getDate() - 2); // 2 días atrás

const visibleUntil = new Date(now);
visibleUntil.setDate(now.getDate() + 8); // después del due date



// Simula una base de datos en memoria
export const mockDB = {
  courses: [
    {
      id: 'c1',
      name: 'Curso de JavaScript',
      description: 'Aprendé JS desde cero',
      shortDescription: 'JS básico',
      startDate: new Date('2025-04-01').toISOString(),
      endDate: new Date('2025-12-01').toISOString(),
      capacity: 30,
      enrolled: 5,
      category: 'Programación',
      level: 'Principiante',
      modality: 'Online',
      prerequisites: ['html', 'css'].join(','),
      imageUrl: 'https://image-url/1',
      creatorId: 'u1',
    },
    {
      id: 'c2',
      name: 'Curso de Python',
      description: 'Aprendé Python desde cero',
      shortDescription: 'Python básico',
      startDate: new Date('2024-05-01').toISOString(),
      endDate: new Date('2025-12-01').toISOString(),
      capacity: 30,
      enrolled: 3,
      category: 'Programación',
      level: 'Principiante',
      modality: 'Online',
      prerequisites: ['html', 'css'].join(','),
      imageUrl: 'https://image-url/2',
      creatorId: 'u2',
    },
  ],

  modules: [
    { id: 'm1', name: 'Módulo 1', description: 'Intro a JS', url: '', order: 0, courseId: 'c1' },
    { id: 'm2', name: 'Módulo 2', description: 'Funciones', url: '', order: 1, courseId: 'c1' },
    { id: 'm3', name: 'Módulo 3', description: 'Objetos', url: '', order: 2, courseId: 'c1' },

    { id: 'm4', name: 'Módulo 1', description: 'Intro a Python', url: '', order: 0, courseId: 'c2' },
    { id: 'm5', name: 'Módulo 2', description: 'Funciones', url: '', order: 1, courseId: 'c2' },
    { id: 'm6', name: 'Módulo 3', description: 'Objetos', url: '', order: 2, courseId: 'c2' },
  ],

  enrollments: [
    { id: 'e1', userId: 'u2', courseId: 'c1', enrollmentDate: new Date().toISOString() },
    { id: 'e2', userId: 'u3', courseId: 'c1', enrollmentDate: new Date().toISOString() },
    { id: 'e3', userId: 'u4', courseId: 'c1', enrollmentDate: new Date().toISOString() },
    { id: 'e4', userId: 'u5', courseId: 'c1', enrollmentDate: new Date().toISOString() },
    { id: 'e5', userId: 'u6', courseId: 'c1', enrollmentDate: new Date().toISOString() },
    { id: 'e6', userId: 'u7', courseId: 'c2', enrollmentDate: new Date().toISOString() },
    { id: 'e7', userId: 'u8', courseId: 'c2', enrollmentDate: new Date().toISOString() },
    { id: 'e8', userId: 'u9', courseId: 'c2', enrollmentDate: new Date().toISOString() },
  ],

  instructors: [
    { id: 'i1', courseId: 'c1', userId: 'u1', type: 'TITULAR', can_create_content: true, can_grade: true, can_update_course: true },
    { id: 'i2', courseId: 'c1', userId: 'u4', type: 'AUXILIAR', can_create_content: true, can_grade: true, can_update_course: false },
    { id: 'i4', courseId: 'c2', userId: 'u2', type: 'TITULAR', can_create_content: true, can_grade: true, can_update_course: true },
    { id: 'i3', courseId: 'c1', userId: 'u5', type: 'AUXILIAR', can_create_content: false, can_grade: true, can_update_course: true },
  ],

  tasks: [
    {
      id: 't1',
      course_id: 'c1',
      created_by: 'u1',
      type: 'tarea',
      title: 'Primer tarea',
      description: 'Ejercicio de variables',
      due_date: dueDate.toISOString(),
      allow_late: true,
      late_policy: 'aceptar_con_descuento',
      has_timer: false,
      time_limit_minutes: null,
      published: true,
      visible_from: visibleFrom.toISOString(),
      visible_until: visibleUntil.toISOString(),
      allow_file_upload: true,
      answer_format: 'archivo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: 't2',
      course_id: 'c1',
      created_by: 'u1',
      type: 'examen',
      title: 'Examen parcial',
      description: 'Examen de mitad de curso',
      due_date: new Date('3050-08-30').toISOString(),
      allow_late: false,
      late_policy: null,
      has_timer: true,
      time_limit_minutes: 60,
      published: true,
      visible_from: new Date('2024-05-01').toISOString(),
      visible_until: new Date('2024-05-21').toISOString(),
      allow_file_upload: false,
      answer_format: 'texto',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: 't3',
      course_id: 'c1',
      created_by: 'u2',
      type: 'tarea',
      title: 'Tarea de Python',
      description: 'Ejercicio de funciones',
      due_date: new Date('2024-06-10').toISOString(),
      allow_late: true,
      late_policy: 'aceptar_con_penalizacion',
      has_timer: false,
      time_limit_minutes: null,
      published: true,
      visible_from: new Date('2024-06-01').toISOString(),
      visible_until: new Date('2024-06-11').toISOString(),
      allow_file_upload: true,
      answer_format: 'mixto',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: 't4',
      course_id: 'c1',
      created_by: 'u2',
      type: 'examen',
      title: 'Examen de Python',
      description: 'Examen de mitad de curso de Python',
      due_date: new Date('2024-06-20').toISOString(),
      allow_late: false,
      late_policy: null,
      has_timer: true,
      time_limit_minutes: 90,
      published: false,
      visible_from: new Date('2024-06-01').toISOString(),
      visible_until: new Date('2024-06-21').toISOString(),
      allow_file_upload: false,
      answer_format: 'opcion_multiple',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
  ],

  resources: [
    {
      id: 'r1',
      description: 'Video introductorio',
      type: 'video',
      url: 'https://example.com/video.mp4',
      order: 1,
      moduleId: 'm1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'r2',
      description: 'PDF de referencia',
      type: 'pdf',
      url: 'https://example.com/reference.pdf',
      order: 2,
      moduleId: 'm1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'r3',
      description: 'Enlace a documentación',
      type: 'enlace',
      url: 'https://developer.mozilla.org/es/docs/Web/JavaScript/Guide',
      order: 1,
      moduleId: 'm2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],

  taskSubmission: [
    {
      id: 's1',
      task_id: 't1',
      student_id: 'u2',
      started_at: new Date('2024-05-01').toISOString(),
      status: 'submitted',
      grade: 5,
      feedback: "",
      time_spent: 45,
      file_url: 'https://example.com/solution1.pdf',
      submitted_at: new Date('2024-05-09').toISOString(),
    },
    {
      id: 's2',
      task_id: 't1',
      student_id: 'u2',
      started_at: new Date('2024-05-01').toISOString(),
      status: 'submitted',
      grade: 10,
      feedback: "",
      time_spent: 45,
      file_url: 'https://example.com/solution1.pdf',
      submitted_at: new Date('2024-05-09').toISOString(),
    }
  ],

  favorites: [
    { id: 'f1', course_id: 'c1', student_id: 'u2' },
    { id: 'f2', course_id: 'c1', student_id: 'u3' },
  ],

  studentFeedback: [
    {
      id: 'feedback1',
      course_id: 'c1',
      student_id: 'u2',
      instructor_id: 'u1',
      comment: 'El estudiante es muy participativo y siempre entrega sus tareas a tiempo.',
      punctuation: 5,
    }
  ],

  courseFeedback: [
    {
      id: 'courseFeedback1',
      course_id: 'c1',
      student_id: 'u2',
      comment: 'El curso es muy interesante y el instructor explica muy bien.',
      punctuation: 4.5,
    }
  ],

  taskQuestion: [
    {
      id: 'q1',
      task_id: 't2',
      text: '¿Qué es una variable en JavaScript?'
    },
    {
      id: 'q2',
      task_id: 't2',
      text: '¿Cuál es la diferencia entre `let` y `const`?'
    },
  ],

  studentAnswer: [
    {
      id: 'ans1',
      submission_id: 's2', // Asumiendo que 's2' es una entrega de 't2' (examen)
      question_id: 'q1',
      answer_text: 'Una variable es un contenedor para almacenar datos.'
    },
    {
      id: 'ans2',
      submission_id: 's2',
      question_id: 'q2',
      answer_text: '`let` permite reasignación, `const` no.'
    },
  ],

};
