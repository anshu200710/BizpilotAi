// controllers/lead.controller.js
import Lead from "../models/Lead.js";

export const createLead = (req, res) =>
  Lead.create(req.body).then(data => res.json(data));

export const getLeads = (req, res) =>
  Lead.find({ owner: req.user.id }).then(data => res.json(data));

export const updateLead = (req, res) =>
  Lead.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(data => res.json(data));

export const deleteLead = (req, res) =>
  Lead.findByIdAndDelete(req.params.id)
      .then(() => res.json({ success: true }));
