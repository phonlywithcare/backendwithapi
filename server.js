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

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("Admin connected ✔");
});

// CONNECT MONGO
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// SCHEMA
const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },   // ⭐ FIXED
  name: String,
  phone: String,
  device: String,
  issue: String,
  date: String,
  time: String,
  status: { type: String, default: "Pending" },
  service: String,
  address: String,
  datetime: String,
  createdAt: { type: Date, default: Date.now },
});

// ⭐ AUTO GENERATE BOOKING ID
BookingSchema.pre("save", async function (next) {
  if (!this.bookingId) {
    const count = await Booking.countDocuments();
    this.bookingId = "PHN" + String(count + 1).padStart(5, "0");
  }
  next();
});

const Booking = mongoose.model("Booking", BookingSchema);

// ADD BOOKING
app.post("/api/bookings", async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();

    // Live Update
    io.emit("new-booking", newBooking);

    res.json({ message: "Booking added", booking: newBooking });
  } catch (err) {
    res.status(500).json({ message: "Booking error", error: err });
  }
});

// GET BOOKINGS
app.get("/api/bookings", async (req, res) => {
  try {
    const all = await Booking.find().sort({ _id: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend Running ✔");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on port " + PORT));
