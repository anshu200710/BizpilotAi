import mongoose from "mongoose";

const customFieldSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    fieldName: {
      type: String,
      required: true
    },

    fieldType: {
      type: String,
      enum: ["text", "number", "date", "select"],
      required: true
    },

    options: [String] // only for select
  },
  { timestamps: true }
);

export default mongoose.model("CustomField", customFieldSchema);
