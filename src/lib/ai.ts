import OpenAI from 'openai';
import * as course_service from '../service/course_service';
import * as task_service from '../service/task_service';
import * as module_service from '../service/module_service';
import logger from '../logger/logger';
import { ChatMessage } from '../models/chat_message';
import { StudentAnswer, TaskQuestion } from '@prisma/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateFeedbackSummary = async (feedbackText: string): Promise<string> => {
  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // o 'gpt-3.5-turbo'
    messages: [
      {
        role: 'system',
        content: "Analiza los siguientes comentarios de feedback recibidos por un alumno y generá un resumen conciso. El resumen debe tener las siguientes secciones claras: Aspectos positivos, Aspectos a mejorar (si los hay), Patrones o tendencias observadas. No incluyas saludos, preguntas ni texto adicional al final.",
      },
      {
        role: 'user',
        content: `Estos son los feedbacks que recibió el alumno:\n\n${feedbackText}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return chatCompletion.choices[0]?.message?.content?.trim() ?? 'No se pudo generar el resumen.';
};

export const generateCourseFeedbackSummary = async (feedbackText: string): Promise<string> => {
  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `Analizá los siguientes comentarios de feedback escritos por alumnos sobre un curso específico. 
Generá un resumen claro que contenga las siguientes secciones:
- Tendencias generales
- Aspectos positivos
- Áreas de mejora

Evitá saludos, preguntas o texto adicional irrelevante. El objetivo es proporcionar al docente una visión rápida y precisa de la percepción general del curso.`,
      },
      {
        role: 'user',
        content: `Comentarios de los alumnos sobre el curso:\n\n${feedbackText}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return chatCompletion.choices[0]?.message?.content?.trim() ?? 'No se pudo generar el resumen del curso.';
};

// This function processes a message from a student and generates a response using AI.
export const processMessageStudent = async (userId: string, message: string, history: ChatMessage[]): Promise<string> => {
  let dynamicContext = await tryToGetContextStudent(userId, message, history);

  if (!dynamicContext) {
    dynamicContext = await getGeneralContextStudent(userId);
  }

  const systemPrompt = `
  Eres un asistente virtual de la app ClassConnect que ayuda a los alumnos a resolver dudas sobre sus cursos, tareas y materiales.

  Utiliza solo la información proporcionada a continuación para responder preguntas. 
  Si no puedes encontrar absolutamente ninguna información relevante para responder la pregunta, responde exactamente con esta marca especial: [NO_CONTEXT]

  No utilices la marca [NO_CONTEXT] si crees que hay alguna parte del contexto que puede ayudarte a generar una respuesta útil, aunque no sea completa.

  Para preguntas sobre el uso de la app utiliza esto:
  ${APP_CONTEXT_STUDENT}

  === CONTEXTO COMIENZA ===
  ${dynamicContext}
  === CONTEXTO TERMINA ===

  Responde de forma clara, concisa y útil, priorizando la información más relevante.
  No inventes datos si no están en el contexto.
  `;

  logger.debug(`systemPrompt: ${systemPrompt}`);

  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ],
    temperature: 0.7,
    max_completion_tokens: 250,
  });

  const response = chatCompletion.choices[0]?.message?.content?.trim() ?? 'No se pudo procesar el mensaje.';
  if (response?.includes('[NO_CONTEXT]')) {
    return 'Lo siento, no tengo suficiente información para responder a tu pregunta.';
  }
  return response;
}

// This function tries to extract specific context information for a student based on their message and chat history.
const tryToGetContextStudent = async (userId: string, message: string, history: ChatMessage[]): Promise<string | void> => {
  const lowerMessage = message.toLowerCase();
  let identifiedCourse = null;
  let identifiedTask = null;
  let contextInfo = '';

  logger.debug(`history: ${JSON.stringify(history)}`);
  
  const allCourses = await course_service.getCoursesByUserId(userId); // Obtener todos los cursos del usuario para poder buscar
  allCourses.sort((a, b) => b.name.length - a.name.length);
  
  for (const course of allCourses) {
    if (lowerMessage.includes(course.name.toLowerCase())) {
      identifiedCourse = course;
      break;
    }
  }
  
  const allTasks = await task_service.getTasksByStudentId(userId); // Obtener todas las tareas del usuario
  for (const task of allTasks) {
    if (lowerMessage.includes(task.title.toLowerCase())) {
      identifiedTask = task;
      break;
    }
  }
  
  if (identifiedCourse) {
    contextInfo += `
    Nombre del curso: ${identifiedCourse.name}
    Descripción: ${identifiedCourse.description}
    Nivel: ${identifiedCourse.level}, Categoría: ${identifiedCourse.category}, Modalidad: ${identifiedCourse.modality}
    Fecha de inicio: ${new Date(identifiedCourse.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Fecha de finalización: ${new Date(identifiedCourse.endDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Capacidad: ${identifiedCourse.capacity}, Inscritos: ${identifiedCourse.enrolled}
    Prerrequisitos: ${identifiedCourse.prerequisites.join(', ')}
    `;
    
    const modules = await module_service.getModules(identifiedCourse.id);
    for (const module of modules) {
      if (lowerMessage.includes(module.name.toLowerCase())) {
        contextInfo += `
        Nombre del módulo: ${module.name}
        Descripción: ${module.description}
        Orden: ${module.order}
      `;
        break;
      }
    }
  }

  if (identifiedTask) {
    contextInfo += `
    Nombre de la tarea: ${identifiedTask.title}
    Descripción: ${identifiedTask.description}
    Tipo: ${identifiedTask.type}, Fecha de entrega: ${new Date(identifiedTask.due_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Permitir entregas tardías: ${identifiedTask.allow_late ? 'Sí' : 'No'}
  `;
  }

  //logger.debug(`specific contextInfo: ${contextInfo}`);


  if (contextInfo) {
    return contextInfo;
  } else { 
    return 
  }
}

const getGeneralContextStudent = async(userId: string): Promise<string> => {
  let contextInfo = '';
  const allCourses = await course_service.getAllCourses();
  const allTasks = await task_service.getTasksByStudentId(userId);

  for (const course of allCourses) {
    contextInfo += `
    Nombre del curso: ${course.name}
    Descripción: ${course.description}
    Nivel: ${course.level}, Categoría: ${course.category}, Modalidad: ${course.modality}
    Fecha de inicio: ${new Date(course.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Fecha de finalización: ${new Date(course.endDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Capacidad: ${course.capacity}, Inscritos: ${course.enrolled}
    Prerrequisitos: ${course.prerequisites.join(', ')}
    `;
    
    const modules = await module_service.getModules(course.id);
    for (const module of modules) {
      contextInfo += `
      Nombre del módulo: ${module.name}
      Descripción: ${module.description}
      Orden: ${module.order}
      `;
    }
  }

  for (const task of allTasks) {
    contextInfo += `
    Información de la tarea: ${task.title}
    Descripción: ${task.description}
    Tipo: ${task.type}, Fecha de entrega: ${new Date(task.due_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Permitir entregas tardías: ${task.allow_late ? 'Sí' : 'No'}
    `;
  }
  //logger.debug(`general contextInfo student: ${contextInfo}`);

  
  return contextInfo
  
};

export const processMessageInstructor = async (userId: string, message: string, history: ChatMessage[]): Promise<string> => {
  const contextInfo = await getGeneralContextInstructor(userId);
  const systemPrompt = `
    Eres un asistente virtual de la app ClassConnect que ayuda a los profesores a resolver dudas sobre sus cursos, tareas y materiales.

    Utiliza solo la información proporcionada a continuación para responder preguntas. 
    Si no puedes encontrar absolutamente ninguna información relevante para responder la pregunta, responde exactamente con esta marca especial: [NO_CONTEXT]

    No utilices la marca [NO_CONTEXT] si crees que hay alguna parte del contexto que puede ayudarte a generar una respuesta útil, aunque no sea completa.

    Para preguntas sobre el uso de la app utiliza esto:
    ${APP_CONTEXT_INSTRUCTOR}
    
    === CONTEXTO COMIENZA ===
    ${contextInfo}
    === CONTEXTO TERMINA ===

    Responde de forma clara, concisa y útil, priorizando la información más relevante.
    No inventes datos si no están en el contexto.
    `;

  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  logger.debug(`systemPrompt: ${systemPrompt}`);

  const response = chatCompletion.choices[0]?.message?.content?.trim() ?? 'No se pudo procesar el mensaje.';
  if (response?.includes('[NO_CONTEXT]')) {
    return 'Lo siento, no tengo suficiente información para responder a tu pregunta.';
  }
  return response;
}

const getGeneralContextInstructor = async (userId: string): Promise<string> => {
  let contextInfo = '';
  const allCourses = await course_service.getCoursesByInstructorId(userId);
  const allTasks = (await task_service.getTasksByInstructor(userId,1,100)).data;

  for (const course of allCourses) {
    contextInfo += `
    Información del curso: ${course.name}
    Descripción: ${course.description}
    Nivel: ${course.level}, Categoría: ${course.category}, Modalidad: ${course.modality}
    Fecha de inicio: ${new Date(course.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Fecha de finalización: ${new Date(course.endDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Capacidad: ${course.capacity}, Inscritos: ${course.enrolled}
    Prerrequisitos: ${course.prerequisites.join(', ')}
    `;
    
    const modules = await module_service.getModules(course.id);
    for (const module of modules) {
      contextInfo += `
      Nombre del módulo: ${module.name}
      Descripción: ${module.description}
      Orden: ${module.order}
      `;
    }
    //logger.debug(`general contextInfo instructor: ${contextInfo}`);
  }

  for (const task of allTasks) {
    contextInfo += `
    Información de la tarea: ${task.title}
    Tipo: ${task.type}, Fecha de entrega: ${new Date(task.due_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Curso al que pertenece: ${task.course.name}
    Entregas: ${task._count.submissions}
    `;
  }
  return contextInfo;
};

// This function generates a resume using AI based on the provided text.
// It is used to generate a resume for a task submission feedback.
export const generateAIResume = async (text: string): Promise<string> => {
  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `Eres un asistente que ayuda a docentes a generar resúmenes breves de feedback académico.
        Debes generar un resumen claro, profesional y conciso que destaque los puntos clave del texto.
        El resumen debe tener entre 30 y 40 palabras. No repitas el texto original ni uses frases genéricas como “en resumen” o “el texto dice”.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 0.7,
    max_tokens: 80,
  });

  return chatCompletion.choices[0]?.message?.content?.trim() ?? 'No se pudo generar el resumen.';
}

function cleanJSONResponse(text: string): string {
  // Quita las backticks y etiquetas ```json ... ```
  return text
    .replace(/^```json\s*/, '')   // Quita ```json al principio
    .replace(/```$/, '')           // Quita ``` al final
    .trim();
}

export const generateAIGrading = async (
  questions: TaskQuestion[],
  answers: StudentAnswer[]
): Promise<{ grade: number; feedback: string; revision: boolean }> => {
  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `
Eres un asistente virtual encargado de calificar tareas de estudiantes.

Debes:
- Evaluar cada respuesta individualmente y asignar una puntuación parcial asumiendo que cada pregunta vale lo mismo sobre una nota total de 10 puntos.
- Asociar preguntas y respuestas usando 'id' y 'question_id'.
- Para cada respuesta, devuelve un objeto con:
  {
    "question_id": string,
    "awarded_points": número entre 0 y puntos de la pregunta,
    "max_points": puntos parciales asignados a la pregunta,
    "feedback": texto constructivo,
    "ambiguity": número entre 0 y 5 (5 si la respuesta es muy ambigua o no está clara, 0 si es muy clara)    
  }

Devuelve un JSON **con un array** llamado "grading", por ejemplo:

{
  "grading": [
    {
      "question_id": "abc123",
      "awarded_points": 2,
      "max_points": 2,
      "feedback": "Respuesta correcta. Puntos: 2/2",
      "ambiguity": 0
    },
    ...
  ]
}

No calcules la nota final. El sistema lo hará por ti.
        `,
      },
      {
        role: 'user',
        content: `Aquí tienes las preguntas y respuestas para evaluar:\n\n${JSON.stringify({ questions, answers })}`,
      },
    ],
    temperature: 0,
    max_tokens: 1000,
  });

  let responseContent = chatCompletion.choices[0]?.message?.content?.trim() ?? '';
  responseContent = cleanJSONResponse(responseContent);

  console.log("AI raw grading response cleaned:", responseContent);

  try {
    type GradingFeedback = { question_id: string; awarded_points: number; max_points: number; feedback: string, ambiguity: number };
    const parsed = JSON.parse(responseContent);

    if (!parsed.grading || !Array.isArray(parsed.grading)) {
      throw new Error('Formato inválido');
    }

    let obtainedPoints = 0;
    let detailedFeedback = '';
    let revision = false;

    for (const question of questions) {
      const answerFeedback = (parsed.grading as GradingFeedback[]).find(
        (g) => g.question_id === question.id
      );

      const points = answerFeedback?.awarded_points ?? 0;
      const feedback = answerFeedback?.feedback ?? 'Sin feedback.';
      obtainedPoints += points;
      detailedFeedback += `Pregunta: ${question.text}\nFeedback: ${feedback}\n\n`;

      if (answerFeedback && typeof answerFeedback.ambiguity === 'number' && answerFeedback.ambiguity >= 3) {
        revision = true;
      }
    }


    let grade = 0;
    if (questions[0].points === undefined || questions[0].points === null || questions[0].points === 0) {
      const grading = parsed.grading as GradingFeedback[];
      const totalAwardedPoints = grading.reduce((sum: number, g: GradingFeedback) => sum + g.awarded_points, 0);
      const totalMaxPoints = grading.reduce((sum: number, g: GradingFeedback) => sum + g.max_points, 0);
      grade = parseFloat(((totalAwardedPoints / totalMaxPoints) * 10).toFixed(2));
    } else {
      const totalPoints = questions.reduce((sum, q) => sum + (q.points ?? 0), 0);
      grade = parseFloat(((obtainedPoints / totalPoints) * 10).toFixed(2));
    }

    if (revision) {
      return {
        grade: 0,
        feedback: `La calificación no se puede determinar automáticamente debido a respuestas ambiguas. Por favor, revisa las respuestas del alumno. \n${detailedFeedback}`,
        revision: true,
      }
    } 

    return {
      grade,
      feedback: `${detailedFeedback}Nota final: ${grade}/10`,
      revision,
    };
  } catch (e) {
    console.error("Error parsing or calculating AI grading:", e);
    return {
      grade: 0,
      feedback: 'Ocurrió un error al procesar la calificación.',
      revision: false,
    };
  }
};

const APP_CONTEXT_STUDENT = `
Un usuario estudiante de la app móvil ClassConnect, tiene acceso a las siguientes secciones:

- **Inicio**: Página principal con botón 'Ver cursos' que lleva a la lista de cursos.
- **Tabs inferiores**:
  - *Inicio*: Página principal.
  - *Buscar*: Permite buscar usuarios y ver su perfil.
  - *Mis cursos*: Lista de cursos en los que estás inscrito.
    - Incluye acceso a 'Cursos favoritos' desde el botón en la esquina superior derecha.
  - *Perfil*: Acceso a:
    - 'Mis cursos'
    - 'Mis feedbacks'
    - 'Editar perfil'
    - 'Configurar notificaciones'
    - 'Cerrar sesión'

- **Pantalla de curso inscrito**:
  - Muestra: nombre, descripción, nivel, categoría, modalidad.
  - Botones: 'Módulos', 'Dejar feedback', 'Volver'.

- **Pantalla de curso no inscrito**:
  - Muestra la misma información.
  - Botones: 'Inscribirse', 'Volver'.

- **Pantalla de módulos**:
  - Lista de módulos con nombre, descripción y orden.
  - Al seleccionar uno, se accede a sus recursos.
`;

const APP_CONTEXT_INSTRUCTOR = `
- **Inicio**: Página principal con botón 'Ver cursos' que lleva a la lista de cursos.
- **Tabs inferiores**:
  - *Inicio*: Página principal.
  - *Buscar*: Permite buscar usuarios y ver su perfil.
  - *Mis cursos*: Lista de cursos que enseña.

- **Pantalla de 'Ver cursos'**:
  - Muestra: los cursos listados con nombre, descripción, nivel, categoría, modalidad.
  - Botones: '+' para crear un nuevo curso, 'Filtros' para filtrar por categoría, nivel y modalidad.

- **Pantalla de curso que soy profesor**:
  - Muestra: nombre, descripción, nivel, categoría, modalidad.
  - Botones: 'Módulos', 'Alumnos', 'Ver feedbacks del curso', 'Editar curso (icono de un lápiz)', 'Eliminar curso (icono de un cesto de basura), 'Volver'.
  - **Pantalla de modulos**:
    - Muestra: lista de módulos con nombre, descripción, orden.
    - Botones: 'Agregar módulo', 'Ordenar (icono con 3 puntos)' al mantener presionado permite arrastrar la posición de ese módulo
  - **Pantalla de información del módulo**:
    - Muestra: nombre, descripción y recursos del módulo.
    - Botones: 'Agregar recurso', 'Editar módulo (icono de un lápiz)', 'Eliminar módulo (icono de un cesto de basura)', 'Volver'.

- **Pantalla de curso que no soy profesor**:
  - Muestra: nombre, descripción, nivel, categoría, modalidad.
  - Botones: 'Módulos', 'Ver feedbacks del curso', 'Volver'.
  `;