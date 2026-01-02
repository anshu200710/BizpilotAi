import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { GoogleGenerativeAI } from "@google/generative-ai";



console.log("🔑 GEMINI KEY VALUE:", process.env.GEMINI_API_KEY);
console.log("🔑 GEMINI KEY LENGTH:", process.env.GEMINI_API_KEY?.length);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateAIReply = async (systemPrompt, history, message) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const chat = model.startChat({
    systemInstruction: systemPrompt,
    history: history.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }]
    }))
  });

  const result = await chat.sendMessage(message);
  return { reply: result.response.text(), intent: "inquiry" };
};
