// ============================
//  PHONLY BACKEND (Fully Fixed)
// ============================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || "phonly-secret",
  resave: false,
  saveUninitialized: true
}));

// ============================
//  DATABASE CONNECTION
// ============================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to MongoDB ✔️"))
  .catch((err) => console.error("MongoDB Error ❌", err));

// ============================
//  MODELS
// ============================

const BookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  device: String,
  service: String,
  address: String,
  datetime: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model("Booking", BookingSchema);

const ReviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Review = mongoose.model("Review", ReviewSchema);

// ============================
//  HEALTH CHECK ROUTES
// ============================
app.get("/", (req, res) => {
  res.send("Phonly Backend Running ✔");
});
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API Working" });
});

// ============================
//  BOOKING ROUTES
// ============================

// Create Booking
app.post("/api/bookings", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error saving booking" });
  }
});

// Get All Bookings (Admin Only)
app.get("/api/admin/bookings", async (req, res) => {
  if (!req.session.admin) return res.status(403).json({ message: "Unauthorized" });

  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
});

// Update Booking Status
app.put("/api/bookings/:id", async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true, message: "Booking updated" });
  } catch {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// Delete Booking
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Booking deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

// ============================
//  REVIEW ROUTES (FIXED)
// ============================

// Create Review
app.post("/api/reviews", async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.json({ success: true, review });
  } catch {
    res.status(500).json({ success: false, message: "Review error" });
  }
});

// Get All Reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch {
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

// ============================
//  ADMIN LOGIN
// ============================
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASS
  ) {
    req.session.admin = true;
    return res.json({ success: true });
  }

  res.status(401).json({ success: false, message: "Invalid login" });
});

// Logout
app.get("/admin/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ============================
//  STATIC ADMIN PANEL
// ============================
app.use("/admin", express.static(path.join(__dirname, "public")));

// ============================
//  START SERVER
// ============================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));
