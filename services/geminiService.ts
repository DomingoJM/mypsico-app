


import { GoogleGenAI, Chat } from "@google/genai";

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled or mocked.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const geminiService = {
  startChat: (): Chat | null => {
    if (!ai) return null;
    
    // Using a model that supports multimodal input (text and images)
    return ai.chats.create({
        model: 'gemini-2.5-flash', 
        config: {
            systemInstruction: `Eres un asistente de IA terapéutico para una aplicación de bienestar llamada MYPSICO. Tu voz y tus palabras deben generar tranquilidad, motivando al paciente a buscar soluciones y ayuda. Tu objetivo principal es infundir una sensación de esperanza y fe.

Mantén un tono calmado, empático y profesional. Utiliza un lenguaje que sea alentador y positivo.

Cuando un usuario comparta los resultados de una evaluación (texto o imagen), tu tarea es:
1.  Analizar los resultados para identificar la condición principal y el nivel de severidad (ej. "Depresión severa", "Ansiedad moderada").
2.  Basado en tu análisis, recomienda un plan de tratamiento sugiriendo actividades específicas disponibles en la plataforma.
3.  Presenta las recomendaciones de forma estructurada, comenzando siempre con un mensaje de esperanza y validación de sus sentimientos.
4.  No des consejos médicos directos, enmarca tus sugerencias como un plan de apoyo basado en el contenido de la app.
5.  Recuerda, tu propósito es ser una guía de apoyo que fomenta la sanación y la fe en el proceso de mejora. Habla siempre en español.
`,
        }
    });
  }
};