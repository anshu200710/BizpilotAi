import WhatsAppAccount from "../models/WhatsAppAccount.js";
import Conversation from "../models/Conversation.js";
import Lead from "../models/Lead.js";
import { generateAIReply } from "../config/gemini.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";

export const verifyWebhook = (req, res) => {
  const { "hub.verify_token": token, "hub.challenge": challenge } = req.query;
  if (token === process.env.VERIFY_TOKEN) return res.send(challenge);
  res.sendStatus(403);
};

export const receiveMessage = async (req, res) => {
  res.sendStatus(200);

  const value = req.body.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  if (!message || message.type !== "text") return;

  const phoneNumberId = value.metadata.phone_number_id;
  const from = message.from;
  const text = message.text.body;

  const account = await WhatsAppAccount.findOne({ phoneNumberId, isActive: true })
    .populate("user");

  if (!account || !account.user.isActive) return;

  let convo = await Conversation.findOne({
    user: account.user._id,
    customerNumber: from
  });

  if (!convo) {
    convo = await Conversation.create({
      user: account.user._id,
      customerNumber: from,
      messages: []
    });
  }

  const ai = await generateAIReply(
    account.user.aiSystemPrompt,
    convo.messages,
    text
  );

  convo.messages.push(
    { role: "user", text },
    { role: "assistant", text: ai.reply }
  );

  await convo.save();

  await Lead.findOneAndUpdate(
    { user: account.user._id, customerNumber: from },
    { interest: ai.intent },
    { upsert: true }
  );

  await sendWhatsAppMessage({
    to: from,
    text: ai.reply,
    phoneNumberId,
    encryptedAccessToken: account.encryptedAccessToken
  });
};
