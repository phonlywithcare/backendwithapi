import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// CONNECT TO MONGO
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.log("Mongo Error ❌", err));

// ULTRA UNIQUE BOOKING ID GENERATOR
function generateBookingId() {
  const prefix = "PHN";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${date}-${random}`;
}

// SCHEMAS
const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  name: String,
  phone: String,
  device: String,
  service: String,
  address: String,
  datetime: String,
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

const ReviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", BookingSchema);
const Review = mongoose.model("Review", ReviewSchema);

// BOOKING ROUTES
app.post("/api/bookings", async (req, res) => {
  try {
    const bookingId = generateBookingId();
    const newBooking = new Booking({
      bookingId,
      ...req.body
    });
    await newBooking.save();
    res.json({ message: "Booking added", bookingId, booking: newBooking });
  } catch (err) {
    console.error("Booking save error:", err);
    res.status(500).json({ message: "Booking error" });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const all = await Booking.find().sort({ _id: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});

app.get("/api/bookings/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Invalid Booking ID" });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});

// REVIEW ROUTES
app.post("/api/reviews", async (req, res) => {
  try {
    const newReview = new Review(req.body);
    await newReview.save();
    res.json({ message: "Review added", review: newReview });
  } catch (err) {
    res.status(500).json({ message: "Review error" });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const all = await Review.find().sort({ _id: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend Running ✔");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
