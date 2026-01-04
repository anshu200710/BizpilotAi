import Lead from "../models/Lead.js";

/**
 * CREATE LEAD
 * Used by:
 * - Scraper
 * - WhatsApp
 * - Manual entry
 */
export const createLead = async (req, res) => {
  try {
    const lead = await Lead.create({
      userId: req.user._id,
      ...req.body
    });

    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create lead" });
  }
};

/**
 * GET ALL LEADS (FILTERABLE)
 */
export const getLeads = async (req, res) => {
  try {
    const { source, status } = req.query;

    const filter = { userId: req.user._id };

    if (source) filter.source = source;
    if (status) filter.status = status;

    const leads = await Lead.find(filter).sort({ pipelineOrder: 1 });

    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leads" });
  }
};

/**
 * UPDATE LEAD
 */
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: "Failed to update lead" });
  }
};

/**
 * UPDATE STATUS (DRAG & DROP)
 */
export const updateLeadStatus = async (req, res) => {
  const { status, pipelineOrder } = req.body;

  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status, pipelineOrder },
      { new: true }
    );

    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

/**
 * DELETE LEAD
 */
export const deleteLead = async (req, res) => {
  await Lead.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  res.json({ success: true });
};
