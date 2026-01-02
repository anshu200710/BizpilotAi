import mongoose from "mongoose";

const WhatsAppAccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  phoneNumberId: { type: String, required: true, unique: true },
  displayPhoneNumber: String,

  encryptedAccessToken: { type: String, required: true },
  verifyToken: String,

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

export default mongoose.model("WhatsAppAccount", WhatsAppAccountSchema);
