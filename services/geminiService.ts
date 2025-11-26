import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGameOverCommentary = async (score: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a tough but funny Italian Pizza Boss. One of your delivery drivers just finished their shift (crashed the bike). 
      
      They delivered ${score} pizzas.
      
      If score < 5: Roast them hard. 
      If score < 15: Give mild encouragement but say they are slow.
      If score >= 15: Praise them enthusiastically.

      Write a very short, punchy 1-sentence performance review.`,
    });
    
    return response.text || "Connection lost to Pizza HQ.";
  } catch (error) {
    console.error("Error fetching commentary:", error);
    return "The Pizza Boss is speechless.";
  }
};