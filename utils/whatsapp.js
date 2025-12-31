import axios from "axios";

export const sendWhatsAppMessage = async (to, text) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.WA_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: text }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("WhatsApp sent to:", to);
  } catch (error) {
    console.error(
      "WhatsApp error:",
      error.response?.data || error.message
    );
  }
};
