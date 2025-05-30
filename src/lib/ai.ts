import OpenAI from 'openai';
import * as course_service from '../service/course_service';
import * as task_service from '../service/task_service';
import * as module_service from '../service/module_service';
import logger from '../logger/logger';
import { ChatMessage } from '../models/chat_message';

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

export const processMessageStudent = async (userId: string, message: string, history: ChatMessage[]): Promise<string> => {
  let dynamicContext = await tryToGetContextStudent(userId, message, history);

  if (!dynamicContext) {
    dynamicContext = await getGeneralContextStudent(userId);
  }

  const systemPrompt = `
    Eres un asistente virtual que ayuda a los alumnos a resolver dudas sobre sus cursos, tareas y materiales.
    Utiliza la información proporcionada a continuación para responder las preguntas del usuario.
    Si la información no es suficiente para responder la pregunta, informa al usuario que no dispones de esa información en tu contexto.

    ${dynamicContext}

    Responde de forma clara, concisa y útil, priorizando la información más relevante para la pregunta del usuario.
    `.trim();

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

  return chatCompletion.choices[0]?.message?.content?.trim() ?? 'No se pudo procesar el mensaje.';
}

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
    ### Información detallada del curso: ${identifiedCourse.name}
    Descripción: ${identifiedCourse.description}
    Nivel: ${identifiedCourse.level}, Categoría: ${identifiedCourse.category}, Modalidad: ${identifiedCourse.modality}
    Fecha inicio: ${new Date(identifiedCourse.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Fecha finalización: ${new Date(identifiedCourse.endDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Capacidad: ${identifiedCourse.capacity}, Inscritos: ${identifiedCourse.enrolled}
    Prerrequisitos: ${identifiedCourse.prerequisites.join(', ')}
    `;
    
    const modules = await module_service.getModules(identifiedCourse.id);
    for (const module of modules) {
      if (lowerMessage.includes(module.name.toLowerCase())) {
        contextInfo += `
        ### Información del módulo: ${module.name}
        Descripción: ${module.description}
        Orden: ${module.order}
      `;
        break;
      }
    }
  }

  if (identifiedTask) {
    contextInfo += `
    ### Información de la tarea: ${identifiedTask.title}
    Descripción: ${identifiedTask.description}
    Tipo: ${identifiedTask.type}, Fecha de entrega: ${new Date(identifiedTask.due_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Permitir entregas tardías: ${identifiedTask.allow_late ? 'Sí' : 'No'}
  `;
  }

  logger.debug(`specific contextInfo: ${contextInfo}`);


  if (contextInfo) {
    return contextInfo.trim();
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
    ### Información del curso: ${course.name}
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
      ### Información del módulo: ${module.name}
      Descripción: ${module.description}
      Orden: ${module.order}
      `;
    }
  }

  for (const task of allTasks) {
    contextInfo += `
    ### Información de la tarea: ${task.title}
    Descripción: ${task.description}
    Tipo: ${task.type}, Fecha de entrega: ${new Date(task.due_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    Permitir entregas tardías: ${task.allow_late ? 'Sí' : 'No'}
    `;
  }
  logger.debug(`general contextInfo student: ${contextInfo}`);

  
  return contextInfo
  
};

export const processMessageInstructor = async (userId: string, message: string, history: ChatMessage[]): Promise<string> => {
  const systemPrompt = `
    Eres un asistente virtual que ayuda a los docentes a resolver dudas sobre sus cursos, tareas y módulos.
    Utiliza la información proporcionada a continuación para responder las preguntas del usuario.
    Si la información no es suficiente para responder la pregunta, informa al usuario que no dispones de esa información en tu contexto.

    ${await getGeneralContextInstructor(userId)}

    Responde de forma clara, concisa y útil, priorizando la información más relevante para la pregunta del usuario.
  `.trim();

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

  return chatCompletion.choices[0]?.message?.content?.trim() ?? 'No se pudo procesar el mensaje.';
}

const getGeneralContextInstructor = async (userId: string): Promise<string> => {
  let contextInfo = '';
  const allCourses = await course_service.getCoursesByInstructorId(userId);

  for (const course of allCourses) {
    contextInfo += `
    ### Información del curso: ${course.name}
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
      ### Información del módulo: ${module.name}
      Descripción: ${module.description}
      Orden: ${module.order}
      `;
    }
    logger.debug(`general contextInfo instructor: ${contextInfo}`);
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
        content: `Eres un asistente virtual que ayuda a generar resúmenes de feedback de tareas.
        Utiliza la información proporcionada a continuación para generar un resumen conciso y claro.`,
      },
      {
        role: 'user',
        content: `Genera un resumen del siguiente feedback:\n\n${text}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 150,
  });

  return chatCompletion.choices[0]?.message?.content?.trim() ?? 'No se pudo generar el resumen.';
}
