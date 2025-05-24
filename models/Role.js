import mongoose, { Schema } from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  isCustom: { type: Boolean, default: false },
});

export default mongoose.model("Role", roleSchema);
