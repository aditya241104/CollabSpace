import mongoose, { Schema } from "mongoose";

const teamMembershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  permissions: [String],
  joinedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TeamMembership", teamMembershipSchema);
