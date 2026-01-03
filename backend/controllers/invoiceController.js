import Invoice from "../models/Invoice.js";

export const createInvoice = async (req, res) => {
  const invoice = await Invoice.create({
    ...req.body,
    owner: req.user.id,
  });
  res.json(invoice);
};

export const getInvoices = async (req, res) => {
  const invoices = await Invoice.find({ owner: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(invoices);
};

export const updateInvoice = async (req, res) => {
  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    req.body,
    { new: true }
  );
  res.json(invoice);
};

export const deleteInvoice = async (req, res) => {
  await Invoice.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.id,
  });
  res.json({ success: true });
};
