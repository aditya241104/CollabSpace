import User from "../models/User.js";
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Organization from "../models/Organization.js";

const JWT_SECRET = process.env.JWT_SECRET ||"a92fe4f91c98ee5d99215d8824e1a3b83051c53f9b5a6d9cf13f82a2ab99254e";

// Register user controller
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { userName, userEmail, userPassword, organizationId } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userPassword, salt);

    const user = new User({
      name: userName,
      email: userEmail,
      passwordHash,
      organizationId,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const handleInviteLink = async (req, res) => {
  const { email, organizationId } = req.body;
  const organization = await Organization.findById(organizationId);
    if (!organization) {
    return res.status(404).json({ message: "Organization not found" });
    }
  const user = await User.findOne({ email });

  if (user) {
    if (user.organizationId) {
      return res.status(400).json({ message: "User already belongs to an organization" });
    }

    // Allow user to join this org
    user.organizationId = organizationId;
    await user.save();

    return res.status(200).json({ message: "User successfully joined the organization" });
  } else {
    return res.status(404).json({
      message: "User does not exist. Please sign up to join the organization",
    });
  }
};
export {registerUser,handleInviteLink};