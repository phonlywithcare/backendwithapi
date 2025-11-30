import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connect
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.log("Mongo Error ❌", err));


const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  device: { type: String, required: true },
  service: { type: String, required: true },
  address: { type: String, required: true },
  datetime: { type: String, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model("Booking", BookingSchema);

// ===============================
// REVIEW SCHEMA
// ===============================
const ReviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", ReviewSchema);


// ===============================
// BOOKING ROUTES
// ===============================

// Add booking
app.post("/api/bookings", async (req, res) => {
  try {
    console.log("Booking received:", req.body);

    const booking = new Booking(req.body);
    await booking.save();

    res.json({ message: "Booking added ✔", booking });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all bookings
app.get("/api/bookings", async (req, res) => {
  try {
    const all = await Booking.find().sort({ _id: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});


// ===============================
// REVIEW ROUTES
// ===============================

// Add review
app.post("/api/reviews", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.json({ message: "Review added ✔", review });
  } catch (err) {
    console.error("Review error:", err);
    res.status(500).json({ message: "Review error" });
  }
});

// Get all reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const all = await Review.find().sort({ _id: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});


// Test route
app.get("/", (req, res) => {
  res.send("Backend Running ✔");
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on " + PORT));
