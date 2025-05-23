import mongoose, { Schema } from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  projectManagerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "active" },
  timeline: { start: Date, end: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", projectSchema);
