import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  price: Number,
  total: Number,
});

const InvoiceSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invoiceNumber: {
      type: String,
      default: () => `INV-${Date.now()}`,
    },

    clientName: String,

    company: {
      name: String,
      logo: String,
      address: String,
    },

    items: [ItemSchema],

    subtotal: Number,
    gstPercent: Number,
    gstAmount: Number,
    total: Number,

    footerNote: String,

    status: {
      type: String,
      enum: ["Unpaid", "Paid", "Overdue"],
      default: "Unpaid",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", InvoiceSchema);
