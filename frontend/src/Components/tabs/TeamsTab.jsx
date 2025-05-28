import { Users, Plus } from "lucide-react";

/**
 * Teams Tab Component
 * 
 * Displays user's teams and management options for admins/managers.
 * 
 * Props:
 * - user: Current user object
 * - team: Array of user's teams
 */
export default function TeamsTab({ user, team }) {
  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {team?.map((t, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{t.teamName}</h3>
                <p className="text-slate-600 text-sm">{t.description}</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {t.userRole?.replace('_', ' ')}
              </span>
            </div>

          </div>
        )) || <p className="text-slate-500 text-center py-8 col-span-2">No teams joined</p>}
      </div>
    </div>
  );
}