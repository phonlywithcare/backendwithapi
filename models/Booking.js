import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    device: {
      type: String,
      required: true
    },

    service: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    datetime: {
      type: String
    },

    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "ontheway", "completed"]
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);
