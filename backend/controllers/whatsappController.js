import { generateAIReply } from "../config/gemini.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";
import Lead from "../models/Lead.js";
import Conversation from "../models/Conversation.js";

export const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }

  console.log("❌ Webhook verification failed");
  return res.sendStatus(403);

  return res.sendStatus(403);
};

export const receiveMessage = async (req, res) => {
      console.log("📩 WEBHOOK HIT");
  console.log(JSON.stringify(req.body, null, 2));
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messageData = value?.messages?.[0];

    if (!messageData || messageData.type !== "text") {
      return res.sendStatus(200);
    }

    const from = messageData.from; // customer phone
    const text = messageData.text.body;

    // 🔮 Call Gemini AI
    const ai = await generateAIReply(text, "English");

    // 📇 Save Lead
    const lead = await Lead.create({
      phone: from,
      product_interest: ai.intent,
    });

    // 💬 Save conversation
    await Conversation.create({ lead: lead._id, message: text, sender: "customer" });
    await Conversation.create({ lead: lead._id, message: ai.reply, sender: "ai" });

    // 📲 Reply on WhatsApp
    await sendWhatsAppMessage(from, ai.reply);


    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.sendStatus(500);
  }
};
