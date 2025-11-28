import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb+srv://...", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Booking Model
const bookingSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    device: String,
    service: String,
    address: String,
    datetime: String,
    status: { type: String, default: "Pending" },

    // ⭐ NEW — booking ID
    bookingId: { type: String, unique: true },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

// ⭐ FUNCTION — Generate unique booking ID like PHN393930
function generateBookingID() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return "PHN" + random;
}

// API home
app.get("/", (req, res) => {
  res.json({ message: "Phonly API running" });
});

// ⭐ CREATE BOOKING (with ID generator)
app.post("/api/bookings", async (req, res) => {
  try {
    let bookingId = generateBookingID();

    // ensure unique
    while (await Booking.findOne({ bookingId })) {
      bookingId = generateBookingID();
    }

    const booking = new Booking({
      ...req.body,
      bookingId,
    });

    await booking.save();

    res.json({
      success: true,
      message: "Booking created",
      bookingId: bookingId, // return ID to frontend
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ⭐ CHECK STATUS BY BOOKING ID
app.get("/api/bookings/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId,
    });

    if (!booking) {
      return res.status(404).json({ message: "No booking found" });
    }

    res.json({
      bookingId: booking.bookingId,
      name: booking.name,
      service: booking.service,
      status: booking.status,
      datetime: booking.datetime,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching booking" });
  }
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on " + PORT));
