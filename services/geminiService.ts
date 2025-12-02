import { GoogleGenAI } from "@google/genai";

export const generateLuckyMessage = async (number: number, min: number, max: number): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "A sorte está lançada!";

  // Initialization: Use apiKey directly when creating the client.
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `O número ${number} foi sorteado em um intervalo de ${min} a ${max}. Escreva uma frase curta, divertida e mística (estilo biscoito da sorte ou horóscopo engraçado) sobre este número em Português do Brasil. Máximo de 20 palavras.`,
    });
    
    // Safely access text property as it can be undefined.
    return response.text?.trim() || "Hoje é o seu dia de sorte!";
  } catch (error) {
    console.error("Error generating fortune:", error);
    return "Hoje é o seu dia de sorte!";
  }
};