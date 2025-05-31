import React from 'react';
import { Settings, UserPlus } from 'lucide-react';
import MemberItem from './MemberItem';
import EditableField from './EditableField';

const TeamCard = ({ 
  team, 
  currentUserId,
  onAddMember,
  onRefresh,
  onTeamAction,
  editingTeam,
  setEditingTeam
}) => {
  const isEditingName = editingTeam?.id === team._id && editingTeam?.field === 'name';
  const isEditingDescription = editingTeam?.id === team._id && editingTeam?.field === 'description';

  const handleUpdateField = (field, value) => {
    onTeamAction(`update${field.charAt(0).toUpperCase() + field.slice(1)}`, {
      teamId: team._id,
      [`new${field.charAt(0).toUpperCase() + field.slice(1)}`]: value
    });
    setEditingTeam(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Team Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <EditableField
              isEditing={isEditingName}
              value={team.name}
              displayElement={<h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>}
              onSave={(value) => handleUpdateField('name', value)}
              onCancel={() => setEditingTeam(null)}
              onEdit={() => setEditingTeam({ id: team._id, field: 'name', value: team.name })}
              inputProps={{
                className: "text-lg font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none",
                type: "text"
              }}
            />
            
            <EditableField
              isEditing={isEditingDescription}
              value={team.description}
              displayElement={
                <p className="text-sm text-gray-600 flex-1">
                  {team.description || 'No description provided'}
                </p>
              }
              onSave={(value) => handleUpdateField('description', value)}
              onCancel={() => setEditingTeam(null)}
              onEdit={() => setEditingTeam({ 
                id: team._id, 
                field: 'description', 
                value: team.description || '' 
              })}
              inputProps={{
                className: "w-full text-sm text-gray-600 bg-transparent border border-blue-500 rounded p-2 focus:outline-none resize-none",
                type: "textarea",
                rows: "2"
              }}
            />
          </div>
          
          {/* Team Actions */}
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={onAddMember}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Add Member"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              onClick={onRefresh}
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
              <MemberItem
                key={member._id}
                member={member}
                teamId={team._id}
                currentUserId={currentUserId}
                onTeamAction={onTeamAction}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No members in this team yet
          </p>
        )}
      </div>
    </div>
  );
};

export default TeamCard;