import {
  Users, FolderOpen, BarChart3, User, ChevronRight,
  ClipboardList, Settings, Home, Briefcase
} from "lucide-react";
import { useState } from "react";

export function DashboardNav({ user, team, activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);

  // Core navigation - only essential items
  const coreNavigation = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'task', label: 'Tasks', icon: ClipboardList }
  ];

  // Management navigation - based on role
  const getManagementNavigation = () => {
    const items = [];
    const isAdmin = user?.orgRole === 'admin';
    const isProjectManager = user?.orgRole === 'project_manager';
    const isTeamManager = team?.some(t => t.userRole === 'team_manager');

    if (isAdmin || isProjectManager) {
      items.push({
        id: 'manage-projects',
        label: 'Project Management',
        icon: Briefcase
      });
      items.push({
        id: 'manage-invites',
        label: 'Invitations',
        icon: Users
      });
    }

    if (isAdmin || isTeamManager) {
      items.push({
        id: 'team-management',
        label: 'Team Management',
        icon: Users
      });
    }

    return items;
  };

  const managementItems = getManagementNavigation();

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-100 shadow-sm transition-all duration-300 flex flex-col
        ${collapsed ? 'w-16' : 'w-64'} sticky top-0`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight
            className={`h-4 w-4 text-gray-500 transform transition-transform duration-300 ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      <nav className="flex-1 flex flex-col p-3 overflow-y-auto">
        {/* Core Navigation */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
              Main
            </p>
          )}
          {coreNavigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all w-full
                ${activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm border-r-2 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-500'}
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-500'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Management Navigation */}
        {managementItems.length > 0 && (
          <div className="mt-6 space-y-1">
            {!collapsed && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                Management
              </p>
            )}
            {managementItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all w-full
                  ${activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm border-r-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-500'}
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-500'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Settings at bottom of nav */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all w-full
              ${activeTab === 'settings'
                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-500'}
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-indigo-600' : 'text-gray-500'}`} />
            {!collapsed && <span>Settings</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}
