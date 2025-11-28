import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Booking from "./Booking.js";
import Review from "./Review.js";

const app = express();

// ------------------------------
// Middleware
// ------------------------------
app.use(cors({ origin: "*" }));
app.options("*", cors());
app.use(express.json());

// ------------------------------
// MongoDB Connect
// ------------------------------
const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  console.error("❌ MONGO_URL is missing. Add it in Render environment.");
  process.exit(1);
}

mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.log("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// ------------------------------
// Generate Booking ID
// ------------------------------
function generateBookingId() {
  return "PHN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ------------------------------
// ROUTES
// ------------------------------
app.get("/", (req, res) => {
  res.send("Backend OK ✔");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Create Booking
app.post("/api/bookings", async (req, res) => {
  try {
    const bookingId = generateBookingId();
    const { name, phone, device, service, address, datetime } = req.body;

    if (!name || !phone || !device || !service || !address) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, phone, device, service, address",
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
      message: "Booking created successfully",
      bookingId,
      data: newBooking,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
});

// Get Booking Status
app.get("/api/bookings/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId,
    });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
});

// Get All Reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(50);
    res.json(reviews);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
});

// Create Review
app.post("/api/reviews", async (req, res) => {
  try {
    const { name, rating, message } = req.body;
    if (!name || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "Missing name or rating" });
    }

    const r = await Review.create({ name, rating, message });
    res.json({ success: true, data: r });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
});

// ------------------------------
// Start Server
// ------------------------------
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
