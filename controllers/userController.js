import User from "../models/User.js";
import Organization from "../models/Organization.js";
import bcrypt from 'bcrypt';
//accept the invite link
const handleInviteLink = async (req, res) => {
  const { email, organizationId } = req.body;
  const organization = await Organization.findById(organizationId);
    if (!organization) {
    return res.status(404).json({ message: "Organization not found" });
    }
  const user = await User.findOne({ email });

  if (user) {
    if (user.organizationId) {
      return res.status(400).json({ message: "User already belongs to an organization" });
    }

    // Allow user to join this org
    user.organizationId = organizationId;
    await user.save();

    return res.status(200).json({ message: "User successfully joined the organization" });
  } else {
    return res.status(404).json({
      message: "User does not exist. Please sign up to join the organization",
    });
  }
};
const updatePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const updateOrgRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    const validRoles = ["admin", "project_manager", "developer", "hr", "viewer"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.orgRole = newRole;
    await user.save();

    res.status(200).json({ message: "Role updated successfully" });
  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// 🔍 Get user details by ID
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("organizationId", "name description logo");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { passwordHash, ...userInfo } = user._doc; // Exclude password hash from response

    return res.status(200).json(userInfo);
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
export default updatePassword;
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      name: { $regex: query, $options: 'i' },
      organizationId: req.user.organizationId,
      _id: { $ne: req.user._id }
    }).select('name email avatar');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users' });
  }
};
const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: userId } }
    })
      .populate('users', 'name avatar email isOnline')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export {handleInviteLink,updatePassword,updateOrgRole,getUserDetails,searchUsers,getUserChats};