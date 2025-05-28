import { 
  Users, FolderOpen, Settings, Plus, 
  UserPlus, BarChart3, User, ChevronRight,
  ClipboardList
} from "lucide-react";

/**
 * Dashboard Navigation Component
 * 
 * Handles the navigation tabs for the dashboard based on user role.
 * 
 * Props:
 * - user: Current user object
 * - team: Array of user's teams
 * - activeTab: Currently active tab
 * - setActiveTab: Function to change active tab
 */
export default function DashboardNav({ user, team, activeTab, setActiveTab }) {
  // Get navigation tabs based on user role
  const getNavigationTabs = () => {
    const baseTabs = [
      { id: 'overview', label: 'Overview', icon: BarChart3 },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'projects', label: 'Projects', icon: FolderOpen },
      { id: 'teams', label: 'Teams', icon: Users },
      {id:'task',label:'Tasks',icon:ClipboardList}
    ];

    // Add admin-specific tabs
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

  const navigationTabs = getNavigationTabs();

  return (
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
  );
}