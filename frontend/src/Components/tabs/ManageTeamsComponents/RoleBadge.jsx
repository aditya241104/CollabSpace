import React from 'react';

const roleStyles = {
  team_manager: 'bg-purple-100 text-purple-800 border-purple-200',
  project_manager: 'bg-blue-100 text-blue-800 border-blue-200',
  developer: 'bg-green-100 text-green-800 border-green-200',
  default: 'bg-gray-100 text-gray-800 border-gray-200'
};

const roleLabels = {
  team_manager: 'Team Manager',
  project_manager: 'Project Manager',
  developer: 'Developer'
};

const RoleBadge = ({ role, onChange, disabled = false }) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={disabled}
      className={`text-xs px-2 py-1 rounded-full border ${roleStyles[role] || roleStyles.default} focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      {Object.entries(roleLabels).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
};

export default RoleBadge;