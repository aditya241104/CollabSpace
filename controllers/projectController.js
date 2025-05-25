import Project from "../models/Project.js";
import User from "../models/User.js";
import ProjectTeam from "../models/ProjectTeam.js";
import Team from "../models/Team.js";

// Admin creates project (auto becomes project manager)
const createProject = async (req, res) => {
  try {
    const { name, description, timeline, userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.orgRole !== "admin") {
      return res.status(403).json({ message: "Only admins can create projects" });
    }

    const project = new Project({
      name,
      description,
      organizationId: user.organizationId,
      projectManagerId: user._id,
      timeline,
    });

    await project.save();

    res.status(201).json({ message: "Project created", project });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Project manager adds another project manager
const addProjectManager = async (req, res) => {
  try {
    const { projectId, addedById, newManagerId } = req.body;

    const addedBy = await User.findById(addedById);
    const newManager = await User.findById(newManagerId);
    const project = await Project.findById(projectId);

    if (!addedBy || !newManager || !project) {
      return res.status(404).json({ message: "User or project not found" });
    }

    // Only project manager can add new ones
    if (!project.projectManagerId.equals(addedBy._id)) {
      return res.status(403).json({ message: "Only current project manager can assign another" });
    }

    // Must be same org
    if (!addedBy.organizationId.equals(newManager.organizationId)) {
      return res.status(400).json({ message: "Both users must be in the same organization" });
    }

    // Assign the new project manager
    project.projectManagerId = newManager._id;
    await project.save();

    res.status(200).json({ message: "New project manager assigned", project });
  } catch (error) {
    console.error("Error adding project manager:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Project manager assigns a team to the project
const assignTeamToProject = async (req, res) => {
  try {
    const { projectId, teamId, userId } = req.body;

    const project = await Project.findById(projectId);
    const team = await Team.findById(teamId);
    const user = await User.findById(userId);

    if (!project || !team || !user) {
      return res.status(404).json({ message: "Project, team, or user not found" });
    }

    if (!project.projectManagerId.equals(user._id)) {
      return res.status(403).json({ message: "Only project manager can assign teams" });
    }

    if (!project.organizationId.equals(team.organizationId)) {
      return res.status(400).json({ message: "Team must belong to the same organization" });
    }

    const existing = await ProjectTeam.findOne({ projectId, teamId });
    if (existing) {
      return res.status(409).json({ message: "Team already assigned to project" });
    }

    const assignment = new ProjectTeam({
      projectId,
      teamId,
      role: "project_manager" // team will be treated with this role for the project
    });

    await assignment.save();

    res.status(201).json({ message: "Team assigned to project", assignment });
  } catch (error) {
    console.error("Error assigning team:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { createProject, addProjectManager, assignTeamToProject };
