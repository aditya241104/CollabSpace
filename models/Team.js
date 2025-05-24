import mongoose, { Schema } from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  createdAt: { type: Date, default: Date.now },
  description:String,
  createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}

});

export default mongoose.model("Team", teamSchema);
