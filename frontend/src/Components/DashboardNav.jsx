import {
  Users, FolderOpen, Settings, Plus,
  UserPlus, BarChart3, User, ChevronRight,
  ClipboardList,MailPlus
} from "lucide-react";
import { useState } from "react";

export default function DashboardNav({ user, team, activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);

  // Generate navigation tabs based on role
const getNavigationTabs = () => {
  const baseTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'task', label: 'Tasks', icon: ClipboardList }
  ];

  const isAdmin = user?.orgRole === 'admin';
  const isProjectManager = user?.orgRole === 'project_manager';
  const isTeamManager = team?.some(t => t.userRole === 'team_manager');
  if(isAdmin){
    baseTabs.push({
      id:"invite-user",
      label:'invite User',
      icon:UserPlus
    });
  }
  // Always add "Manage Projects" if user is admin or project_manager
  if (isAdmin || isProjectManager) {
    baseTabs.push({
      id: 'manage-projects',
      label: 'Manage Projects',
      icon: Plus
    });
    baseTabs.push({
      id:'manage-invites',
      label:"Invites",
      icon:MailPlus
    })
  }

  // Add a single "Team Management" tab if the user has any team management role
  if (isAdmin || isTeamManager) {
    baseTabs.push({
      id: 'team-management',
      label: 'Team Management',
      icon: Users
    });
  }

  return baseTabs;
};


  const navigationTabs = getNavigationTabs();

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-100 shadow-sm transition-all duration-300 flex flex-col
        ${collapsed ? 'w-20' : 'w-64'} sticky top-0`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight
            className={`h-5 w-5 text-gray-500 transform transition-transform duration-300 ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      <nav className="flex-1 flex flex-col space-y-1 p-2 overflow-y-auto">
        {navigationTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all 
              ${activeTab === tab.id
                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-500'}
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500'}`} />
            {!collapsed && <span className="truncate">{tab.label}</span>}
          </button>
        ))}
      </nav>

      {/* User profile mini-card at bottom */}
      <div className={`p-3 border-t border-gray-100 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}