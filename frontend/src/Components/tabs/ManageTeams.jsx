import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Trash2, UserPlus, UserMinus, Settings, Crown, Edit3, Save, X, AlertCircle, CheckCircle 
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const ManageTeams = ({ user }) => {
  // Initialize with default values
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  
  const [createTeamForm, setCreateTeamForm] = useState({
    teamName: '',
    description: ''
  });
  
  const [addMemberForm, setAddMemberForm] = useState({
    memberId: '',
    role: 'developer'
  });

  useEffect(() => {
    if (user?._id) {
      fetchTeams();
      fetchAllUsers();
    } else {
      // If no user._id, set loading to false
      setLoading(false);
    }
  }, [user?._id]); // Use user._id as dependency

const fetchTeams = async () => {
  try {
    setLoading(true);
    const response = await axiosClient.get(`/team/organization/${user._id}`);
    
    // Handle potential undefined/null response
    const teamsData = response?.data || [];
    setTeams(teamsData);
    setError('');
    
    // Fetch details for each team
    const teamsWithMembers = await Promise.all(
      teamsData.map(async (team) => {
        try {
          const detailsResponse = await axiosClient.get(`/team/${team._id}`);
          return {
            ...team,
            members: detailsResponse?.data?.members || [],
            teamDetails: detailsResponse?.data?.team || {}
          };
        } catch (err) {
          console.error(`Error fetching details for team ${team._id}:`, err);
          return {
            ...team,
            members: [],
            teamDetails: {}
          };
        }
      })
    );
    
    setTeams(teamsWithMembers);
  } catch (err) {
    setError('Failed to fetch teams. Please try again.');
    console.error('Error fetching teams:', err);
    setTeams([]);
  } finally {
    setLoading(false);
  }
};

  
  const fetchAllUsers = async () => {
    try {
      if (!user || !user._id) return;
      const response = await axiosClient.get(`/organization/members/${user._id}`);
      setAllUsers(response.data.users || []);
      console.log(allUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setAllUsers([]); // Set empty array on error
    }
  };

const fetchTeamDetails = async (teamId) => {
  try {
    const response = await axiosClient.get(`/team/${teamId}`);
    const teamData = response?.data || {};
    
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team._id === teamId 
          ? { 
              ...team, 
              members: teamData.members || [], 
              teamDetails: teamData.team || {} 
            }
          : team
      )
    );
  } catch (err) {
    setError('Failed to fetch team details');
    console.error('Error fetching team details:', err);
  }
};
  /**
   * Create a new team
   */
  const handleCreateTeam = async () => {
    if (!createTeamForm.teamName.trim()) {
      setError('Team name is required');
      return;
    }
    try {
      const response = await axiosClient.post('/team/create', {
        teamName: createTeamForm.teamName,
        userId: user._id,
        organizationId:user.organizationId?._id,
        description: createTeamForm.description
      });
      setSuccess('Team created successfully!');
      setShowCreateModal(false);
      setCreateTeamForm({ teamName: '', description: '' });
      fetchTeams(); // Refresh teams list
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
      setTimeout(() => setError(''), 3000);
    }
  };

  /**
   * Add a member to a team
   */
  const handleAddMember = async () => {
    if (!addMemberForm.memberId) {
      setError('Please select a user to add');
      return;
    }
    try {
      await axiosClient.post('/team/add-member', {
        userId: user._id,
        memberId: addMemberForm.memberId,
        teamId: selectedTeam._id,
        role: addMemberForm.role
      });
      
      setSuccess('Member added successfully!');
      setShowAddMemberModal(false);
      setAddMemberForm({ memberId: '', role: 'developer' });
      fetchTeamDetails(selectedTeam._id); // Refresh team details
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
      setTimeout(() => setError(''), 3000);
    }
  };

  /**
   * Remove a member from a team
   * @param {string} teamId - ID of the team
   * @param {string} memberId - ID of the member to remove
   */
  const handleRemoveMember = async (teamId, memberId) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) return;
    
    try {
      await axiosClient.post('/team/remove-member', {
        userId: user._id,
        memberId: memberId,
        teamId: teamId
      });
      
      setSuccess('Member removed successfully!');
      fetchTeamDetails(teamId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
      setTimeout(() => setError(''), 3000);
    }
  };

  /**
   * Change a member's role in a team
   * @param {string} teamId - ID of the team
   * @param {string} memberId - ID of the member
   * @param {string} newRole - New role for the member
   */
  const handleChangeRole = async (teamId, memberId, newRole) => {
    try {
      await axiosClient.post('/team/change-member-role', {
        userId: user._id,
        memberId: memberId,
        teamId: teamId,
        newRole: newRole
      });
      
      setSuccess('Member role updated successfully!');
      fetchTeamDetails(teamId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
      setTimeout(() => setError(''), 3000);
    }
  };

  /**
   * Update team name
   * @param {string} teamId - ID of the team
   * @param {string} newName - New name for the team
   */
  const handleUpdateTeamName = async (teamId, newName) => {
    try {
      await axiosClient.patch(`/team/${teamId}/name`, {
        userId: user._id,
        newName: newName
      });
      
      setSuccess('Team name updated successfully!');
      setEditingTeam(null);
      fetchTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update team name');
      setTimeout(() => setError(''), 3000);
    }
  };

  /**
   * Update team description
   * @param {string} teamId - ID of the team
   * @param {string} newDescription - New description for the team
   */
  const handleUpdateTeamDescription = async (teamId, newDescription) => {
    try {
      await axiosClient.patch(`/team/${teamId}/description`, {
        userId: user._id,
        newDescription: newDescription
      });
      
      setSuccess('Team description updated successfully!');
      setEditingTeam(null);
      fetchTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update team description');
      setTimeout(() => setError(''), 3000);
    }
  };

  /**
   * Get role badge styling based on role type
   * @param {string} role - Role of the team member
   * @returns {string} CSS classes for role badge
   */
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'team_manager':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'project_manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'developer':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600">Manage teams and members in your organization</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create Team</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Team Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingTeam?.id === team._id && editingTeam?.field === 'name' ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editingTeam.value}
                        onChange={(e) => setEditingTeam({...editingTeam, value: e.target.value})}
                        className="text-lg font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateTeamName(team._id, editingTeam.value)}
                      />
                      <button
                        onClick={() => handleUpdateTeamName(team._id, editingTeam.value)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingTeam(null)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                      <button
                        onClick={() => setEditingTeam({ id: team._id, field: 'name', value: team.name })}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {editingTeam?.id === team._id && editingTeam?.field === 'description' ? (
                    <div className="mt-2">
                      <textarea
                        value={editingTeam.value}
                        onChange={(e) => setEditingTeam({...editingTeam, value: e.target.value})}
                        className="w-full text-sm text-gray-600 bg-transparent border border-blue-500 rounded p-2 focus:outline-none resize-none"
                        rows="2"
                      />
                      <div className="flex items-center space-x-2 mt-1">
                        <button
                          onClick={() => handleUpdateTeamDescription(team._id, editingTeam.value)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingTeam(null)}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-2 mt-1">
                      <p className="text-sm text-gray-600 flex-1">
                        {team.description || 'No description provided'}
                      </p>
                      <button
                        onClick={() => setEditingTeam({ 
                          id: team._id, 
                          field: 'description', 
                          value: team.description || '' 
                        })}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Team Actions */}
                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={() => {
                      setSelectedTeam(team);
                      fetchTeamDetails(team._id);
                      setShowAddMemberModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Add Member"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchTeamDetails(team._id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Team Members ({team.members?.length || 0})
              </h4>
              
              {team.members && team.members.length > 0 ? (
                <div className="space-y-3">
                  {team.members.map((member) => (
                    <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {member.userId?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.userId?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.userId?.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Role Badge */}
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(team._id, member.userId._id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border ${getRoleBadgeStyle(member.role)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="developer">Developer</option>
                          <option value="project_manager">Project Manager</option>
                          <option value="team_manager">Team Manager</option>
                        </select>
                        
                        {/* Remove Member Button */}
                        {member.role !== 'team_manager' && (
                          <button
                            onClick={() => handleRemoveMember(team._id, member.userId._id)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove Member"
                          >
                            <UserMinus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No members in this team yet
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {teams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first team</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Create Your First Team
          </button>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Team</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createTeamForm.teamName}
                    onChange={(e) => setCreateTeamForm({...createTeamForm, teamName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter team name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={createTeamForm.description}
                    onChange={(e) => setCreateTeamForm({...createTeamForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="Enter team description (optional)"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateTeamForm({ teamName: '', description: '' });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateTeam}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add Member to {selectedTeam.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select User *
                  </label>
                  <select
                    required
                    value={addMemberForm.memberId}
                    onChange={(e) => setAddMemberForm({...addMemberForm, memberId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a user...</option>
                    {allUsers.filter(u => u._id !== user._id).map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={addMemberForm.role}
                    onChange={(e) => setAddMemberForm({...addMemberForm, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="developer">Developer</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="team_manager">Team Manager</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMemberModal(false);
                      setAddMemberForm({ memberId: '', role: 'developer' });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeams;