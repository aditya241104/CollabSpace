import express from "express";
import {
  createProject,
  addProjectManager,
  assignTeamToProject,
  getUserProjects,
  updateProject,
  deleteProject,
  removeTeamFromProject
} from "../controllers/projectController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken,createProject);
router.post("/assign-manager",verifyToken, addProjectManager);
router.post("/assign-team", verifyToken,assignTeamToProject);
router.get('/:userId', verifyToken,getUserProjects);
router.put("/update", verifyToken, updateProject);
router.delete("/delete", verifyToken, deleteProject);
router.delete("/remove-team", verifyToken, removeTeamFromProject);
export default router;
