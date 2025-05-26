import { jwtDecode } from "jwt-decode";
import axiosClient from '../utils/axiosClient';
import { useState, useEffect } from "react";
import { Users, FolderOpen, Settings, Plus, UserPlus, Calendar, CheckSquare, Building, Mail, User, ChevronRight, BarChart3, Clock, Target } from "lucide-react";

export default function Dashboard() {
  const token = localStorage.getItem("token");
  const decodedtoken = jwtDecode(token);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [team, setTeam] = useState([]);
  const [orgTeam, setOrgTeam] = useState([]);
  const [project, setProject] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [orgRequest, setOrgRequest] = useState('');

  // Fetch functions
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
    // You'll implement the submit function
    console.log('Organization request:', orgRequest);
    // Add your API call here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Not in organization view
  if (!user?.organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <Building className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-slate-800 mb-4">Welcome to Your Workspace</h1>
              <p className="text-xl text-slate-600">You're not currently part of an organization. Join one to get started!</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Your Profile</h2>
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{user?.name}</h3>
                    <p className="text-slate-600 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Request to Join Organization</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Organization Name or ID
                      </label>
                      <input
                        type="text"
                        value={orgRequest}
                        onChange={(e) => setOrgRequest(e.target.value)}
                        placeholder="Enter organization name or ID"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <button
                      onClick={handleOrgRequest}
                      disabled={!orgRequest.trim()}
                      className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Send Join Request</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Navigation tabs based on role
  const getNavigationTabs = () => {
    const baseTabs = [
      { id: 'overview', label: 'Overview', icon: BarChart3 },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'projects', label: 'Projects', icon: FolderOpen },
      { id: 'teams', label: 'Teams', icon: Users },
    ];

    if (user?.orgRole === 'admin') {
      baseTabs.push(
        { id: 'manage-teams', label: 'Manage Teams', icon: Settings },
        { id: 'manage-projects', label: 'Manage Projects', icon: Plus },
        { id: 'manage-members', label: 'Manage Members', icon: UserPlus }
      );
    } else if (user?.orgRole === 'project_manager') {
      baseTabs.push(
        { id: 'manage-projects', label: 'Manage Projects', icon: Plus }
      );
    }

    // Add team management for team managers
    const isTeamManager = team?.some(t => t.userRole === 'team_manager');
    if (isTeamManager) {
      baseTabs.push({ id: 'team-management', label: 'Team Management', icon: Users });
    }

    return baseTabs;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Projects</p>
                    <p className="text-2xl font-bold text-slate-900">{project?.length || 0}</p>
                  </div>
                  <FolderOpen className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Teams</p>
                    <p className="text-2xl font-bold text-slate-900">{team?.length || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Role</p>
                    <p className="text-lg font-semibold text-slate-900 capitalize">{user?.orgRole?.replace('_', ' ')}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Status</p>
                    <p className="text-lg font-semibold text-green-600">Active</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Projects</h3>
                <div className="space-y-3">
                  {project?.slice(0, 3).map((proj, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">{proj.project?.name}</p>
                        <p className="text-sm text-slate-600">{proj.userRoleInProject?.replace('_', ' ')}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  )) || <p className="text-slate-500 text-center py-4">No projects assigned</p>}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Teams</h3>
                <div className="space-y-3">
                  {team?.slice(0, 3).map((t, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">{t.teamName}</p>
                        <p className="text-sm text-slate-600">{t.userRole?.replace('_', ' ')} • {t.members?.length} members</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  )) || <p className="text-slate-500 text-center py-4">No teams joined</p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Profile Information</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">{user?.name}</h3>
                  <p className="text-slate-600">{user?.email}</p>
                  <p className="text-sm text-slate-500 capitalize">{user?.orgRole?.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
                    <p className="text-slate-900 font-medium">{organization?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Member Since</label>
                    <p className="text-slate-600">{new Date(user?.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Active</label>
                    <p className="text-slate-600">{new Date(user?.lastActive).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${user?.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                      <span className="text-slate-600">{user?.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-800">Projects</h2>
              {(user?.orgRole === 'admin' || user?.orgRole === 'project_manager') && (
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project?.map((proj, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{proj.project?.name}</h3>
                      <p className="text-slate-600 text-sm">{proj.project?.description}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {proj.userRoleInProject?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {proj.project?.timeline?.start ? new Date(proj.project.timeline.start).toLocaleDateString() : 'No start date'}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {proj.project?.timeline?.end ? new Date(proj.project.timeline.end).toLocaleDateString() : 'No end date'}
                    </div>
                  </div>
                </div>
              )) || <p className="text-slate-500 text-center py-8 col-span-2">No projects assigned</p>}
            </div>
          </div>
        );

      case 'teams':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-800">Teams</h2>
              {user?.orgRole === 'admin' && (
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Team</span>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {team?.map((t, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{t.teamName}</h3>
                      <p className="text-slate-600 text-sm">{t.description}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {t.userRole?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-500">
                      <Users className="w-4 h-4 mr-1" />
                      {t.members?.length} members
                    </div>
                    {t.userRole === 'team_manager' && (
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        Manage
                      </button>
                    )}
                  </div>
                </div>
              )) || <p className="text-slate-500 text-center py-8 col-span-2">No teams joined</p>}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Feature Coming Soon</h2>
            <p className="text-slate-600">This feature is currently under development.</p>
          </div>
        );
    }
  };

  const navigationTabs = getNavigationTabs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-800">{organization?.name}</h1>
                <p className="text-sm text-slate-600">{organization?.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.orgRole?.replace('_', ' ')}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}