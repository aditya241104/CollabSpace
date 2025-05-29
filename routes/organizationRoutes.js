import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";

import {
  createOrganization,
  inviteUserToOrganization,
  sendJoinRequest,
  getJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  getOrganizationMembers,
  removeUserFromOrganization,
  updateOrganization,
  getOrganizationDetails
} from "../controllers/organizationController.js";

const router = express.Router();

// @route   POST /api/organization/create
router.post("/create",verifyToken, createOrganization);

// @route   POST /api/organization/invite
router.post("/invite",verifyToken, inviteUserToOrganization);

// @route   POST /api/organization/join-request
router.post("/join-request",verifyToken,sendJoinRequest);

// @route   GET /api/organization/requests/:adminId
router.get("/requests/:adminId", verifyToken,getJoinRequests);

// @route   POST /api/organization/accept-request
router.post("/accept-request",verifyToken, acceptJoinRequest);

// @route   POST /api/organization/reject-request
router.post("/reject-request",verifyToken, rejectJoinRequest);

// @route   GET /api/organization/members/:adminId
router.get("/members/:adminId", verifyToken,getOrganizationMembers);

// @route   POST /api/organization/remove-member
router.post("/remove-member", verifyToken,removeUserFromOrganization);

// @route   PUT /api/organization/update
router.put("/update", updateOrganization);
router.get("/:id",getOrganizationDetails)
export default router;
