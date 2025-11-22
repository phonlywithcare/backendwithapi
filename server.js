// ============================
//  PHONLY BACKEND (CommonJS)
// ============================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "phonlysecret",
    resave: false,
    saveUninitialized: true,
  })
);

// ============================
//  DATABASE CONNECTION
// ============================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB ✔️"))
  .catch((err) => console.error("MongoDB Error ❌", err));

// ============================
//  MODELS
// ============================

const bookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  device: String,
  service: String,
  address: String,
  datetime: String,
  created: { type: Date, default: Date.now },
});

const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  message: String,
  created: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);
const Review = mongoose.model("Review", reviewSchema);

// ============================
//  API ROUTES
// ============================

// Health Test
app.get("/api/test", (req, res) => {
  res.send("API working");
});

// Create Booking
app.post("/api/bookings", async (req, res) => {
  try {
    await Booking.create(req.body);
    res.json({ message: "Booking saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving booking" });
  }
});

// List Reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const rev = await Review.find().sort({ created: -1 });
    res.json(rev);
  } catch (e) {
    res.status(500).json({ message: "Error loading reviews" });
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

// Protect admin routes
function checkAdmin(req, res, next) {
  if (req.session.admin) return next();
  res.status(403).json({ message: "Unauthorized" });
}

// Fetch all bookings
app.get("/api/admin/bookings", checkAdmin, async (req, res) => {
  const b = await Booking.find().sort({ created: -1 });
  res.json(b);
});

// ============================
//  STATIC ADMIN PANEL
// ============================

app.use("/admin", express.static(path.join(__dirname, "public")));

// ============================
//  START SERVER
// ============================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server started on", PORT));
