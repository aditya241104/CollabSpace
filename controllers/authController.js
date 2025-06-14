import User from "../models/User.js"
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import {createRefreshToken,deleteRefreshToken} from './refreshTokenController.js';
const JWT_SECRET = process.env.JWT_SECRET ||"a92fe4f91c98ee5d99215d8824e1a3b83051c53f9b5a6d9cf13f82a2ab99254e";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_refresh_jwt_secret";
import { generateKeyPair,encryptPrivateKey } from "../utils/crypto.js";
import crypto from 'crypto';
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
    const keySalt = crypto.randomBytes(16).toString('hex');
    const encryptionKey = crypto.pbkdf2Sync(userPassword, keySalt, 100000, 32, 'sha512');
    const { publicKey, secretKey } = generateKeyPair();
    const encryptedPrivateKey = encryptPrivateKey(secretKey, encryptionKey,keySalt);
    const user = new User({
      name: userName,
      email: userEmail,
      passwordHash,
      organizationId,
      publicKey,
      encryptedPrivateKey,
      keySalt: keySalt,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = await createRefreshToken(user._id);
      res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const loginUser= async(req,res)=>{
  const errors = validationResult(req);
  try{
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
  const {userEmail,userPassword}=req.body;
  const user= await User.findOne({email:userEmail});
  if(!user){
    return res.status(404).json({message:"User Not Found"});
  }
  const isPasswordCorrect = await bcrypt.compare(userPassword, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = await createRefreshToken(user._id);
      res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  }
  catch(error){
    return res.status(500).json({message:"Server error"});
  }
}
const logoutUser = async (req, res) => {
    try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      // Delete refresh token from database
      await deleteRefreshToken(refreshToken);
    }

    // Clear cookies
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: "Server error during logout" });
  }
};
export {registerUser,loginUser,logoutUser};