import React from 'react';
import { UserMinus } from 'lucide-react';
import RoleBadge from './RoleBadge';

const MemberItem = ({ member, teamId, currentUserId, onTeamAction }) => {
  const handleRemoveMember = () => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      onTeamAction('removeMember', {
        teamId,
        memberId: member.userId._id
      });
    }
  };

  const handleRoleChange = (newRole) => {
    onTeamAction('changeRole', {
      teamId,
      memberId: member.userId._id,
      newRole
    });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
        <RoleBadge 
          role={member.role} 
          onChange={handleRoleChange}
          disabled={member.role === 'team_manager'}
        />
        
        {member.role !== 'team_manager' && (
          <button
            onClick={handleRemoveMember}
            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Remove Member"
          >
            <UserMinus className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MemberItem;