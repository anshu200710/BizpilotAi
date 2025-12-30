// controllers/invoice.controller.js
import Invoice from "../models/Invoice.js";

export const createInvoice = (req, res) =>
  Invoice.create(req.body).then(data => res.json(data));

export const getInvoices = (req, res) =>
  Invoice.find({ owner: req.user.id }).then(data => res.json(data));

export const updateInvoice = (req, res) =>
  Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true })
         .then(data => res.json(data));

export const deleteInvoice = (req, res) =>
  Invoice.findByIdAndDelete(req.params.id)
         .then(() => res.json({ success: true }));
