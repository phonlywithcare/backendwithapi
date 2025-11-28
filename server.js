import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Booking from "./Booking.js";
import Review from "./Review.js";

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB connection
const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
  console.error("❌ MONGO_URL missing. Add it in Render.");
  process.exit(1);
}

mongoose
  .connect(mongoUrl)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// Booking ID generator
function generateBookingId() {
  return "PHN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Create booking
app.post("/api/bookings", async (req, res) => {
  try {
    const bookingId = generateBookingId();
    const { name, phone, device, service, address, datetime } = req.body;

    if (!name || !phone || !device || !service || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    const newBooking = await Booking.create({
      bookingId,
      name,
      phone,
      device,
      service,
      address,
      datetime: datetime || null,
      status: "Pending",
    });

    res.json({
      success: true,
      bookingId,
      data: newBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get booking
app.get("/api/bookings/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId,
    });

    if (!booking) {
      return res.json({ success: false, message: "Not found" });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Reviews
app.get("/api/reviews", async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 }).limit(50);
  res.json(reviews);
});

app.post("/api/reviews", async (req, res) => {
  try {
    const { name, rating, message } = req.body;

    if (!name || !rating) {
      return res.status(400).json({
        success: false,
        message: "Missing name or rating",
      });
    }

    const r = await Review.create({ name, rating, message });
    res.json({ success: true, data: r });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log("🚀 Server running on", PORT));
