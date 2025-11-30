import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected ✔"))
.catch((err) => console.log("Mongo Error ❌", err));


// =========================
// UPDATED BOOKING SCHEMA
// =========================
const BookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  brand: String,
  service: String,
  address: String,

  preferredDate: String,   // from frontend
  preferredTime: String,   // from frontend

  status: { type: String, default: "Pending" },

  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", BookingSchema);


// =========================
// REVIEW SCHEMA
// =========================
const ReviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", ReviewSchema);


// =========================
// BOOKING ROUTES
// =========================

// ADD BOOKING
app.post("/api/bookings", async (req, res) => {
  try {
    console.log("New booking received →", req.body);

    const booking = new Booking(req.body);
    await booking.save();

    res.json({ message: "Booking added ✔", booking });
  } catch (err) {
    console.error("Booking Save Error ❌", err);
    res.status(500).json({ message: "Booking error", error: err.message });
  }
});

// GET ALL BOOKINGS
app.get("/api/bookings", async (req, res) => {
  try {
    const all = await Booking.find().sort({ _id: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});


// =========================
// REVIEW ROUTES
// =========================

// ADD REVIEW
app.post("/api/reviews", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.json({ message: "Review added ✔", review });
  } catch (err) {
    console.error("Review Error ❌", err);
    res.status(500).json({ message: "Review error" });
  }
});

// GET ALL REVIEWS
app.get("/api/reviews", async (req, res) => {
  try {
    const all = await Review.find().sort({ _id: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});


// =========================
// TEST ROUTE
// =========================
app.get("/", (req, res) => {
  res.send("Backend Running ✔");
});


// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
