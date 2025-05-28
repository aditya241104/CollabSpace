import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import axiosClient from '../utils/axiosClient';
import DashboardHeader from '../Components/DashboardHeader'
import DashboardNav from '../Components/DashboardNav';
import DashboardLoading from '../Components/DashboardLoading';
import NoOrganizationView from '../Components/NoOrganizationView';
import DashboardContent from '../Components/DashboardContent';

/**
 * Main Dashboard Component
 * 
 * This component serves as the entry point for the dashboard experience.
 * It handles:
 * - Authentication and user data loading
 * - Organization verification
 * - State management for the entire dashboard
 * - Routing between different dashboard views
 */
export default function Dashboard() {
  // Get token from localStorage and decode it
  const token = localStorage.getItem("token");
  const decodedtoken = jwtDecode(token);
  
  // State management
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [team, setTeam] = useState([]);
  const [orgTeam, setOrgTeam] = useState([]);
  const [project, setProject] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [orgRequest, setOrgRequest] = useState('');

  // Fetch user details from API
  const fetchUserDetails = async () => {
    try {
      const response = await axiosClient.get(`/user/${decodedtoken.id}`);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Fetch organization details from API
  const fetchOrganizationDetails = async (organizationId) => {
    try {
      const response = await axiosClient.get(`/organization/${organizationId}`);
      setOrganization(response.data);
    } catch (error) {
      console.error('Error fetching organization details:', error);
    }
  };

  // Fetch team details for the user from API
  const fetchTeamDetails = async (userId) => {
    try {
      const response = await axiosClient.get(`/team/user/${userId}`);
      setTeam(response.data);
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
  };

  // Fetch all teams in the organization from API
  const fetchOrgTeam = async (userId) => {
    try {
      const response = await axiosClient.get(`/team/organization/${userId}`);
      setOrgTeam(response.data);
    } catch (error) {
      console.error('Error fetching org teams:', error);
    }
  };

  // Fetch projects for the user from API
  const fetchProjects = async (userId) => {
    try {
      const response = await axiosClient.get(`/project/${userId}`);
      setProject(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Initialize all data when component mounts
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const userData = await fetchUserDetails();
      
      if (userData && userData.organizationId) {
        await Promise.all([
          fetchOrganizationDetails(userData.organizationId._id),
          fetchTeamDetails(userData._id),
          fetchOrgTeam(userData._id),
          fetchProjects(userData._id)
        ]);
      }
      setLoading(false);
    };

    initializeData();
  }, []);

  // Handle organization join request
  const handleOrgRequest = () => {
    console.log('Organization request:', orgRequest);
    // API call to be implemented here
  };

  // Show loading state while data is being fetched
  if (loading) {
    return <DashboardLoading />;
  }

  // Show no organization view if user isn't part of an org
  if (!user?.organizationId) {
    return (
      <NoOrganizationView 
        user={user} 
        orgRequest={orgRequest}
        setOrgRequest={setOrgRequest}
        handleOrgRequest={handleOrgRequest}
      />
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardHeader user={user} organization={organization} />
      <DashboardNav 
        user={user} 
        team={team}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <DashboardContent 
        activeTab={activeTab}
        user={user}
        organization={organization}
        team={team}
        project={project}
      />
    </div>
  );
}