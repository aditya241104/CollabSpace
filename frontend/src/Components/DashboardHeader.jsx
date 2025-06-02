import { Building, User, Bell, Settings, Search, Plus, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";

export function DashboardHeader({ user, organization, activeTab, setActiveTab, onMobileNavToggle }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const quickActions = [
    { id: 'invite-user', label: 'Invite User', icon: Plus, adminOnly: true },
    { id: 'manage-projects', label: 'New Project', icon: Plus, managerOnly: true }
  ];

  const isAdmin = user?.orgRole === 'admin';
  const isProjectManager = user?.orgRole === 'project_manager';

  const availableActions = quickActions.filter(action => {
    if (action.adminOnly && !isAdmin) return false;
    if (action.managerOnly && !(isAdmin || isProjectManager)) return false;
    return true;
  });

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Organization Info and Mobile Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={onMobileNavToggle}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate max-w-[180px]">
                  {organization?.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 truncate max-w-[180px]">
                  {organization?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Search Bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects, teams, tasks..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Right: Actions & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Quick Actions - hidden on mobile */}
            {availableActions.length > 0 && (
              <div className="hidden sm:flex items-center space-x-2">
                {availableActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setActiveTab(action.id)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    title={action.label}
                  >
                    <action.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{action.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1 sm:space-x-3 p-1 sm:p-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs sm:text-sm font-medium text-slate-800 truncate max-w-[120px]">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user?.orgRole?.replace('_', ' ')}
                  </p>
                </div>
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <hr className="my-1" />
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}