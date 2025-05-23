import mongoose, { Schema } from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  permissions: [String],
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  isCustom: { type: Boolean, default: false },
});

module.exports = mongoose.model("Role", roleSchema);
