import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// MONGO CONNECTION
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB error:", err));

// ====== BOOKING MODEL ======
const bookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  device: String,
  service: String,
  address: String,
  datetime: String,
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model("Booking", bookingSchema);

// ====== REVIEW MODEL ======
const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", reviewSchema);

// ============================
//        ROUTES
// ============================

// ---- Create Booking ----
app.post("/api/bookings", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ message: "Booking created", booking });
  } catch (err) {
    res.status(500).json({ message: "Error saving booking", error: err });
  }
});

// ---- Create Review ----
app.post("/api/reviews", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.json({ message: "Review added", review });
  } catch (err) {
    res.status(500).json({ message: "Error saving review", error: err });
  }
});

// ---- Get Reviews ----
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error loading reviews" });
  }
});

// ROOT CONFIRM PAGE
app.get("/", (req, res) => {
  res.send("Phonly backend is running ✔️");
});

// START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));
