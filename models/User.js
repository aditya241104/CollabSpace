import mongoose from "mongoose";
import { generateSecretKey } from "../utils/crypto.js";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: "" },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  encryptionKey: { type: String }, // Stores derived encryption key
  keySalt: { type: String }, // Stores salt for key derivation
  isOnline: { type: Boolean, default: false },
  socketId: { type: String, default: null },
  lastActive: { type: Date, default: Date.now },
});

// Generate encryption key when user is created
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.encryptionKey) {
    try {
      const { key, salt } = generateSecretKey(this.passwordHash);
      this.encryptionKey = key;
      this.keySalt = salt;
    } catch (error) {
      console.error('Error generating encryption keys:', error);
      throw error;
    }
  }
  next();
});

export default mongoose.model("User", userSchema);