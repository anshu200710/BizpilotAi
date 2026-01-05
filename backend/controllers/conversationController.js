// controllers/conversation.controller.js
import Conversation from '../models/Conversation.js'
import Lead from '../models/Lead.js'

export const getConversation = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    if (lead.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const conversation = await Conversation.findOne({
      user: req.user.id,
      // customerNumber: lead.customerNumber
      customerNumber: lead.phone
    })

    res.json(conversation || { messages: [] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not fetch conversation' })
  }
}
