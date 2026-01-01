// import { generateAIReply } from '../config/gemini.js'
// import { sendWhatsAppMessage } from '../services/whatsappService.js'
// import Lead from '../models/Lead.js'
// import Conversation from '../models/Conversation.js'
// import WhatsAppAccount from '../models/WhatsAppAccount.js'

// export const verifyWebhook = async (req, res) => {
//   const mode = req.query['hub.mode']
//   const token = req.query['hub.verify_token']
//   const challenge = req.query['hub.challenge']

//   if (mode === 'subscribe') {
//     // Look up account with this verify token (per-account verification)
//     if (token) {
//       const account = await WhatsAppAccount.findOne({ verifyToken: token })
//       if (account) {
//         console.log('✅ Webhook verified for account', account.phoneNumberId)
//         return res.status(200).send(challenge)
//       }
//     }

//     // Fallback to legacy behaviour
//     if (token === process.env.VERIFY_TOKEN) {
//       console.log('✅ Legacy webhook verified')
//       return res.status(200).send(challenge)
//     }
//   }

//   console.log('❌ Webhook verification failed')
//   return res.sendStatus(403)
// }


// export const receiveMessage = async (req, res) => {
//   // Respond immediately to WhatsApp servers
//   res.sendStatus(200)

//   try {
//     const entry = req.body.entry?.[0]
//     const change = entry?.changes?.[0]
//     const value = change?.value
//     const messageData = value?.messages?.[0]

//     if (!messageData || messageData.type !== 'text') return

//     // Resolve which WhatsApp account this message belongs to
//     const phoneNumberId = value?.metadata?.phone_number_id || value?.metadata?.display_phone_number
//     const account = phoneNumberId ? await WhatsAppAccount.findOne({ phoneNumberId }) : null

//     if (!account) {
//       console.warn('Webhook: No WhatsAppAccount found for incoming phone_number_id', phoneNumberId)
//       return
//     }

//     const userId = account.user
//     const from = messageData.from
//     const text = messageData.text.body

//     // Find or create lead for this user
//     let lead = await Lead.findOne({ phone: from, owner: userId })
//     if (!lead) {
//       lead = await Lead.create({ phone: from, owner: userId, whatsappAccount: account._id })
//     }

//     // Save customer's message under conversation with user reference
//     await Conversation.create({ lead: lead._id, user: userId, message: text, sender: 'customer', metadata: { raw: messageData } })

//     // Call AI to generate reply
//     const ai = await generateAIReply(text, 'English')

//     // Save AI reply
//     await Conversation.create({ lead: lead._id, user: userId, message: ai.reply, sender: 'ai' })

//     // Send reply using account-specific credentials
//     await sendWhatsAppMessage({ to: from, text: ai.reply, phoneNumberId: account.phoneNumberId, encryptedAccessToken: account.encryptedAccessToken })
//   } catch (error) {
//     console.error('Webhook Error:', error)
//   }
// }
import connectDb from '../config/db.js'
import { generateAIReply } from '../config/gemini.js'
import { sendWhatsAppMessage } from '../services/whatsappService.js'
import Lead from '../models/Lead.js'
import Conversation from '../models/Conversation.js'
import WhatsAppAccount from '../models/WhatsAppAccount.js'

/**
 * Webhook verification (NO DB)
 */
export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (
    mode === 'subscribe' &&
    token === process.env.VERIFY_TOKEN &&
    challenge
  ) {
    return res.status(200).send(challenge)
  }

  return res.sendStatus(403)
}

/**
 * Receive WhatsApp messages
 */
export const receiveMessage = async (req, res) => {
  // Meta requires immediate 200
  res.sendStatus(200)

  try {
    // 🔥 Ensure DB is ready
    await connectDb()

    const entry = req.body.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value

    if (!value?.messages?.length) return

    const message = value.messages[0]
    if (message.type !== 'text') return

    const from = message.from
    const text = message.text.body
    const phoneNumberId = value.metadata?.phone_number_id

    if (!phoneNumberId) return

    const account = await WhatsAppAccount.findOne({ phoneNumberId })
    if (!account) return

    const userId = account.user

    let lead = await Lead.findOne({ phone: from, owner: userId })
    if (!lead) {
      lead = await Lead.create({
        phone: from,
        owner: userId,
        whatsappAccount: account._id,
      })
    }

    await Conversation.create({
      lead: lead._id,
      user: userId,
      message: text,
      sender: 'customer',
    })

    const ai = await generateAIReply(text, 'English')
    if (!ai?.reply) return

    await Conversation.create({
      lead: lead._id,
      user: userId,
      message: ai.reply,
      sender: 'ai',
    })

    await sendWhatsAppMessage({
      to: from,
      text: ai.reply,
      phoneNumberId: account.phoneNumberId,
      encryptedAccessToken: account.encryptedAccessToken,
    })

    console.log('✅ WhatsApp reply sent to', from)
  } catch (err) {
    console.error('🔥 WhatsApp webhook error:', err.message)
  }
}
