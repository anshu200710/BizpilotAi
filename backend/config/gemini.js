import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateAIReply = async (message, language = "English") => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in .env");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an AI Sales & Support Assistant for a small business.

Language: ${language}

Rules:
- Be polite and professional
- Detect intent: inquiry | price | order | complaint
- Do NOT guess prices or policies

Customer message:
"${message}"

Respond ONLY in valid JSON:
{
  "reply": "text reply",
  "intent": "inquiry | price | order | complaint",
  "lead": {
    "name": null,
    "phone": null,
    "product_interest": null
  }
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response || !response.text()) {
      throw new Error("Empty Gemini response");
    }

    const text = response.text();
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("Invalid JSON from Gemini");
    }

    return JSON.parse(match[0]);

  } catch (error) {
    console.error("Gemini Error:", error.message);

    return {
      reply: "Thanks for reaching out! Our team will contact you soon.",
      intent: "inquiry",
      lead: {},
    };
  }
};
