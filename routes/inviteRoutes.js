// routes/inviteRoutes.js
import express from 'express';
import { handleInviteLink } from '../controllers/userController.js';
import verifyToken from "../middlewares/authMiddleware.js";


const router = express.Router();

// POST /api/invite/handle
router.post('/handle',verifyToken, handleInviteLink);

export default router;
