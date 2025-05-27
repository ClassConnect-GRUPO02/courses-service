import { PrismaClient, InstructorType, TaskType, LatePolicy, AnswerFormat, SubmissionStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$connect(); // Asegura que la conexión esté establecida

  await prisma.studentAnswer.deleteMany();

  await prisma.taskSubmission.deleteMany();
  await prisma.taskQuestion.deleteMany();

  await prisma.task.deleteMany(); // Task es hija de Course
  await prisma.resource.deleteMany(); // Resource es hija de Module

  await prisma.module.deleteMany(); // Module es hija de Course

  await prisma.enrollment.deleteMany(); // Mapeada a 'course_student'
  await prisma.courseInstructor.deleteMany(); // Mapeada a 'courses_instructors'
  await prisma.courseFeedback.deleteMany(); // Mapeada a 'course_feedback'
  await prisma.studentFeedback.deleteMany(); // Mapeada a 'student_feedback'
  await prisma.favoriteCourse.deleteMany(); // Mapeada a 'favorite_courses'

  await prisma.course.deleteMany();

  // Crear cursos
  await prisma.course.createMany({
    data: [
      {
        id: 'c1',
        name: 'Curso de JavaScript',
        description: 'Aprendé JS desde cero',
        shortDescription: 'JS básico',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-06-01'),
        capacity: 30,
        enrolled: 5,
        category: 'Programación',
        level: 'Principiante',
        modality: 'Online',
        prerequisites: 'html,css',
        imageUrl: 'https://image-url/1',
        creatorId: '5',
      },
      {
        id: 'c2',
        name: 'Curso de Python',
        description: 'Aprendé Python desde cero',
        shortDescription: 'Python básico',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2025-06-01'),
        capacity: 30,
        enrolled: 0,
        category: 'Programación',
        level: 'Principiante',
        modality: 'Online',
        prerequisites: 'html,css',
        imageUrl: 'https://image-url/2',
        creatorId: '6',
      },
    ],
  });

  // Crear módulos (depende de Course)
  await prisma.module.createMany({
    data: [
      { id: 'm1', name: 'Módulo 1', description: 'Intro a JS', url: '', order: 0, courseId: 'c1' },
      { id: 'm2', name: 'Módulo 2', description: 'Funciones', url: '', order: 1, courseId: 'c1' },
      { id: 'm3', name: 'Módulo 3', description: 'Objetos', url: '', order: 2, courseId: 'c1' },
      { id: 'm4', name: 'Módulo 1', description: 'Intro a Python', url: '', order: 0, courseId: 'c2' },
      { id: 'm5', name: 'Módulo 2', description: 'Funciones', url: '', order: 1, courseId: 'c2' },
      { id: 'm6', name: 'Módulo 3', description: 'Objetos', url: '', order: 2, courseId: 'c2' },
    ],
  });

  // Crear inscripciones (depende de Course)
  await prisma.enrollment.createMany({
    data: [
      { id: 'e1', userId: '7', courseId: 'c1', enrollmentDate: new Date() },
      { id: 'e2', userId: 'u3', courseId: 'c1', enrollmentDate: new Date() },
      { id: 'e3', userId: 'u4', courseId: 'c1', enrollmentDate: new Date() },
      { id: 'e4', userId: 'u5', courseId: 'c1', enrollmentDate: new Date() },
      { id: 'e5', userId: 'u6', courseId: 'c1', enrollmentDate: new Date() },
      { id: 'e6', userId: 'u7', courseId: 'c2', enrollmentDate: new Date() },
      { id: 'e7', userId: 'u8', courseId: 'c2', enrollmentDate: new Date() },
      { id: 'e8', userId: 'u9', courseId: 'c2', enrollmentDate: new Date() },
    ],
  });

  // Crear instructores (depende de Course)
  await prisma.courseInstructor.createMany({
    data: [
      { id: 'i1', courseId: 'c1', userId: '5', type: InstructorType.TITULAR },
      { id: 'i2', courseId: 'c1', userId: '6', type: InstructorType.AUXILIAR },
      { id: 'i3', courseId: 'c1', userId: 'u5', type: InstructorType.AUXILIAR },
      { id: 'i4', courseId: 'c2', userId: '6', type: InstructorType.TITULAR },
    ],
  });

  // Crear tareas (depende de Course)
  await prisma.task.createMany({
    data: [
      {
        id: 't1',
        course_id: 'c1',
        created_by: '5',
        type: TaskType.tarea,
        title: 'Primer tarea',
        description: 'Ejercicio de variables',
        due_date: new Date('2025-05-30T19:59:00'),
        allow_late: true,
        late_policy: LatePolicy.aceptar_con_descuento,
        has_timer: false,
        time_limit_minutes: null,
        published: true,
        visible_from: new Date('2025-05-30'),
        visible_until: new Date('2025-05-31'),
        allow_file_upload: true,
        answer_format: 'archivo',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        id: 't2',
        course_id: 'c1',
        created_by: '6',
        type: TaskType.examen,
        title: 'Examen parcial',
        description: 'Examen de mitad de curso',
        due_date: new Date('2025-06-05'), // futuro realista
        allow_late: false,
        late_policy: LatePolicy.ninguna,
        has_timer: true,
        time_limit_minutes: 60,
        published: true,
        visible_from: new Date('2025-05-25'),
        visible_until: new Date('2025-06-05'),
        allow_file_upload: false,
        answer_format: AnswerFormat.preguntas_respuestas,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        id: 't3',
        course_id: 'c1',
        created_by: '5',
        type: TaskType.tarea,
        title: 'Tarea de Python',
        description: 'Ejercicio de funciones',
        due_date: new Date('2025-06-10'),
        allow_late: true,
        late_policy: LatePolicy.aceptar_con_penalizacion,
        has_timer: false,
        time_limit_minutes: null,
        published: true,
        visible_from: new Date('2025-06-01'),
        visible_until: new Date('2025-06-10'),
        allow_file_upload: true,
        answer_format: AnswerFormat.archivo,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        id: 't4',
        course_id: 'c1',
        created_by: '5',
        type: TaskType.examen,
        title: 'Examen de Python',
        description: 'Examen de mitad de curso de Python',
        due_date: new Date('2025-06-20'),
        allow_late: false,
        late_policy: LatePolicy.ninguna,
        has_timer: true,
        time_limit_minutes: 90,
        published: false,
        visible_from: new Date('2025-06-10'),
        visible_until: new Date('2025-06-20'),
        allow_file_upload: false,
        answer_format: AnswerFormat.archivo,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ],
});

  // Crear recursos (depende de Module)
  await prisma.resource.createMany({
    data: [
      {
        id: 'r1',
        description: 'Video introductorio',
        type: 'video',
        url: 'https://example.com/video.mp4',
        order: 1,
        moduleId: 'm1',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'r2',
        description: 'PDF de referencia',
        type: 'pdf',
        url: 'https://example.com/reference.pdf',
        order: 2,
        moduleId: 'm1',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'r3',
        description: 'Enlace a documentación',
        type: 'enlace',
        url: 'https://developer.mozilla.org/es/docs/Web/JavaScript/Guide',
        order: 1,
        moduleId: 'm2',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  // Crear preguntas de tareas (depende de Task)
  await prisma.taskQuestion.createMany({
    data: [
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
    ]
  });

  // Crear entregas de tareas (depende de Task)
  await prisma.taskSubmission.createMany({
    data: [
      {
        id: 's1',
        task_id: 't1',
        student_id: '7',
        started_at: new Date('2024-05-01'),
        submitted_at: new Date('2024-05-09'),
        status: SubmissionStatus.submitted,
        grade: 3,
        feedback: "Mas o menos",
        file_url: 'https://example.com/solution1.pdf',
        time_spent: 45,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 's2',
        task_id: 't2',
        student_id: 'u3',
        started_at: new Date('2024-05-10'),
        submitted_at: new Date('2024-05-15'),
        status: SubmissionStatus.submitted,
        grade: 85,
        feedback: "Buen trabajo.",
        file_url: null,
        time_spent: 50,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  // Crear respuestas de estudiantes (depende de TaskSubmission y TaskQuestion)
  await prisma.studentAnswer.createMany({
    data: [
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
    ]
  });

  // Crear favoritos (depende de Course)
  await prisma.favoriteCourse.createMany({
    data: [
      { id: 'f1', course_id: 'c1', student_id: '7' },
      { id: 'f2', course_id: 'c1', student_id: 'u3' },
    ],
  });

  // Crear feedback de estudiante (depende de Course)
  await prisma.studentFeedback.createMany({
    data: [
      {
        id: 'feedback1',
        course_id: 'c1',
        student_id: 'u2',
        instructor_id: 'u1',
        comment: 'El estudiante es muy participativo y siempre entrega sus tareas a tiempo.',
        punctuation: 5,
      },
    ],
  });

  // Crear feedback de curso (depende de Course)
  await prisma.courseFeedback.createMany({
    data: [
      {
        id: 'courseFeedback1',
        course_id: 'c1',
        student_id: 'u2',
        comment: 'El curso es muy interesante y el instructor explica muy bien.',
        punctuation: 4.5,
      },
    ],
  });

  console.log('Seed completado exitosamente.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());