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
// Removed deprecated options as they are unnecessary in recent Mongoose versions
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected ✔"))
.catch((err) => console.log("Mongo Error ❌", err));

// SCHEMAS
const BookingSchema = new mongoose.Schema({
  // FIX: Added unique bookingId field with an auto-generator to fix the E11000 error
  bookingId: { 
    type: String,
    unique: true,
    required: true,
    // Generates a random 7-character alphanumeric ID like '3XW8T1L'
    default: () => Math.random().toString(36).slice(2, 9).toUpperCase(), 
  },
  name: String,
  phone: String,
  device: String,
   issue: String,   // add this
  date: String,    // add this
  time: String,    // add this
  // The client will only update this status field when checking a booking.
  status: { type: String, default: "Pending" }, 
  service: String,
  address: String,
  datetime: String,
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

// ----------------------
// BOOKING ROUTES
// ----------------------
app.post("/api/bookings", async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    // NEW: Return the generated bookingId to the client
    res.json({ message: "Booking added", booking: newBooking, bookingId: newBooking.bookingId });
  } catch (err) {
    // We are now logging the error, which helped debug the E11000 issue
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

// NEW: Route to check booking status by unique ID
app.get("/api/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id.toUpperCase() });

    if (!booking) {
      return res.status(404).json({ message: "Booking ID not found" });
    }
    
    // Return only necessary status details
    res.json({
        id: booking.bookingId,
        status: booking.status,
        device: booking.device,
        service: booking.service,
        datetime: booking.datetime,
        name: booking.name
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching status" });
  }
});


// ----------------------
// REVIEW ROUTES (NO CHANGE)
// ----------------------
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

// ----------------------
// TEST ROUTE
// ----------------------
app.get("/", (req, res) => {
  res.send("Backend Running ✔");
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
