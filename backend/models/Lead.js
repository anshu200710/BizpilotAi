// models/Lead.js
import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  product_interest: String,
  status: { type: String, default: "new" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Lead", LeadSchema);
