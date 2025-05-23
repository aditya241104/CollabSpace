// routes/organizationRoutes.js
import express from 'express';
import {
  createOrganization,
  inviteUserToOrganization,
  sendJoinRequest,
} from '../controllers/organizationController.js';

const router = express.Router();

// POST /api/organization/create
router.post('/create', createOrganization);

// POST /api/organization/invite
router.post('/invite', inviteUserToOrganization);

// POST /api/organization/join-request
router.post('/join-request', sendJoinRequest);

export default router;
