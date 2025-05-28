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
    const tasks = await Task.find({ assignedTeam: teamId })
      .populate('projectId', 'name description')
      .populate('createdBy', 'name email')
      .populate('assignedTeam', 'name');
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
    const subtasks = await Subtask.find({ taskId })
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email');
    res.status(200).json(subtasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Get tasks assigned to a specific user (for developers)
const getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get subtasks assigned to the user
    const subtasks = await Subtask.find({ assignedTo: userId })
      .populate({
        path: 'taskId',
        populate: {
          path: 'projectId',
          select: 'name description'
        }
      })
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(subtasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Update task status (for project managers)
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, userId } = req.body;

    const task = await Task.findById(taskId).populate('projectId');
    const user = await User.findById(userId);

    if (!task || !user) {
      return res.status(404).json({ message: "Task or user not found" });
    }

    // Check if user is project manager or admin
    const isProjectManager = task.projectId.projectManagerId.equals(user._id);
    const isAdmin = user.orgRole === 'admin';

    if (!isProjectManager && !isAdmin) {
      return res.status(403).json({ message: "Only project manager or admin can update task status" });
    }

    task.status = status;
    await task.save();

    res.status(200).json({ message: "Task status updated", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Update subtask status (for assigned developers)
const updateSubtaskStatus = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { status, userId } = req.body;

    const subtask = await Subtask.findById(subtaskId);
    const user = await User.findById(userId);

    if (!subtask || !user) {
      return res.status(404).json({ message: "Subtask or user not found" });
    }

    // Check if user is assigned to this subtask, team manager, or admin
    const isAssignedUser = subtask.assignedTo.equals(user._id);
    const isTeamManager = await TeamMembership.findOne({
      userId: user._id,
      role: "team_manager"
    });
    const isAdmin = user.orgRole === 'admin';

    if (!isAssignedUser && !isTeamManager && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    subtask.status = status;
    await subtask.save();

    res.status(200).json({ message: "Subtask status updated", subtask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Get all tasks for admin/project manager overview
const getAllTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let tasks = [];

    if (user.orgRole === 'admin') {
      // Admin can see all tasks in organization
      tasks = await Task.find({})
        .populate({
          path: 'projectId',
          match: { organizationId: user.organizationId },
          select: 'name description organizationId'
        })
        .populate('createdBy', 'name email')
        .populate('assignedTeam', 'name')
        .sort({ createdAt: -1 });
      
      // Filter out tasks where projectId is null (not in same org)
      tasks = tasks.filter(task => task.projectId);
    } else {
      // Project managers can see tasks for their projects
      const projects = await Project.find({ projectManagerId: userId });
      const projectIds = projects.map(p => p._id);
      
      tasks = await Task.find({ projectId: { $in: projectIds } })
        .populate('projectId', 'name description')
        .populate('createdBy', 'name email')
        .populate('assignedTeam', 'name')
        .sort({ createdAt: -1 });
    }

    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Delete task (admin/project manager only)
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    const task = await Task.findById(taskId).populate('projectId');
    const user = await User.findById(userId);

    if (!task || !user) {
      return res.status(404).json({ message: "Task or user not found" });
    }

    const isProjectManager = task.projectId.projectManagerId.equals(user._id);
    const isAdmin = user.orgRole === 'admin';

    if (!isProjectManager && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete all subtasks first
    await Subtask.deleteMany({ taskId });
    // Delete the main task
    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: "Task and all subtasks deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  assignMainTask,
  assignSubtask,
  getTasksForTeam,
  getSubtasksForTask,
  getUserTasks,        // NEW
  updateTaskStatus,    // NEW
  updateSubtaskStatus, // NEW
  getAllTasks,         // NEW
  deleteTask          // NEW
};