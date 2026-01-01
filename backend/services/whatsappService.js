// import axios from "axios";

// export const sendWhatsAppMessage = async (to, message) => {
//   try {
//     await axios.post(
//       `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
//       {
//         messaging_product: "whatsapp",
//         to,
//         text: { body: message },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   } catch (error) {
//     console.error("WhatsApp Send Error:", error.response?.data || error.message);
//   }
// };
import axios from 'axios'
import { decrypt } from './crypto.js'

/**
 * Send WhatsApp message using either environment DEFAULT credentials
 * or account-specific encrypted token and phoneNumberId.
 *
 * @param {Object} opts - { to, text, phoneNumberId, encryptedAccessToken }
 */
export const sendWhatsAppMessage = async (opts) => {
  const { to, text, phoneNumberId, encryptedAccessToken } = opts || {}
  try {
    // Determine token and numberId to use
    let token = process.env.WHATSAPP_TOKEN
    let numberId = process.env.PHONE_NUMBER_ID

    if (phoneNumberId && encryptedAccessToken) {
      // Per-account send: decrypt token
      token = decrypt(encryptedAccessToken)
      numberId = phoneNumberId
    }

    if (!token || !numberId) throw new Error('Missing WhatsApp credentials')

    const url = `https://graph.facebook.com/v18.0/${numberId}/messages`
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('✅ WhatsApp message sent:', response.data)
    return { ok: true, data: response.data }
  } catch (error) {
    console.error('❌ WhatsApp send error:', error.response?.data || error.message)
    return { ok: false, message: error.response?.data || error.message }
  }
}

