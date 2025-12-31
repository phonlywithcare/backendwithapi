import express from "express";
import Review from "../models/Review.js";

const router = express.Router();

// ================= ADD REVIEW =================
router.post("/", async (req, res) => {
  try {
    const { name, rating, message } = req.body;

    if (!name || !rating || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const review = new Review({
      name,
      rating,
      message
    });

    await review.save();

    res.json({
      success: true,
      review
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Review save failed"
    });
  }
});

// ================= GET ALL REVIEWS =================
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({
      message: "Fetch error"
    });
  }
});

export default router;
