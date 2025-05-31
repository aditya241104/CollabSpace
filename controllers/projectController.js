import Project from "../models/Project.js";
import User from "../models/User.js";
import ProjectTeam from "../models/ProjectTeam.js";
import Team from "../models/Team.js";
import { assign } from "nodemailer/lib/shared/index.js";

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
const getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Find all teams where user is a member
    const teamIds = await Team.find({ members: userId }).distinct('_id');

    // 2. Get projects where these teams are assigned
    const teamAssignments = await ProjectTeam.find({ teamId: { $in: teamIds } })
      .populate('projectId')
      .populate('teamId');

    const projectFromTeams = teamAssignments.map(assignment => ({
      project: {
        _id: assignment.projectId._id,
        name: assignment.projectId.name,
        description: assignment.projectId.description,
        timeline: assignment.projectId.timeline,
      },
      team: {
        _id: assignment.teamId._id,
        name: assignment.teamId.name,
        // Populate members
        members: [],
      },
      userRoleInProject: assignment.role,
    }));

    // Populate team members
    for (const p of projectFromTeams) {
      const teamMembers = await User.find({ _id: { $in: p.team.members } }, '_id name email orgRole');
      p.team.members = teamMembers;
    }

    // 3. Find all projects where user is directly the project manager
    const directProjects = await Project.find({ projectManagerId: userId });

    // Remove duplicates (already included from team assignments)
    const existingProjectIds = new Set(projectFromTeams.map(p => p.project._id.toString()));

    const directlyManagedProjects = [];

    for (const dp of directProjects) {
      if (!existingProjectIds.has(dp._id.toString())) {
        directlyManagedProjects.push({
          project: {
            _id: dp._id,
            name: dp.name,
            description: dp.description,
            timeline: dp.timeline,
          },
          team: null, // no team yet
          userRoleInProject: 'project_manager',
        });
      }
    }

    // Combine all
    const allProjects = [...projectFromTeams, ...directlyManagedProjects];

    res.status(200).json({ projects: allProjects });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const updateProject = async (req, res) => {
  try {
    const { projectId, name, description, timeline, userId } = req.body;

    const user = await User.findById(userId);
    const project = await Project.findById(projectId);

    if (!user || !project) {
      return res.status(404).json({ message: "User or project not found" });
    }

    // Only project manager or admin can update
    if (!project.projectManagerId.equals(user._id) && user.orgRole !== "admin") {
      return res.status(403).json({ message: "Only project manager or admin can update project" });
    }

    // Update fields
    project.name = name || project.name;
    project.description = description || project.description;
    project.timeline = timeline || project.timeline;

    await project.save();

    res.status(200).json({ message: "Project updated", project });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { projectId, userId } = req.body;

    const user = await User.findById(userId);
    const project = await Project.findById(projectId);

    if (!user || !project) {
      return res.status(404).json({ message: "User or project not found" });
    }

    // Only admin or project manager can delete
    if (!project.projectManagerId.equals(user._id) && user.orgRole !== "admin") {
      return res.status(403).json({ message: "Only project manager or admin can delete project" });
    }

    // Delete all related assignments first
    await ProjectTeam.deleteMany({ projectId });

    // Then delete the project
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove team from project
const removeTeamFromProject = async (req, res) => {
  try {
    const { projectId, teamId, userId } = req.body;

    const user = await User.findById(userId);
    const project = await Project.findById(projectId);
    const team = await Team.findById(teamId);

    if (!user || !project || !team) {
      return res.status(404).json({ message: "User, project or team not found" });
    }

    // Only project manager can remove teams
    if (!project.projectManagerId.equals(user._id)) {
      return res.status(403).json({ message: "Only project manager can remove teams" });
    }

    await ProjectTeam.findOneAndDelete({ projectId, teamId });

    res.status(200).json({ message: "Team removed from project" });
  } catch (error) {
    console.error("Error removing team from project:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export {   
  createProject,
  addProjectManager,
  assignTeamToProject,
  getUserProjects,
  updateProject,
  deleteProject,
  removeTeamFromProject};
