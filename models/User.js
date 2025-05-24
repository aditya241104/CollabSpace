import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  passwordHash: { type: String, required: true },

  avatar: { type: String, default: "" },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
    orgRole: {
    type: String,
    enum: ["admin", "project_manager", "developer", "hr", "viewer"],
    default: "developer"
  },
  isOnline: { type: Boolean, default: false },
  socketId: { type: String, default: null },

  joinedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
