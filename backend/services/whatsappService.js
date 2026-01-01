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

export const sendWhatsAppMessage = async ({ to, text, phoneNumberId, encryptedAccessToken }) => {
  try {
    const token = decrypt(encryptedAccessToken)
    if (!token) throw new Error('Token decrypt failed')

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`

    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('✅ WhatsApp message sent')
  } catch (err) {
    console.error('❌ WhatsApp send failed:', err.response?.data || err.message)
  }
}
