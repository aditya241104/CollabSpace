import Organization from "../models/Organization.js"
import User from "../models/User.js";
import JoinRequest from "../models/JoinRequests.js"
import {transporter} from "../config/nodemailer.js";
//create organization
const createOrganization = async (req, res) => {
  try {
    const { orgName, orgDescription, orgLogo, adminID } = req.body;

    const existingOrg = await Organization.findOne({ name: orgName });
    if (existingOrg) {
      return res.status(400).json({ message: "Organization already exists with the same name" });
    }

    const newOrg = new Organization({
      name: orgName,
      description: orgDescription,
      logo: orgLogo,
      admins: [adminID], 
    });

    await newOrg.save();
    await User.findByIdAndUpdate(adminID,{organizationId: newOrg._id});
    res.status(201).json({ message: "Organization created successfully", organization: newOrg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
//send mail to any user to join organization
const inviteUserToOrganization = async (req, res) => {
  const { email, invitedBy } = req.body;

  try {
    // Step 1: Verify inviter
    const inviter = await User.findById(invitedBy);

    if (!inviter) {
      return res.status(404).json({ message: "Inviting user not found" });
    }

    if (!inviter.organizationId) {
      return res.status(400).json({ message: "User is not part of any organization" });
    }

    if (inviter.orgRole !== "admin") {
      return res.status(403).json({ message: "Only admins can invite users" });
    }

    // Step 2: Use inviter's organizationId
    const organizationId = inviter.organizationId;

    const inviteLink = `http://localhost:5173/join?orgId=${organizationId}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: '"MyApp" <no-reply@myapp.com>',
      to: email,
      subject: "You are invited to join an organization",
      html: `<p>You’ve been invited to join an organization.</p>
             <p><a href="${inviteLink}">Click here to join</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Invite sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send invite" });
  }
};
//send join request to the organization
const sendJoinRequest = async (req, res) => {
  const { userId, organizationId } = req.body;
  const user=await User.findById(userId);
  if(user.organizationId){
          return res.status(400).json({ message: "User already belongs to an organization" });

  }
  const existingRequest = await JoinRequest.findOne({ userId, organizationId, status: "pending" });
  if (existingRequest) {
    return res.status(400).json({ message: "You already sent a join request" });
  }

  const joinRequest = new JoinRequest({ userId, organizationId });
  await joinRequest.save();

  // Optionally email all org admins here

  res.status(200).json({ message: "Join request sent to organization admin" });
};
// Get all join requests (for admin dashboard)
const getJoinRequests = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await User.findById(adminId);
    if (!admin || admin.orgRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const requests = await JoinRequest.find({ organizationId: admin.organizationId, status: "pending" }).populate("userId", "name email");

    return res.status(200).json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Accept join request
const acceptJoinRequest = async (req, res) => {
  try {
    const { requestId, adminId } = req.body;

    const admin = await User.findById(adminId);
    if (!admin || admin.orgRole !== "admin") {
      return res.status(403).json({ message: "Only admins can accept requests" });
    }

    const request = await JoinRequest.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Join request not found or already handled" });
    }

    // Add user to the organization
    await User.findByIdAndUpdate(request.userId, {
      organizationId: admin.organizationId,
      orgRole: "member"
    });

    // Update request status
    request.status = "accepted";
    await request.save();

    res.status(200).json({ message: "Request accepted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject join request
const rejectJoinRequest = async (req, res) => {
  try {
    const { requestId, adminId } = req.body;

    const admin = await User.findById(adminId);
    if (!admin || admin.orgRole !== "admin") {
      return res.status(403).json({ message: "Only admins can reject requests" });
    }

    const request = await JoinRequest.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Join request not found or already handled" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Request rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all members in an organization
const getOrganizationMembers = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await User.findById(adminId);
    if (!admin || admin.orgRole !== "admin") {
      return res.status(403).json({ message: "Only admins can view members" });
    }

    const users = await User.find({ organizationId: admin.organizationId }).select("-password");

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove a user from the organization
const removeUserFromOrganization = async (req, res) => {
  try {
    const { adminId, userId } = req.body;

    const admin = await User.findById(adminId);
    const user = await User.findById(userId);

    if (!admin || admin.orgRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!user || !user.organizationId?.equals(admin.organizationId)) {
      return res.status(400).json({ message: "User not found in the same organization" });
    }

    // Remove user from org
    user.organizationId = null;
    user.orgRole = "user";
    await user.save();

    res.status(200).json({ message: "User removed from organization" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update organization info
const updateOrganization = async (req, res) => {
  try {
    const { adminId, name, description, logo } = req.body;

    const admin = await User.findById(adminId);
    if (!admin || admin.orgRole !== "admin") {
      return res.status(403).json({ message: "Only admins can update organization details" });
    }

    const updatedOrg = await Organization.findByIdAndUpdate(
      admin.organizationId,
      { name, description, logo },
      { new: true }
    );

    res.status(200).json({ message: "Organization updated", organization: updatedOrg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  createOrganization,
  inviteUserToOrganization,
  sendJoinRequest,
  getJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  getOrganizationMembers,
  removeUserFromOrganization,
  updateOrganization,
};