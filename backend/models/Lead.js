import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerNumber: { type: String, required: true },

  name: String,
  interest: String,

  status: {
    type: String,
    enum: ["new", "contacted", "qualified", "closed"],
    default: "new"
  }

}, { timestamps: true });

export default mongoose.model("Lead", LeadSchema);
