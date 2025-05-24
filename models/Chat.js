import mongoose, { Schema } from "mongoose";

const chatSchema = new mongoose.Schema({
  type: { type: String, enum: ["direct", "team", "project"], required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Chat", chatSchema);
