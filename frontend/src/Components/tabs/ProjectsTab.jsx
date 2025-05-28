import { FolderOpen, Plus, Calendar, Clock } from "lucide-react";

/**
 * Projects Tab Component
 * 
 * Displays user's projects and management options for admins/managers.
 * 
 * Props:
 * - user: Current user object
 * - project: Array of user's projects
 */
export default function ProjectsTab({ user, project }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">Projects</h2>
        {(user?.orgRole === 'admin' || user?.orgRole === 'project_manager') && (
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {project?.map((proj, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{proj.project?.name}</h3>
                <p className="text-slate-600 text-sm">{proj.project?.description}</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {proj.userRoleInProject?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center text-sm text-slate-500 space-x-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {proj.project?.timeline?.start ? new Date(proj.project.timeline.start).toLocaleDateString() : 'No start date'}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {proj.project?.timeline?.end ? new Date(proj.project.timeline.end).toLocaleDateString() : 'No end date'}
              </div>
            </div>
          </div>
        )) || <p className="text-slate-500 text-center py-8 col-span-2">No projects assigned</p>}
      </div>
    </div>
  );
}