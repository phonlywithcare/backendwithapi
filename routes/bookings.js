import express from "express";
import Booking from "../models/Booking.js";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";

const router = express.Router();

// ================= CREATE BOOKING =================
router.post("/", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: "Booking error" });
  }
});

// ================= GET ALL BOOKINGS (ADMIN) =================
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});

// ================= GET BOOKING BY BOOKING ID =================
router.get("/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId
    });

    if (!booking) {
      return res.status(404).json({ message: "Invalid Booking ID" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});

// ================= UPDATE STATUS + WHATSAPP =================
router.put("/:id", async (req, res) => {
  try {
    let { status } = req.body;
    status = status.toLowerCase(); // normalize

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

  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
});

export default router;
