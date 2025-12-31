import express from "express";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";

const router = express.Router();

/**
 * Send WhatsApp message manually (optional use)
 * POST /api/whatsapp/send
 * body: { phone, message }
 */
router.post("/send", async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Phone and message are required"
      });
    }

    await sendWhatsAppMessage(phone, message);

    res.json({
      success: true,
      message: "WhatsApp message sent"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "WhatsApp send failed"
    });
  }
});

export default router;
