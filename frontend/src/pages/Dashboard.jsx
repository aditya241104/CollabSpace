import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import axiosClient from '../utils/axiosClient';
import DashboardHeader from '../Components/DashboardHeader'
import DashboardNav from '../Components/DashboardNav';
import DashboardLoading from '../Components/DashboardLoading';
import NoOrganizationView from '../Components/NoOrganizationView';
import DashboardContent from '../Components/DashboardContent';

export default function Dashboard() {
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

  const fetchUserDetails = async () => {
    try {
      const response = await axiosClient.get(`/user/${decodedtoken.id}`);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchOrganizationDetails = async (organizationId) => {
    try {
      const response = await axiosClient.get(`/organization/${organizationId}`);
      setOrganization(response.data);
    } catch (error) {
      console.error('Error fetching organization details:', error);
    }
  };

  const fetchTeamDetails = async (userId) => {
    try {
      const response = await axiosClient.get(`/team/user/${userId}`);
      setTeam(response.data);
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
  };

  const fetchOrgTeam = async (userId) => {
    try {
      const response = await axiosClient.get(`/team/organization/${userId}`);
      setOrgTeam(response.data);
    } catch (error) {
      console.error('Error fetching org teams:', error);
    }
  };

  const fetchProjects = async (userId) => {
    try {
      const response = await axiosClient.get(`/project/${userId}`);
      setProject(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

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

  const handleOrgRequest = () => {
    console.log('Organization request:', orgRequest);
  };

  if (loading) {
    return <DashboardLoading />;
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} organization={organization} />
      
      <div className="flex">
        <DashboardNav 
          user={user} 
          team={team}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 min-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <DashboardContent 
              activeTab={activeTab}
              user={user}
              organization={organization}
              team={team}
              project={project}
            />
          </div>
        </main>
      </div>
    </div>
  );
}