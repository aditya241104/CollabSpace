import React, { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import TeamCard from './ManageTeamsComponents/TeamCard';
import CreateTeamModal from './ManageTeamsComponents/CreateTeamModal';
import AddMemberModal from './ManageTeamsComponents/AddMemberModal';
import Notification from './ManageTeamsComponents/Notification';

const ManageTeams = ({ user }) => {
  const [state, setState] = useState({
    teams: [],
    allUsers: [],
    loading: true,
    error: '',
    success: '',
    selectedTeam: null,
    editingTeam: null
  });

  const [modals, setModals] = useState({
    create: false,
    addMember: false
  });

  // Derived state
  const hasTeams = state.teams.length > 0;

  useEffect(() => {
    if (user?._id) {
      fetchInitialData();
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user?._id]);

  const fetchInitialData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await Promise.all([fetchTeams(), fetchAllUsers()]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axiosClient.get(`/team/organization/${user._id}`);
      const teamsData = response?.data || [];
      
      const teamsWithMembers = await Promise.all(
        teamsData.map(fetchTeamDetails)
      );
      
      setState(prev => ({
        ...prev,
        teams: teamsWithMembers,
        error: ''
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch teams. Please try again.',
        teams: []
      }));
      console.error('Error fetching teams:', err);
    }
  };

  const fetchTeamDetails = async (team) => {
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
  };

  const fetchAllUsers = async () => {
    try {
      if (!user?._id) return;
      const response = await axiosClient.get(`/organization/members/${user._id}`);
      setState(prev => ({
        ...prev,
        allUsers: response.data.users || []
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
      setState(prev => ({ ...prev, allUsers: [] }));
    }
  };

  const handleTeamAction = async (action, payload) => {
    try {
      let response;
      
      switch (action) {
        case 'create':
          response = await axiosClient.post('/team/create', {
            teamName: payload.name,
            userId: user._id,
            organizationId: user.organizationId?._id,
            description: payload.description
          });
          setState(prev => ({ ...prev, success: 'Team created successfully!' }));
          break;
          
        case 'addMember':
          response = await axiosClient.post('/team/add-member', {
            userId: user._id,
            memberId: payload.memberId,
            teamId: payload.teamId,
            role: payload.role
          });
          setState(prev => ({ ...prev, success: 'Member added successfully!' }));
          break;
          
        case 'removeMember':
          response = await axiosClient.post('/team/remove-member', {
            userId: user._id,
            memberId: payload.memberId,
            teamId: payload.teamId
          });
          setState(prev => ({ ...prev, success: 'Member removed successfully!' }));
          break;
          
        case 'changeRole':
          response = await axiosClient.post('/team/change-member-role', {
            userId: user._id,
            memberId: payload.memberId,
            teamId: payload.teamId,
            newRole: payload.newRole
          });
          setState(prev => ({ ...prev, success: 'Member role updated successfully!' }));
          break;
          
        case 'updateName':
          response = await axiosClient.patch(`/team/${payload.teamId}/name`, {
            userId: user._id,
            newName: payload.newName
          });
          setState(prev => ({ ...prev, success: 'Team name updated successfully!' }));
          break;
          
        case 'updateDescription':
          response = await axiosClient.patch(`/team/${payload.teamId}/description`, {
            userId: user._id,
            newDescription: payload.newDescription
          });
          setState(prev => ({ ...prev, success: 'Team description updated successfully!' }));
          break;
          
        default:
          throw new Error('Unknown action');
      }
      
      // Refresh data after successful action
      await fetchTeams();
      
      // Clear success message after delay
      setTimeout(() => {
        setState(prev => ({ ...prev, success: '' }));
      }, 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      setState(prev => ({ ...prev, error: errorMessage }));
      
      setTimeout(() => {
        setState(prev => ({ ...prev, error: '' }));
      }, 3000);
    }
  };

  const toggleModal = (modalName, isOpen, selectedTeam = null) => {
    setModals(prev => ({ ...prev, [modalName]: isOpen }));
    if (selectedTeam) {
      setState(prev => ({ ...prev, selectedTeam }));
    }
  };

  if (state.loading) {
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
            onClick={() => toggleModal('create', true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create Team</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <Notification message={state.success} type="success" />
      <Notification message={state.error} type="error" />

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {state.teams.map((team) => (
          <TeamCard
            key={team._id}
            team={team}
            currentUserId={user._id}
            onAddMember={() => toggleModal('addMember', true, team)}
            onRefresh={() => fetchTeamDetails(team)}
            onTeamAction={handleTeamAction}
            editingTeam={state.editingTeam}
            setEditingTeam={(editingTeam) => setState(prev => ({ ...prev, editingTeam }))}
          />
        ))}
      </div>

      {/* Empty State */}
      {!hasTeams && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first team</p>
          <button
            onClick={() => toggleModal('create', true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Create Your First Team
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={modals.create}
        onClose={() => toggleModal('create', false)}
        onSubmit={handleTeamAction}
      />
      
      <AddMemberModal
        isOpen={modals.addMember}
        onClose={() => toggleModal('addMember', false)}
        onSubmit={handleTeamAction}
        team={state.selectedTeam}
        users={state.allUsers.filter(u => u._id !== user._id)}
      />
    </div>
  );
};

export default ManageTeams;