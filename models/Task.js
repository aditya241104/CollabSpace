import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // project manager
  status: { type: String, enum: ["pending", "in_progress", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Task", taskSchema);