import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["business_owner", "admin"],
    default: "business_owner"
  },

  businessName: String,
  businessType: String,

  aiSystemPrompt: {
    type: String,
    default: "You are a polite WhatsApp sales assistant."
  },

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

export default mongoose.model("User", UserSchema);
