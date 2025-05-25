import express from "express";
import {
  createTeam,
  addMember,
  getTeamDetails,
  removeMember,
  changeMemberRole,
  listTeamsForUser,
  updateTeamName,
  updateTeamDescription,
  listTeamsInOrg
} from "../controllers/teamController.js";

const router = express.Router();

// Create a new team
router.post("/create", createTeam);

// Add a member to team
router.post("/add-member", addMember);

// Get team details with members and roles
router.get("/:teamId", getTeamDetails);

// Remove a member from team
router.post("/remove-member", removeMember);

// Change a member's role
router.post("/change-member-role", changeMemberRole);

// List all teams of a user
router.get("/user/:userId", listTeamsForUser);

// Update team name
router.patch("/:teamId/name", updateTeamName);

// Update team description
router.patch("/:teamId/description", updateTeamDescription);

router.get("/organization/:userId", listTeamsInOrg);

export default router;
