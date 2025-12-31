import express from "express";
import Booking from "../models/Booking.js";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";

const router = express.Router();

// UPDATE STATUS + AUTO WHATSAPP
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    let message = "";

    if (status === "accepted") {
      message = `✅ Hi ${booking.name}, your Phonly repair request is accepted. Our technician will contact you soon.`;
    } 
    else if (status === "ontheway") {
      message = `🚴 Hi ${booking.name}, our technician is on the way. Please be available.`;
    } 
    else if (status === "completed") {
      message = `🎉 Hi ${booking.name}, your phone repair is completed. Thank you for choosing Phonly!`;
    }

    if (message) {
      await sendWhatsAppMessage(booking.phone, message);
    }

    res.json({ success: true, booking });

  } catch (error) {
    res.status(500).json({ error: "Status update failed" });
  }
});

export default router;
