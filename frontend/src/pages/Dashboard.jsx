import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import axiosClient from '../utils/axiosClient';
import { DashboardHeader } from '../Components/DashboardHeader';
import { DashboardNav } from '../Components/DashboardNav';
import DashboardLoading from '../Components/DashboardLoading';
import NoOrganizationView from '../Components/NoOrganizationView';
import DashboardContent from '../Components/DashboardContent';
import MobileNavToggle from '../Components/MobileNavToggle';

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader 
        user={user} 
        organization={organization}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onMobileNavToggle={() => setMobileNavOpen(!mobileNavOpen)}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Nav Toggle Button */}
        <MobileNavToggle 
          isOpen={mobileNavOpen}
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        />

        {/* Navigation Sidebar */}
        <div className={`
          fixed lg:static z-40 w-64 h-full transform transition-transform duration-300 ease-in-out
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}>
          <DashboardNav 
            user={user} 
            team={team}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onNavigate={() => setMobileNavOpen(false)}
          />
        </div>

        {/* Overlay for mobile */}
        {mobileNavOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full">
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