import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerNumber: { type: String, required: true },

  messages: [{
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

ConversationSchema.index(
  { user: 1, customerNumber: 1 },
  { unique: true }
);

export default mongoose.model("Conversation", ConversationSchema);
