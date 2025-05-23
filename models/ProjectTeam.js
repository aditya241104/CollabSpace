import mongoose, { Schema } from "mongoose";

const projectTeamSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  assignedAt: { type: Date, default: Date.now },
  role: String,
});

module.exports = mongoose.model("ProjectTeam", projectTeamSchema);
