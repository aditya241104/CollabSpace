import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../../utils/axiosClient';

const AssignTeam = ({ isOpen, onClose, projectId, userId, onTeamAssigned }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen, userId]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/team/organization/${userId}`);
      setTeams(response.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTeam) return;
    
    setLoading(true);
    setError('');
    
    try {
      await axiosClient.post('/project/assign-team', {
        projectId,
        teamId: selectedTeam,
        userId
      });
      onTeamAssigned();
      onClose();
      setSelectedTeam('');
    } catch (err) {
      console.error('Error assigning team:', err);
      setError(err.response?.data?.message || 'Failed to assign team');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assign Team</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Team
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || teams.length === 0}
          >
            <option value="">{teams.length === 0 ? 'No teams available' : 'Choose a team'}</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedTeam || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Assign Team'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTeam;