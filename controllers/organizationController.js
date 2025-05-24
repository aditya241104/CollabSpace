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
export {createOrganization,inviteUserToOrganization,sendJoinRequest};