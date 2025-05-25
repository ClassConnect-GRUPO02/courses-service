import OpenAI from 'openai';
import * as course_service from '../service/course_service';
import * as task_service from '../service/task_service';

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

export const processMessageStudent = async (userId: string, message: string, history: any[]): Promise<any> => {
  const courses = await course_service.getCoursesByUserId(userId);
  const tasks = await task_service.getTasksByStudentId(userId);

  const coursesText = courses.length
    ? courses.map(c => `- ${c.name}`).join('\n')
    : 'No está inscripto en cursos.';
  const tasksText = tasks.length
    ? tasks.map(t => `- ${t.title} (${t.type}) vence el ${new Date(t.due_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`)
    : 'No tiene tareas asignadas.';

  const systemPrompt = `
    Eres un asistente virtual que ayuda a los alumnos a resolver dudas sobre el curso.
    Estos son los cursos del usuario: ${coursesText}

    Estas son sus tareas y exámenes: ${tasksText}

    Responde de forma clara y útil usando esta información si es relevante.
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