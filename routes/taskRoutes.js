import express from "express";
import {
  assignMainTask,
  assignSubtask,
  getTasksForTeam,
  getSubtasksForTask,
  getUserTasks,        // NEW
  updateTaskStatus,    // NEW
  updateSubtaskStatus, // NEW
  getAllTasks,         // NEW
  deleteTask          // NEW
} from "../controllers/taskController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// Project Manager assigns main task
router.post("/assign-main", verifyToken,assignMainTask);

// Team Manager assigns subtask
router.post("/assign-sub",verifyToken, assignSubtask);

// Team tasks
router.get("/team/:teamId", verifyToken,getTasksForTeam);

// Subtasks under a main task
router.get("/subtasks/:taskId",verifyToken, getSubtasksForTask);

// NEW ROUTES:
// Get tasks assigned to a specific user (for developers)
router.get("/user/:userId", verifyToken,getUserTasks);

// Update task status (for project managers/admin)
router.patch("/:taskId/status",verifyToken, updateTaskStatus);

// Update subtask status (for assigned users/team managers/admin)
router.patch("/subtask/:subtaskId/status",verifyToken ,updateSubtaskStatus);

// Get all tasks for admin/project manager overview
router.get("/all/:userId", verifyToken,getAllTasks);

// Delete task (admin/project manager only)
router.delete("/:taskId", verifyToken,deleteTask);

export default router;