import express from "express";
import {
  assignMainTask,
  assignSubtask,
  getTasksForTeam,
  getSubtasksForTask
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

export default router;
