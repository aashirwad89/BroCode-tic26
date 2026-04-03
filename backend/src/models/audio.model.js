import mongoose from "mongoose";

const audioSchema = new mongoose.Schema({
  file: {
    type: String,
    required: true, // file path (uploads/xyz.m4a)
  },

  // optional but useful 🔥
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  duration: {
    type: Number, // seconds (optional)
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Audio = mongoose.model("Audio", audioSchema);

export default Audio;