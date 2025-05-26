// routes/authRoutes.js
import express from 'express';
import { registerUser,loginUser } from '../controllers/authController.js';
import { refreshAccessToken } from '../controllers/refreshTokenController.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshAccessToken);

export default router;
