const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || "secret-session",
  resave: false,
  saveUninitialized: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB ✔"))
.catch((err) => {
  console.error("MongoDB connection failed:", err);
  process.exit(1);
});

// Define schemas
const bookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  device: String,
  service: String,
  address: String,
  datetime: String,
  createdAt: { type: Date, default: Date.now }
});
const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model("Booking", bookingSchema);
const Review = mongoose.model("Review", reviewSchema);

// ---- Routes ----

// Root /: basic health or info
app.get("/", (req, res) => {
  res.send("Phonly Backend is Running");
});

// API test (health)
app.get("/api/test", (req, res) => {
  return res.json({ status: "OK", message: "API is working" });
});

// Bookings
app.post("/api/bookings", async (req, res) => {
  try {
    const b = await Booking.create(req.body);
    return res.json({ success: true, booking: b });
  } catch (err) {
    console.error("Error saving booking:", err);
    return res.status(500).json({ success: false, message: "Could not save booking" });
  }
});

// Reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const rev = await Review.find().sort({ createdAt: -1 });
    return res.json(rev);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return res.status(500).json({ success: false, message: "Could not fetch reviews" });
  }
});

app.post("/api/review", async (req, res) => {
  try {
    const r = await Review.create(req.body);
    return res.json({ success: true, review: r });
  } catch (err) {
    console.error("Error creating review:", err);
    return res.status(500).json({ success: false, message: "Could not save review" });
  }
});

// Admin login (if you have admin logic)
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
    req.session.admin = true;
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Serve Admin UI (static files)
app.use("/admin", express.static(path.join(__dirname, "public")));

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
