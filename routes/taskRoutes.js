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

const router = express.Router();

// Project Manager assigns main task
router.post("/assign-main", assignMainTask);

// Team Manager assigns subtask
router.post("/assign-sub", assignSubtask);

// Team tasks
router.get("/team/:teamId", getTasksForTeam);

// Subtasks under a main task
router.get("/subtasks/:taskId", getSubtasksForTask);

// NEW ROUTES:
// Get tasks assigned to a specific user (for developers)
router.get("/user/:userId", getUserTasks);

// Update task status (for project managers/admin)
router.patch("/:taskId/status", updateTaskStatus);

// Update subtask status (for assigned users/team managers/admin)
router.patch("/subtask/:subtaskId/status", updateSubtaskStatus);

// Get all tasks for admin/project manager overview
router.get("/all/:userId", getAllTasks);

// Delete task (admin/project manager only)
router.delete("/:taskId", deleteTask);

export default router;