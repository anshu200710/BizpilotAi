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

// // export const verifyWebhook = (req, res) => {
// //   const mode = req.query['hub.mode']
// //   const token = req.query['hub.verify_token']
// //   const challenge = req.query['hub.challenge']

// //   console.log('Webhook verify:', { mode, token, challenge })

// //   if (
// //     mode === 'subscribe' &&
// //     token === process.env.VERIFY_TOKEN
// //   ) {
// //     // MUST return plain text
// //     return res.status(200).send(challenge)
// //   }

// //   return res.sendStatus(403)
// // }



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

import { generateAIReply } from '../config/gemini.js'
import { sendWhatsAppMessage } from '../services/whatsappService.js'
import Lead from '../models/Lead.js'
import Conversation from '../models/Conversation.js'
import WhatsAppAccount from '../models/WhatsAppAccount.js'

/**
 * ======================================================
 * 1️⃣ Webhook Verification (GET) — STATIC, NO DB
 * ======================================================
 * Meta requires:
 * - plain text response
 * - NO async work
 * - NO database access
 */
export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  console.log('🔎 Webhook verify request:', { mode, token, challenge })

  if (
    mode === 'subscribe' &&
    token === process.env.VERIFY_TOKEN &&
    challenge
  ) {
    return res.status(200).send(challenge) // MUST be plain text
  }

  return res.sendStatus(403)
}

/**
 * ======================================================
 * 2️⃣ Receive WhatsApp Messages (POST) — DB + AI
 * ======================================================
 * - Always respond 200 immediately
 * - Then process async
 */
export const receiveMessage = async (req, res) => {
  // Respond immediately to WhatsApp servers
  res.sendStatus(200)

  try {
    console.log('📩 Incoming WhatsApp webhook:', JSON.stringify(req.body, null, 2))

    const entry = req.body.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value

    // Ignore non-message webhooks (status updates, etc.)
    if (!value?.messages?.length) return

    const message = value.messages[0]

    // Only text messages for now
    if (message.type !== 'text') return

    const from = message.from // customer phone
    const text = message.text.body
    const phoneNumberId = value.metadata?.phone_number_id

    if (!phoneNumberId) {
      console.warn('❌ Missing phone_number_id in webhook metadata')
      return
    }

    // Resolve WhatsApp account (MULTI-TENANT SAFE)
    const account = await WhatsAppAccount.findOne({ phoneNumberId })

    if (!account) {
      console.warn('❌ No WhatsAppAccount found for phoneNumberId:', phoneNumberId)
      return
    }

    const userId = account.user

    // Find or create lead
    let lead = await Lead.findOne({ phone: from, owner: userId })

    if (!lead) {
      lead = await Lead.create({
        phone: from,
        owner: userId,
        whatsappAccount: account._id,
      })
    }

    // Save customer message
    await Conversation.create({
      lead: lead._id,
      user: userId,
      message: text,
      sender: 'customer',
      metadata: { raw: message },
    })

    // Generate AI reply
    const ai = await generateAIReply(text, 'English')

    if (!ai?.reply) {
      console.warn('⚠️ AI returned empty reply')
      return
    }

    // Save AI reply
    await Conversation.create({
      lead: lead._id,
      user: userId,
      message: ai.reply,
      sender: 'ai',
    })

    // Send reply via WhatsApp Cloud API
    await sendWhatsAppMessage({
      to: from,
      text: ai.reply,
      phoneNumberId: account.phoneNumberId,
      encryptedAccessToken: account.encryptedAccessToken,
    })

    console.log('✅ Reply sent to', from)
  } catch (error) {
    console.error('🔥 WhatsApp webhook processing error:', error)
  }
}
