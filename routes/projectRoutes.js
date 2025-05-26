import express from "express";
import {
  createProject,
  addProjectManager,
  assignTeamToProject,
  getUserProjects
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/create", createProject);
router.post("/assign-manager", addProjectManager);
router.post("/assign-team", assignTeamToProject);
router.get('/:userId', getUserProjects);

export default router;
