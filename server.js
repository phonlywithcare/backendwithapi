import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import bookingRoutes from "./routes/bookings.js";
import reviewRoutes from "./routes/reviews.js";
import whatsappRoutes from "./routes/whatsapp.js";

dotenv.config();

const app = express();

// ================== MIDDLEWARE ==================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// ================== ROUTES ==================
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/whatsapp", whatsappRoutes);

// ================== ADMIN LOGIN ==================
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASS
  ) {
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

// ================== CONNECT TO MONGO ==================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.log("Mongo Error ❌", err));

// ================== ROOT ==================
app.get("/", (req, res) => {
  res.send("Backend Running ✔ with WhatsApp + Dashboard");
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log("Server running on port " + PORT)
);
