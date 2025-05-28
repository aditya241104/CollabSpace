import { User, Mail } from "lucide-react";

/**
 * Profile Tab Component
 * 
 * Displays user profile information.
 * 
 * Props:
 * - user: Current user object
 * - organization: Current organization object
 */
export default function ProfileTab({ user, organization }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Profile Information</h2>
      <div className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800">{user?.name}</h3>
            <p className="text-slate-600">{user?.email}</p>
            <p className="text-sm text-slate-500 capitalize">{user?.orgRole?.replace('_', ' ')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
              <p className="text-slate-900 font-medium">{organization?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Member Since</label>
              <p className="text-slate-600">{new Date(user?.joinedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Active</label>
              <p className="text-slate-600">{new Date(user?.lastActive).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${user?.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                <span className="text-slate-600">{user?.isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}