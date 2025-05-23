import mongoose, { Schema } from "mongoose";;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  passwordHash: {
    type: String,
    required: true,
  },

  avatar: {
    type: String,
    default: "", // optional URL
  },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },

  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
  ],

  roles: [
    {
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
      role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    },
  ],

  isOnline: {
    type: Boolean,
    default: false,
  },

  socketId: {
    type: String,
    default: null,
  },

  joinedAt: {
    type: Date,
    default: Date.now,
  },

  lastActive: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
 export default User;
