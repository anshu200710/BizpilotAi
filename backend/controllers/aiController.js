// controllers/ai.controller.js
import Lead from "../models/Lead.js";
import Conversation from "../models/Conversation.js";
import { generateAIReply } from "../config/gemini.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// ai generative text for business profile
export const generateBusinessProfile = async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      location,
      services,
    } = req.body;

    const prompt = `
You are an AI assistant helping set up a WhatsApp chatbot for a business.

Business Name: ${businessName}
Business Type: ${businessType}
Location: ${location}
Services: ${services}

Generate the following in VALID JSON ONLY:
{
  "description": "",
  "services": [],
  "products": [],
  "workingHours": "",
  "tone": "friendly | professional | salesy",
  "extraInstructions": ""
}

Guidelines:
- WhatsApp friendly
- Short and clear
- Customer-focused
- Suitable for Indian MSMEs
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON safely
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const jsonString = text.slice(jsonStart, jsonEnd + 1);

    const data = JSON.parse(jsonString);

    res.json(data);
  } catch (err) {
    console.error("AI generation error:", err);
    res.status(500).json({ message: "AI generation failed" });
  }
};


// for ai reply to user Leads

// export const aiReply = async (req, res) => {
//   const { message } = req.body;

//   const ai = await generateAIReply(message);

//   const lead = await Lead.create({
//     product_interest: ai.intent,
//     owner: req.user.id
//   });

//   await Conversation.create({ lead: lead._id, message, sender: "customer" });
//   await Conversation.create({ lead: lead._id, message: ai.reply, sender: "ai" });

//   res.json(ai);
// };


export const aiReply = async (req, res) => {
  try {
    const { leadId, message } = req.body;

    const lead = await Lead.findOne({
      _id: leadId,
      userId: req.user._id
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const convo =
      (await Conversation.findOne({
        user: req.user._id,
        customerNumber: lead.phone
      })) ||
      (await Conversation.create({
        user: req.user._id,
        customerNumber: lead.phone,
        messages: []
      }));

    const ai = await generateAIReply(
      "Reply professionally and briefly.",
      convo.messages,
      message
    );

    convo.messages.push(
      { role: "user", text: message },
      { role: "assistant", text: ai.reply }
    );

    await convo.save();

    res.json({ reply: ai.reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI reply failed" });
  }
};
