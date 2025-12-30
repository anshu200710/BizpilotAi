// controllers/ai.controller.js
import Lead from "../models/Lead.js";
import Conversation from "../models/Conversation.js";
import { generateAIReply } from "../config/gemini.js";

export const aiReply = async (req, res) => {
  const { message } = req.body;

  const ai = await generateAIReply(message);

  const lead = await Lead.create({
    product_interest: ai.intent,
    owner: req.user.id
  });

  await Conversation.create({ lead: lead._id, message, sender: "customer" });
  await Conversation.create({ lead: lead._id, message: ai.reply, sender: "ai" });

  res.json(ai);
};
