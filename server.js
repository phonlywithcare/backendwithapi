// server.js (paste exactly)
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// Replace with your frontend URL (Vercel). If you have multiple frontends, add them to the array.
const ALLOWED_ORIGINS = [
  "https://phonly.vercel.app",
  "https://www.phonly.vercel.app",
  "https://phonly-frontend.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. curl, mobile apps)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error("CORS blocked by server"), false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" })); // parse JSON

// ---------- MongoDB connect ----------
const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;
if (!mongoUrl) {
  console.error("❌ MONGO_URL (or MONGO_URI) is not set in environment variables.");
  // Note: do not exit here in case you want server to start for testing, but it will fail DB ops.
}

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });

// ---------- Schemas & Models ----------
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  brand: String,
  device: String,
  service: String,
  address: String,
  datetime: String,
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

// ---------- Routes ----------

// Health
app.get("/", (req, res) => res.send("Phonly backend OK"));

// Create booking (called by your frontend)
app.post("/api/bookings", async (req, res) => {
  try {
    const payload = req.body;
    // basic validation (adjust to your frontend field names)
    if (!payload.name || !payload.phone) {
      return res.status(400).json({ message: "Missing required fields: name or phone" });
    }

    const booking = new Booking(payload);
    await booking.save();
    return res.json({ message: "Booking saved", booking });
  } catch (err) {
    console.error("Booking Error:", err);
    // Send a concise error to the client; full error appears in logs.
    return res.status(500).json({ message: "Server error", error: err.message || err });
  }
});

// Get bookings (for admin dashboard)
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error("Get Bookings Error:", err);
    res.status(500).json({ message: "Server error", error: err.message || err });
  }
});

// Create review
app.post("/api/reviews", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.name || !payload.message) {
      return res.status(400).json({ message: "Missing review fields" });
    }
    const review = new Review(payload);
    await review.save();
    res.json({ message: "Review saved", review });
  } catch (err) {
    console.error("Review Error:", err);
    res.status(500).json({ message: "Server error", error: err.message || err });
  }
});

// Get reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("Get Reviews Error:", err);
    res.status(500).json({ message: "Server error", error: err.message || err });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
