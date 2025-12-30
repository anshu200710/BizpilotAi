// controllers/conversation.controller.js
import Conversation from "../models/Conversation.js";

export const getConversation = (req, res) =>
  Conversation.find({ lead: req.params.leadId })
              .then(data => res.json(data));
