import { Building, User } from "lucide-react";

/**
 * Dashboard Header Component
 * 
 * Displays the organization information and user profile in the header.
 * 
 * Props:
 * - user: Current user object
 * - organization: Current organization object
 */
export default function DashboardHeader({ user, organization }) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Building className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">{organization?.name}</h1>
              <p className="text-sm text-slate-600">{organization?.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.orgRole?.replace('_', ' ')}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}