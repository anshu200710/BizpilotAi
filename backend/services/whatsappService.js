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
import axios from "axios";

export const sendWhatsAppMessage = async (to, text) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ WhatsApp message sent:", response.data);
  } catch (error) {
    console.error(
      "❌ WhatsApp send error:",
      error.response?.data || error.message
    );
  }
};
