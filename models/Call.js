import mongoose, { Schema } from "mongoose";

const callSchema = new mongoose.Schema({
  type: { type: String, enum: ["audio", "video"], required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  startedAt: Date,
  endedAt: Date,
  status: { type: String, enum: ["ongoing", "ended"], default: "ongoing" },
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting" },
});

module.exports = mongoose.model("Call", callSchema);
