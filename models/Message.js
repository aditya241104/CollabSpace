import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: String,
  messageType: { type: String, enum: ["text", "file", "system"], default: "text" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
