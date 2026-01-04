import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // SOURCE
    source: {
      type: String,
      enum: ["scraper", "whatsapp", "manual"],
      required: true
    },

    // BASIC INFO
    name: String,
    phone: { type: String, index: true },
    email: String,
    address: String,
    website: String,

    // PIPELINE / CRM
    status: {
      type: String,
      enum: ["new", "contacted", "in_progress", "paid", "unpaid", "completed"],
      default: "new"
    },

    pipelineOrder: {
      type: Number,
      default: Date.now
    },

    // RATINGS (FROM SCRAPER)
    rating: Number,
    totalRatings: Number,

    // WHATSAPP
    whatsappAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WhatsappAccount"
    },
    lastMessage: String,

    // DYNAMIC FIELDS
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },

    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
