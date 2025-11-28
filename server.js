// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Booking from "./models/Booking.js";
import Review from "./models/Review.js";

const app = express();

// ---------------------
// CORS
// ---------------------
app.use(cors({
  origin: [
    "https://www.phonly.co.in",
    "https://phonly.co.in",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Body parser
app.use(express.json());

// ---------------------
// MongoDB Connection
// ---------------------
const mongoUrl = process.env.MONGO_URL; // Add in Render
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("Mongo Error:", err));


// ---------------------
// Booking ID Generator
// ---------------------
function generateBookingId() {
  return "PHN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}


// ---------------------
// Routes
// ---------------------

app.get("/", (req, res) => {
  res.json({ message: "Phonly API running" });
});


// Create Booking
app.post("/api/bookings", async (req, res) => {
  try {
    const bookingId = generateBookingId();
    const { name, phone, device, service, address, datetime } = req.body;

    if (!name || !phone || !device || !service || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
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
      status: "Pending"
    });

    res.json({
      success: true,
      bookingId,
      data: newBooking
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Get Booking by Booking ID
app.get("/api/bookings/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Fetch all reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(50);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add review
app.post("/api/reviews", async (req, res) => {
  try {
    const { name, rating, message } = req.body;

    if (!name || !rating) {
      return res.status(400).json({
        success: false,
        message: "Name & rating required"
      });
    }

    const review = await Review.create({ name, rating, message });
    res.json({ success: true, data: review });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
