import Task from "../models/Task.js";
import Subtask from "../models/Subtask.js";
import Project from "../models/Project.js";
import TeamMembership from "../models/TeamMembership.js";
import Team from "../models/Team.js";
import User from "../models/User.js";

// Project Manager assigns main task to team
const assignMainTask = async (req, res) => {
  try {
    const { title, description, projectId, teamId, userId } = req.body;

    const project = await Project.findById(projectId);
    const user = await User.findById(userId);
    const team = await Team.findById(teamId);

    if (!project || !user || !team) {
      return res.status(404).json({ message: "User, team, or project not found" });
    }

    if (!project.projectManagerId.equals(user._id)) {
      return res.status(403).json({ message: "Only project manager can assign tasks" });
    }

    if (!project.organizationId.equals(team.organizationId)) {
      return res.status(400).json({ message: "Team and project must belong to same organization" });
    }

    const task = new Task({
      title,
      description,
      projectId,
      assignedTeam: teamId,
      createdBy: userId
    });

    await task.save();
    res.status(201).json({ message: "Main task assigned", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Team Manager assigns subtask to member
const assignSubtask = async (req, res) => {
  try {
    const { taskId, title, description, assignedTo, assignedBy } = req.body;

    const teamManagerMembership = await TeamMembership.findOne({
      userId: assignedBy,
      role: "team_manager"
    });

    if (!teamManagerMembership) {
      return res.status(403).json({ message: "Only team managers can assign subtasks" });
    }

    const subtask = new Subtask({
      taskId,
      title,
      description,
      assignedTo,
      assignedBy
    });

    await subtask.save();
    res.status(201).json({ message: "Subtask assigned", subtask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all tasks for a team (for team manager)
const getTasksForTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const tasks = await Task.find({ assignedTeam: teamId });
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get subtasks for a task
const getSubtasksForTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const subtasks = await Subtask.find({ taskId });
    res.status(200).json(subtasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  assignMainTask,
  assignSubtask,
  getTasksForTeam,
  getSubtasksForTask
};
