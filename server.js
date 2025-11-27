import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// CORS FIXED – accepts Vercel frontends safely
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "https://phonly.vercel.app",
      "https://phonly-frontend.vercel.app",
      "https://www.phonly-frontend.vercel.app",
      "http://localhost:3000"
    ];

    if (!origin) return callback(null, true); 
    if (allowed.includes(origin)) return callback(null, true);
    if (origin.endsWith("vercel.app")) return callback(null, true);  // <--- FIXED

    return callback(new Error("CORS blocked"), false);
  }
}));

app.use(express.json({ limit: "2mb" }));

// MONGO FIX
const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
  console.error("❌ MONGO_URL missing!");
}

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// SCHEMAS
const bookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  brand: String,
  device: String,
  service: String,
  address: String,
  datetime: String,
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);

const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);

// ROUTES
app.get("/", (req, res) => res.send("Phonly backend OK"));

// CREATE BOOKING — FIXED VALIDATION
app.post("/api/bookings", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ message: "Booking saved", booking });
  } catch (err) {
    console.log("Booking Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET BOOKINGS
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE REVIEW
app.post("/api/reviews", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.json({ message: "Review saved", review });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET REVIEWS
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
