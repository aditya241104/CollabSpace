import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, Users, 
  ChevronRight, Settings, MoreVertical, 
  User, Clock, CheckCircle, AlertCircle, X 
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

// Project Modal Components
import CreateProjectModal from './ManageProjectComponents/CreateProject'
import EditProjectModal from './ManageProjectComponents/EditProject';
import AssignTeamModal from './ManageProjectComponents/AssignTeam';
import DeleteConfirmationModal from './ManageProjectComponents/DeleteConfirmation';

// Project Card Component
const ProjectCard = ({ 
  project, 
  onAssignTeam, 
  onProjectUpdated, 
  onProjectDeleted, 
  user 
}) => {
  const { project: projectData, team, userRoleInProject } = project;
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = () => {
    if (!projectData.timeline?.end) return 'text-gray-600 bg-gray-100';
    
    const today = new Date();
    const endDate = new Date(projectData.timeline.end);
    
    if (endDate < today) return 'text-red-600 bg-red-100';
    if (endDate - today < 7 * 24 * 60 * 60 * 1000) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axiosClient.delete('/project/delete', {
        data: {
          projectId: projectData._id,
          userId: user._id
        }
      });
      onProjectDeleted();
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRemoveTeam = async () => {
    setLoading(true);
    try {
      await axiosClient.delete('/project/remove-team', {
        data: {
          projectId: projectData._id,
          teamId: team?._id,
          userId: user._id
        }
      });
      onProjectUpdated();
    } catch (error) {
      console.error('Error removing team:', error);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
      {/* Project Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
            {projectData.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {projectData.description || 'No description provided'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {userRoleInProject}
          </span>
          
          {(userRoleInProject === 'project_manager' || user.orgRole === 'admin') && (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                className="text-gray-400 hover:text-gray-600"
                aria-label="Project options"
              >
                <MoreVertical size={16} />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit Project
                    </button>
                    {team && (
                      <button
                        onClick={handleRemoveTeam}
                        disabled={loading}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {loading ? 'Removing...' : 'Remove Team'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project Timeline */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar size={16} className="mr-1" />
            <span>
              {formatDate(projectData.timeline?.start)} - {formatDate(projectData.timeline?.end)}
            </span>
          </div>
        </div>
      </div>

      {/* Team Assignment */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {team ? (
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">{team.name}</span>
              <span className="text-xs text-gray-400">({team.members?.length || 0} members)</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">No team assigned</span>
          )}
        </div>
        
        {userRoleInProject === 'project_manager' && !team && (
          <button
            onClick={() => onAssignTeam(projectData._id)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Assign Team
          </button>
        )}
      </div>

      {/* Team Members Preview */}
      {team?.members && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Team Members</span>
            <div className="flex -space-x-2">
              {team.members.slice(0, 3).map((member) => (
                <div
                  key={member._id}
                  className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {team.members.length > 3 && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                  +{team.members.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={project}
        onProjectUpdated={onProjectUpdated}
        userId={user._id}
      />
      
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={loading}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
      />
    </div>
  );
};

// Main Project Management Component
const ProjectManagement = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    if (user?._id) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get(`/project/${user._id}`);
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeam = (projectId) => {
    setSelectedProjectId(projectId);
    setShowAssignModal(true);
  };

  const handleProjectUpdated = () => {
    fetchProjects();
  };

  const handleProjectDeleted = () => {
    fetchProjects();
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || project.userRoleInProject === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-2">Manage and track your projects</p>
            </div>
            {user?.orgRole === 'admin' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span>Create Project</span>
              </button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="project_manager">Project Manager</option>
              <option value="developer">Developer</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {projects.length === 0 ? "You haven't been assigned to any projects yet." : "No projects match your search criteria."}
            </p>
            {user?.orgRole === 'admin' && projects.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.project._id}
                project={project}
                onAssignTeam={handleAssignTeam}
                onProjectUpdated={handleProjectUpdated}
                onProjectDeleted={handleProjectDeleted}
                user={user}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            icon={<CheckCircle className="w-6 h-6 text-blue-600" />}
            title="Total Projects"
            value={projects.length}
            bgColor="bg-blue-100"
          />
          
          <StatCard 
            icon={<User className="w-6 h-6 text-green-600" />}
            title="As Manager"
            value={projects.filter(p => p.userRoleInProject === 'project_manager').length}
            bgColor="bg-green-100"
          />
          
          <StatCard 
            icon={<Users className="w-6 h-6 text-yellow-600" />}
            title="With Teams"
            value={projects.filter(p => p.team).length}
            bgColor="bg-yellow-100"
          />
          
          <StatCard 
            icon={<AlertCircle className="w-6 h-6 text-red-600" />}
            title="Needs Attention"
            value={projects.filter(p => !p.team).length}
            bgColor="bg-red-100"
          />
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={fetchProjects}
        userId={user?._id}
      />
      
      <AssignTeamModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        projectId={selectedProjectId}
        userId={user?._id}
        onTeamAssigned={fetchProjects}
      />
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, title, value, bgColor }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center">
      <div className={`p-2 ${bgColor} rounded-lg`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default ProjectManagement;