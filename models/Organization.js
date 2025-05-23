import mongoose, { Schema } from "mongoose";

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  logo: String,
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;
