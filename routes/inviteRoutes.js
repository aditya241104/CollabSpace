// routes/inviteRoutes.js
import express from 'express';
import { handleInviteLink } from '../controllers/userController.js';

const router = express.Router();

// POST /api/invite/handle
router.post('/handle', handleInviteLink);

export default router;
