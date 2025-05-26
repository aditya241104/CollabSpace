import express from "express";
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
router.post("/create", createOrganization);

// @route   POST /api/organization/invite
router.post("/invite", inviteUserToOrganization);

// @route   POST /api/organization/join-request
router.post("/join-request", sendJoinRequest);

// @route   GET /api/organization/requests/:adminId
router.get("/requests/:adminId", getJoinRequests);

// @route   POST /api/organization/accept-request
router.post("/accept-request", acceptJoinRequest);

// @route   POST /api/organization/reject-request
router.post("/reject-request", rejectJoinRequest);

// @route   GET /api/organization/members/:adminId
router.get("/members/:adminId", getOrganizationMembers);

// @route   POST /api/organization/remove-member
router.post("/remove-member", removeUserFromOrganization);

// @route   PUT /api/organization/update
router.put("/update", updateOrganization);
router.get("/:id",getOrganizationDetails)
export default router;
