import mongoose, { Schema } from "mongoose";

const teamMembershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  role: {
    type: String,
    enum: ["team_manager", "project_manager", "developer"],
    default: "developer"
  },
  joinedAt: { type: Date, default: Date.now },
});

export default mongoose.model("TeamMembership", teamMembershipSchema);
