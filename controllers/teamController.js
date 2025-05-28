import Team from "../models/Team.js";
import TeamMembership from "../models/TeamMembership.js";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
const createTeam = async(req,res)=>{
    try{
const {teamName,userId,description}=req.body;
const user= await User.findById(userId);
console.log(user);
if (!user.organizationId) {
  return res.status(400).json({ message: "User is not part of any organization" });
}
if(!user){
    return res.status(404).json({message:"User Not Found"});
}
if (user.orgRole !== 'admin' && user.orgRole !== 'project_manager')
{
    return res.status(403).json({message:"Acess Denied"});
}
const newTeam=new Team({
    name:teamName,
    organizationId:user.organizationId,
    description:description,
    createdBy:user._id
});
await newTeam.save();
    const membership = new TeamMembership({
      userId: user._id,
      teamId: newTeam._id,
      role: "team_manager"
    });
    await membership.save();
return res.status(200).json({message:"Team Created"});
    }
    catch(error){
        console.log(error);
        return res.status(500).json({message:"Server error"});
    }
}
const addMember = async (req, res) => {
  try {
    const { userId, memberId, teamId, role } = req.body;

    const roles = ["team_manager", "project_manager", "developer"];

    // Validate role
    if (!roles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Fetch user, member, and team
    const user = await User.findById(userId);
    const member = await User.findById(memberId);
    const team = await Team.findById(teamId);

    if (!user || !member || !team) {
      return res.status(404).json({ message: "User, member, or team not found" });
    }

    // Check if both users belong to the same organization
    if (!user.organizationId.equals(member.organizationId)) {
      return res.status(400).json({ message: "User and member must be in the same organization" });
    }

    // Check if user is team manager
    const userMembership = await TeamMembership.findOne({ userId: user._id, teamId });
    if (!userMembership || userMembership.role !== "team_manager") {
      return res.status(403).json({ message: "Access denied: Only team managers can add members" });
    }

    // Check if member is already in the team
    const existing = await TeamMembership.findOne({ userId: member._id, teamId });
    if (existing) {
      return res.status(409).json({ message: "Member is already part of the team" });
    }

    // Add member
    const membership = new TeamMembership({
      userId: member._id,
      teamId,
      role,
    });
    await membership.save();

    return res.status(201).json({ message: "Member added successfully" });
  } catch (error) {
    console.error("Error adding member:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
const getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Get all members with roles
    const members = await TeamMembership.find({ teamId })
      .populate("userId", "name email avatar orgRole")
      .exec();

    return res.status(200).json({ team, members });
  } catch (error) {
    console.error("Error fetching team details:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
const removeMember = async (req, res) => {
  try {
    const { userId, memberId, teamId } = req.body;

    const userMembership = await TeamMembership.findOne({ userId, teamId });
    if (!userMembership || userMembership.role !== "team_manager") {
      return res.status(403).json({ message: "Access denied: Only team managers can remove members" });
    }

    // Prevent removing team_manager themselves accidentally (optional)
    if (memberId === userId) {
      return res.status(400).json({ message: "Team manager cannot remove themselves" });
    }

    const membership = await TeamMembership.findOne({ userId: memberId, teamId });
    if (!membership) {
      return res.status(404).json({ message: "Member not found in the team" });
    }

    await membership.deleteOne();
    return res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
const changeMemberRole = async (req, res) => {
  try {
    const { userId, memberId, teamId, newRole } = req.body;

    const validRoles = ["team_manager", "project_manager", "developer"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const userMembership = await TeamMembership.findOne({ userId, teamId });
    if (!userMembership || userMembership.role !== "team_manager") {
      return res.status(403).json({ message: "Access denied: Only team managers can change roles" });
    }

    const memberMembership = await TeamMembership.findOne({ userId: memberId, teamId });
    if (!memberMembership) {
      return res.status(404).json({ message: "Member not found in the team" });
    }

    memberMembership.role = newRole;
    await memberMembership.save();

    return res.status(200).json({ message: "Member role updated successfully" });
  } catch (error) {
    console.error("Error changing member role:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
const listTeamsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Get all teams the user is part of
    const userMemberships = await TeamMembership.find({ userId }).populate("teamId");

    const response = [];

    for (const membership of userMemberships) {
      const team = membership.teamId;
      const userRole = membership.role;

      // Step 2: Get all members of this team
      const members = await TeamMembership.find({ teamId: team._id })
        .populate("userId", "name email orgRole avatar")
        .exec();

      const memberList = members.map(m => ({
        _id: m.userId._id,
        name: m.userId.name,
        email: m.userId.email,
        orgRole: m.userId.orgRole,
        avatar: m.userId.avatar,
        role: m.role,
      }));

      response.push({
        teamId: team._id,
        teamName: team.name,
        description: team.description,
        userRole, // current user's role in this team
        members: memberList,
      });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching teams with members:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
const updateTeamName = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, newName } = req.body;

    if (!newName || newName.trim() === "") {
      return res.status(400).json({ message: "New name is required" });
    }

    const userMembership = await TeamMembership.findOne({ userId, teamId });
    if (!userMembership || userMembership.role !== "team_manager") {
      return res.status(403).json({ message: "Access denied: Only team managers can update team name" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.name = newName;
    await team.save();

    return res.status(200).json({ message: "Team name updated successfully" });
  } catch (error) {
    console.error("Error updating team name:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update team description (only team_manager can update)
const updateTeamDescription = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, newDescription } = req.body;

    const userMembership = await TeamMembership.findOne({ userId, teamId });
    if (!userMembership || userMembership.role !== "team_manager") {
      return res.status(403).json({ message: "Access denied: Only team managers can update description" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.description = newDescription || "";
    await team.save();

    return res.status(200).json({ message: "Team description updated successfully" });
  } catch (error) {
    console.error("Error updating description:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
const listTeamsInOrg = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user || !user.organizationId) {
      return res.status(404).json({ message: "User not found or not in an organization" });
    }

    const teams = await Team.find({ organizationId: user.organizationId });

    res.status(200).json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export { createTeam, addMember, getTeamDetails, removeMember, changeMemberRole, listTeamsForUser,updateTeamName,updateTeamDescription,listTeamsInOrg  };
