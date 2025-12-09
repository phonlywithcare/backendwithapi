import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
// ================== MIDDLEWARE ==================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());


// ================== CONNECT TO MONGO ==================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.log("Mongo Error ❌", err));

// ================== UNIQUE ID GENERATOR ==================
function generateBookingId() {
  const prefix = "PHN";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${date}-${random}`;
}

// ================== SCHEMAS ==================
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

// ================== ADMIN LOGIN (NEW) ==================
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

// ================== BOOKING ROUTES ==================

// Create booking
app.post("/api/bookings", async (req, res) => {
  try {
    const bookingId = generateBookingId();
    const newBooking = new Booking({
      bookingId,
      ...req.body
    });

    await newBooking.save();
    res.json({
      message: "Booking added",
      bookingId,
      booking: newBooking
    });
  } catch (err) {
    console.error("Booking save error:", err);
    res.status(500).json({ message: "Booking error" });
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

// Get booking by ID
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

// ================== UPDATE STATUS (NEW) ==================
app.put("/api/bookings/:id", async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update error" });
  }
});

// ================== REVIEW ROUTES ==================
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

// ================== ROOT ==================
app.get("/", (req, res) => {
  res.send("Backend Running ✔ with Dashboard Support");
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
