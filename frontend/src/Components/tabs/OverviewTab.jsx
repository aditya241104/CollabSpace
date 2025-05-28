import { FolderOpen, Users, Target, ChevronRight } from "lucide-react";

/**
 * Overview Tab Component
 * 
 * Displays dashboard overview with stats and recent items.
 * 
 * Props:
 * - user: Current user object
 * - team: Array of user's teams
 * - project: Array of user's projects
 */
export default function OverviewTab({ user, team, project }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Projects</p>
              <p className="text-2xl font-bold text-slate-900">{project?.length || 0}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Teams</p>
              <p className="text-2xl font-bold text-slate-900">{team?.length || 0}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Role</p>
              <p className="text-lg font-semibold text-slate-900 capitalize">{user?.orgRole?.replace('_', ' ')}</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Status</p>
              <p className="text-lg font-semibold text-green-600">Active</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Projects</h3>
          <div className="space-y-3">
            {project?.slice(0, 3).map((proj, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{proj.project?.name}</p>
                  <p className="text-sm text-slate-600">{proj.userRoleInProject?.replace('_', ' ')}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            )) || <p className="text-slate-500 text-center py-4">No projects assigned</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Teams</h3>
          <div className="space-y-3">
            {team?.slice(0, 3).map((t, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{t.teamName}</p>
                  <p className="text-sm text-slate-600">{t.userRole?.replace('_', ' ')} • {t.members?.length} members</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            )) || <p className="text-slate-500 text-center py-4">No teams joined</p>}
          </div>
        </div>
      </div>
    </div>
  );
}