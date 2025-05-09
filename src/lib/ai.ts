import OpenAI from 'openai';

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