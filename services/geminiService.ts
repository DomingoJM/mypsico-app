
import { GoogleGenAI, Chat } from "@google/genai";

export const geminiService = {
  startChat: (): Chat => {
    // The Google GenAI SDK is initialized here using the `process.env` object,
    // which is populated by the deployment environment (e.g., Vercel).
    // App.tsx will guide the user to set the VITE_API_KEY before this function is ever called.
    const apiKey = process.env.VITE_API_KEY;
    if (!apiKey) {
      // This is a safeguard, but the check in App.tsx should prevent this.
      throw new Error("Gemini API key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey });
    
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
