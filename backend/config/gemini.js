import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateAIReply = async (systemPrompt, history, message) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: {
      role: "system",
      parts: [{ text: systemPrompt }]
    }
  });

  const chat = model.startChat({
    history: history.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }]
    }))
  });

  const result = await chat.sendMessage(message);

  return {
    reply: result.response.text(),
    intent: "inquiry"
  };
};
