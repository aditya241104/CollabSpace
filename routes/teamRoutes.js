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
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new team
router.post("/create", verifyToken,createTeam);

// Add a member to team
router.post("/add-member", verifyToken,addMember);

// Get team details with members and roles
router.get("/:teamId", verifyToken,getTeamDetails);

// Remove a member from team
router.post("/remove-member",verifyToken,removeMember);

// Change a member's role
router.post("/change-member-role",verifyToken, changeMemberRole);

// List all teams of a user
router.get("/user/:userId", verifyToken,listTeamsForUser);

// Update team name
router.patch("/:teamId/name", verifyToken,updateTeamName);

// Update team description
router.patch("/:teamId/description",verifyToken, updateTeamDescription);

router.get("/organization/:userId", verifyToken,listTeamsInOrg);

export default router;
