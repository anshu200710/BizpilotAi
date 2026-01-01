// controllers/conversation.controller.js
import Conversation from '../models/Conversation.js'
import Lead from '../models/Lead.js'

export const getConversation = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    if (lead.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
    const data = await Conversation.find({ lead: req.params.leadId }).sort({ createdAt: 1 })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch conversation' })
  }
}
