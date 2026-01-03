// controllers/lead.controller.js
import Lead from '../models/Lead.js'

export const createLead = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user.id }
    const lead = await Lead.create(payload)
    res.status(201).json(lead)
  } catch (err) {
    res.status(500).json({ message: 'Could not create lead' })
  }
}


export const getLeads = async (req, res) => {
  const data = await Lead.find({ user: req.user.id })
  res.json(data)
}


export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    if (lead.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' })

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Could not update lead' })
  }
}


export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    if (lead.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' })

    await Lead.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Could not delete lead' })
  }
}

