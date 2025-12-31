import express from "express";
import Booking from "../models/Booking.js";
import { sendWhatsApp } from "../utils/whatsapp.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const booking = await Booking.create(req.body);

  // Send WhatsApp confirmation
  await sendWhatsApp(
    req.body.phone,
    `✅ Hi ${req.body.name}, your Phonly repair booking is confirmed.
📱 Service: ${req.body.service}
We’ll contact you soon.`
  );

  res.json({ message: "Booking created & WhatsApp sent" });
});

export default router;
