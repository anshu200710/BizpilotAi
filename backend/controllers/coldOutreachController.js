import Lead from "../models/Lead.js";
import Conversation from "../models/Conversation.js";
import WhatsAppAccount from "../models/WhatsAppAccount.js";
import { generateAIReply } from "../config/gemini.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";

export const sendColdMessage = async (req, res) => {
  try {
    const { leadIds, prompt } = req.body;

    if (!leadIds?.length || !prompt) {
      return res.status(400).json({ message: "Missing leadIds or prompt" });
    }

    const leads = await Lead.find({
      _id: { $in: leadIds },
      userId: req.user._id
    });

    const whatsappAccount = await WhatsAppAccount.findOne({
      user: req.user._id,
      isActive: true
    });

    if (!whatsappAccount) {
      return res.status(400).json({ message: "No active WhatsApp account" });
    }

    const results = [];

    for (const lead of leads) {
      if (!lead.phone) continue;

      // 🔹 AI prompt (personalized)
      const aiPrompt = `
Write a short, friendly WhatsApp cold message.

Business Name: ${lead.name}
Location: ${lead.address || "India"}
Website: ${lead.website || "N/A"}

User instruction:
${prompt}

Rules:
- No spammy words
- WhatsApp friendly
- Under 3 lines
`;

      const ai = await generateAIReply(aiPrompt, [], "");

      // 🔹 Send WhatsApp
      await sendWhatsAppMessage({
        to: lead.phone,
        text: ai.reply,
        phoneNumberId: whatsappAccount.phoneNumberId,
        encryptedAccessToken: whatsappAccount.encryptedAccessToken
      });

      // 🔹 Save conversation
      await Conversation.findOneAndUpdate(
        {
          user: req.user._id,
          customerNumber: lead.phone
        },
        {
          $push: {
            messages: {
              role: "assistant",
              text: ai.reply
            }
          }
        },
        { upsert: true }
      );

      // 🔹 Update lead
      lead.status = "contacted";
      lead.lastMessage = ai.reply;
      await lead.save();

      results.push({ leadId: lead._id, success: true });
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error("Cold outreach error:", err);
    res.status(500).json({ message: "Cold outreach failed" });
  }
};
