import express from "express";
import {
  createProject,
  addProjectManager,
  assignTeamToProject,
  getUserProjects
} from "../controllers/projectController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken,createProject);
router.post("/assign-manager",verifyToken, addProjectManager);
router.post("/assign-team", verifyToken,assignTeamToProject);
router.get('/:userId', verifyToken,getUserProjects);

export default router;
