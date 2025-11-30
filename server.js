import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// HTTP + Socket Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

// SOCKET.IO CONNECTION
io.on("connection", (socket) => {
  console.log("Admin connected ✔");
});

// CONNECT MONGO
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.log("Mongo Error ❌", err));


// 🔥 AUTO BOOKING ID GENERATOR
async function generateBookingId() {
  const count = await Booking.countDocuments();
  const number = (count + 1).toString().padStart(3, "0");
  return `PHN-${number}`;
}


// ----------------------
// SCHEMAS
// ----------------------
const BookingSchema = new mongoose.Schema({
  bookingId: String,
  name: String,
  phone: String,
  device: String,
  issue: String,
  date: String,
  time: String,
  datetime: String,
  status: { type: String, default: "pending" },
  service: String,
  address: String,
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


// --------------------------------
// ADD BOOKING  (ID AUTO GENERATED)
// --------------------------------
app.post("/api/bookings", async (req, res) => {
  try {
    const bookingId = await generateBookingId();

    const newBooking = new Booking({ ...req.body, bookingId });
    await newBooking.save();

    // SEND LIVE NOTIFICATION
    io.emit("new-booking", newBooking);

    res.json({ message: "Booking added", booking: newBooking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Booking error" });
  }
});


// ----------------------
// GET ALL BOOKINGS
// ----------------------
app.get("/api/bookings", async (req, res) => {
  try {
    const all = await Booking.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});


// ----------------------
// UPDATE BOOKING STATUS
// ----------------------
app.put("/api/bookings/:id", async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Status update error" });
  }
});


// ----------------------
// ADD REVIEW
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


// ----------------------
// GET ALL REVIEWS
// ----------------------
app.get("/api/reviews", async (req, res) => {
  try {
    const all = await Review.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});


// ----------------------
// WHATSAPP SEND ROUTE
// ----------------------
app.post("/api/whatsapp/send", async (req, res) => {
  try {
    console.log("WhatsApp request:", req.body);
    res.json({ success: true, message: "WhatsApp Sent (demo)" });
  } catch {
    res.status(500).json({ message: "WhatsApp error" });
  }
});


// ----------------------
// HOME ROUTE
// ----------------------
app.get("/", (req, res) => {
  res.send("Backend Running with Socket.io ✔");
});


// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on port " + PORT));
