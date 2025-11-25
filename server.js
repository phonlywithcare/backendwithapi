import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Temporary in-memory storage (since you don't have database yet)
let bookings = [];
let reviews = [
  { id: 1, name: "Amit", rating: 5, text: "Quick service & genuine parts. Technician was polite." },
  { id: 2, name: "Priya", rating: 5, text: "Fixed my screen same day. Great job." }
];

// -----------------------------
// TEST ROUTE
// -----------------------------
app.get("/", (req, res) => {
  res.send("Phonly Backend Running Successfully!");
});

// -----------------------------
// BOOKINGS
// -----------------------------
app.post("/api/book", (req, res) => {
  const booking = {
    id: Date.now(),
    ...req.body
  };

  bookings.unshift(booking);
  console.log("New booking:", booking);

  res.json({ success: true, message: "Booking stored", booking });
});

// -----------------------------
// GET REVIEWS
// -----------------------------
app.get("/api/reviews", (req, res) => {
  res.json(reviews);
});

// -----------------------------
// POST REVIEW
// -----------------------------
app.post("/api/review", (req, res) => {
  const review = {
    id: Date.now(),
    ...req.body
  };

  reviews.unshift(review);
  console.log("New review:", review);

  res.json({ success: true, message: "Review saved", review });
});

// -----------------------------
// START SERVER
// -----------------------------
const port = process.env.PORT || 10000;
app.listen(port, () => console.log("Backend running on port", port));

app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find();   // load all bookings from MongoDB
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
