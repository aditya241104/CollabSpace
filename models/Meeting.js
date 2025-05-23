import mongoose, { Schema } from "mongoose";

const meetingSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  type: { type: String, enum: ["scheduled", "instant"], default: "scheduled" },
  meetingUrl: String,
  recordings: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Meeting", meetingSchema);
