// models/Conversation.js
import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  sender: { type: String, enum: ["customer", "ai", "system"], default: "customer" },
  metadata: { type: Object }
}, { timestamps: true });

export default mongoose.model("Conversation", ConversationSchema);
