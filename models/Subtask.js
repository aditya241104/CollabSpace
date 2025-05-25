import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  title: { type: String, required: true },
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // team manager
  status: { type: String, enum: ["pending", "in_progress", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Subtask", subtaskSchema);