import WhatsAppAccount from "../models/WhatsAppAccount.js";
import Conversation from "../models/Conversation.js";
import Lead from "../models/Lead.js";
import BusinessProfile from "../models/BusinessProfile.js";
import { generateAIReply } from "../config/gemini.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";

export const verifyWebhook = (req, res) => {
  const { "hub.verify_token": token, "hub.challenge": challenge } = req.query;
  if (token === process.env.VERIFY_TOKEN) return res.send(challenge);
  res.sendStatus(403);
};

// export const receiveMessage = async (req, res) => {
//   // ✅ ACK FIRST (Vercel safe)
//   res.sendStatus(200);

//   try {
//     const value = req.body.entry?.[0]?.changes?.[0]?.value;
//     const message = value?.messages?.[0];
//     if (!message || message.type !== "text") return;

//     const phoneNumberId = value.metadata.phone_number_id;
//     const from = message.from;
//     const text = message.text.body;

//     const account = await WhatsAppAccount.findOne({
//       phoneNumberId,
//       isActive: true,
//     }).populate("user");

//     if (!account || !account.user?.isActive) return;

//     // 🔹 Load Business Profile
//     const profile = await BusinessProfile.findOne({
//       user: account.user._id,
//     });

//     // 🔹 Build AI System Prompt from profile
//     const systemPrompt = `
// You are an AI chatbot for this business.

// Business Name: ${profile?.businessName || "Not provided"}
// Description: ${profile?.description || "Not provided"}

// Services:
// ${profile?.services?.join(", ") || "Not provided"}

// Products:
// ${profile?.products?.join(", ") || "Not provided"}

// Location: ${profile?.location || "Not provided"}
// Working Hours: ${profile?.workingHours || "Not provided"}

// Tone: ${profile?.tone || "friendly"}

// Instructions:
// ${profile?.extraInstructions || "Be helpful and professional."}

// Rules:
// - Reply only based on the business information
// - Do NOT invent services or products
// - Be concise and WhatsApp-friendly
// `;

//     // 🔹 Conversation
//     let convo = await Conversation.findOne({
//       user: account.user._id,
//       customerNumber: from,
//     });

//     if (!convo) {
//       convo = await Conversation.create({
//         user: account.user._id,
//         customerNumber: from,
//         messages: [],
//       });
//     }

//     // 🔹 AI Reply
//     const ai = await generateAIReply(
//       systemPrompt,
//       convo.messages,
//       text
//     );

//     convo.messages.push(
//       { role: "user", text },
//       { role: "assistant", text: ai.reply }
//     );

//     await convo.save();

//     // 🔹 Lead update
//     await Lead.findOneAndUpdate(
//       { user: account.user._id, customerNumber: from },
//       { interest: ai.intent },
//       { upsert: true }
//     );

//     // 🔹 Send WhatsApp reply
//     await sendWhatsAppMessage({
//       to: from,
//       text: ai.reply,
//       phoneNumberId,
//       encryptedAccessToken: account.encryptedAccessToken,
//     });
//   } catch (err) {
//     console.error("receiveMessage error:", err);
//   }
// };

export const receiveMessage = async (req, res) => {
  // ✅ ACK FIRST (Vercel safe)
  res.sendStatus(200);

  try {
    const value = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    if (!message || message.type !== "text") return;

    const phoneNumberId = value.metadata.phone_number_id;
    const from = message.from;
    const text = message.text.body;

    const account = await WhatsAppAccount.findOne({
      phoneNumberId,
      isActive: true,
    }).populate("user");

    if (!account || !account.user?.isActive) return;

    // 🔹 Load Business Profile
    const profile = await BusinessProfile.findOne({
      user: account.user._id,
    });

    // 🔹 Build AI System Prompt
    const systemPrompt = `
You are an AI chatbot for this business.

Business Name: ${profile?.businessName || "Not provided"}
Description: ${profile?.description || "Not provided"}

Services:
${profile?.services?.join(", ") || "Not provided"}

Products:
${profile?.products?.join(", ") || "Not provided"}

Location: ${profile?.location || "Not provided"}
Working Hours: ${profile?.workingHours || "Not provided"}

Tone: ${profile?.tone || "friendly"}

Instructions:
${profile?.extraInstructions || "Be helpful and professional."}

Rules:
- Reply only based on the business information
- Do NOT invent services or products
- Be concise and WhatsApp-friendly
`;

    // 🔹 Conversation
    let convo = await Conversation.findOne({
      user: account.user._id,
      customerNumber: from,
    });

    if (!convo) {
      convo = await Conversation.create({
        user: account.user._id,
        customerNumber: from,
        messages: [],
      });
    }

    // 🔹 AI Reply (CORRECT PARAMS)
    const ai = await generateAIReply(
      systemPrompt,
      convo.messages || [],
      text
    );

    convo.messages.push(
      { role: "user", text },
      { role: "assistant", text: ai.reply }
    );

    await convo.save();

    // ✅ CREATE / UPDATE LEAD (MATCHES YOUR SCHEMA)
    await Lead.findOneAndUpdate(
      {
        userId: account.user._id,
        phone: from,
      },
      {
        userId: account.user._id,
        source: "whatsapp",
        phone: from,
        name: profile?.businessName
          ? `${profile.businessName} (WhatsApp)`
          : `WhatsApp ${from.slice(-4)}`,
        lastMessage: text,
        whatsappAccountId: account._id,
        status: "new",
        pipelineOrder: Date.now(),
      },
      { upsert: true, new: true }
    );

    // 🔹 Send WhatsApp reply
    await sendWhatsAppMessage({
      to: from,
      text: ai.reply,
      phoneNumberId,
      encryptedAccessToken: account.encryptedAccessToken,
    });

  } catch (err) {
    console.error("receiveMessage error:", err);
  }
};
