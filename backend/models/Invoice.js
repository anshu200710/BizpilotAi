// models/Invoice.js
import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
  amount: Number,
  status: { type: String, default: "unpaid" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Invoice", InvoiceSchema);
