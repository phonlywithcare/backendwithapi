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

// SCHEMAS
const BookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  device: String,
   issue: String,   // add this
  date: String,    // add this
  time: String,    // add this
  status: { type: String, default: "Pending" }, // add statu
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
    res.json({ message: "Booking added", booking: newBooking });
  } catch (err) {
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

// ----------------------
// REVIEW ROUTES
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
