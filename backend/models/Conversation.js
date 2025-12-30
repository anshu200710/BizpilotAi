// models/Conversation.js
import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
  message: String,
  sender: { type: String, enum: ["customer", "ai"] }
}, { timestamps: true });

export default mongoose.model("Conversation", ConversationSchema);
