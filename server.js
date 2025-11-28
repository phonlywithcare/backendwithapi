// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path"; // Added: for file path utilities
import { fileURLToPath } from 'url'; // Added: for ES Module compatibility

import Booking from "./Booking.js";
import Review from "./Review.js";

// Define __dirname for ES Module environments (Node.js fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// FIX for "Cannot GET /": Serve all static frontend files from the root directory.
// This will automatically serve index.html when the user hits the base URL.
app.use(express.static(__dirname));

// MongoDB connection
const mongoUrl = process.env.MONGO_URL || "your_mongo_url_here";
mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message || err);
  });

// ------------------------------
// Helper: Booking ID generator
// ------------------------------
function generateBookingId() {
  // PHN- + 6 chars alphanumeric uppercase
  return "PHN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ------------------------------
// Routes
// ------------------------------

// Health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Create booking
app.post("/api/bookings", async (req, res) => {
  try {
    const bookingId = generateBookingId();

    // ensure essential fields exist (basic validation)
    const { name, phone, device, service, address, datetime } = req.body;

    if (!name || !phone || !device || !service || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, phone, device, service, address",
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
    console.error("Create booking error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

// Get booking by bookingId
app.get("/api/bookings/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

// Reviews endpoints (already used by your frontend)
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(50);
    res.json(reviews);
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const { name, rating, message } = req.body;
    if (!name || !rating) {
      return res.status(400).json({ success: false, message: "Missing name or rating" });
    }
    const r = await Review.create({ name, rating, message });
    res.json({ success: true, data: r });
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
