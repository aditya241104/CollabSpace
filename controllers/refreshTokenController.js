import RefreshToken from '../models/RefreshToken.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || "a92fe4f91c98ee5d99215d8824e1a3b83051c53f9b5a6d9cf13f82a2ab99254e";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_jwt_secret';
const REFRESH_TOKEN_EXPIRE_DAYS = 7;

export const createRefreshToken = async (userId) => {
  // Delete existing refresh tokens for this user
  await RefreshToken.deleteMany({ userId });

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + REFRESH_TOKEN_EXPIRE_DAYS);

  const token = jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRE_DAYS}d`,
  });

  const refreshToken = new RefreshToken({
    token,
    userId,
    expiryDate,
  });

  await refreshToken.save();
  return token;
};

export const deleteRefreshToken = async (token) => {
  await RefreshToken.deleteOne({ token });
};

export const verifyRefreshToken = async (token) => {
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    
    // Check if token exists in database
    const refreshToken = await RefreshToken.findOne({ token });
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    // Check if token is expired
    if (refreshToken.expiryDate < new Date()) {
      await RefreshToken.deleteOne({ token });
      throw new Error('Refresh token expired');
    }

    return decoded;
  } catch (error) {
    throw error;
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' });
    }

    const decoded = await verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({
      token: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};