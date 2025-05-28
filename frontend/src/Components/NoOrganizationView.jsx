import { Building, Mail, User, UserPlus } from "lucide-react";

/**
 * No Organization View Component
 * 
 * Shows when user isn't part of any organization.
 * 
 * Props:
 * - user: Current user object
 * - orgRequest: Organization request input value
 * - setOrgRequest: Function to update orgRequest
 * - handleOrgRequest: Function to handle join request submission
 */
export default function NoOrganizationView({ user, orgRequest, setOrgRequest, handleOrgRequest }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Building className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Welcome to Your Workspace</h1>
            <p className="text-xl text-slate-600">You're not currently part of an organization. Join one to get started!</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Your Profile</h2>
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{user?.name}</h3>
                  <p className="text-slate-600 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Request to Join Organization</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Organization Name or ID
                    </label>
                    <input
                      type="text"
                      value={orgRequest}
                      onChange={(e) => setOrgRequest(e.target.value)}
                      placeholder="Enter organization name or ID"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <button
                    onClick={handleOrgRequest}
                    disabled={!orgRequest.trim()}
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Send Join Request</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}