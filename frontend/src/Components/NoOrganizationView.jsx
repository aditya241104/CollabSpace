import { useState } from "react";
import { Building, Mail, User, UserPlus } from "lucide-react";
import axiosClient from "../utils/axiosClient";
import { toast } from "react-hot-toast";

export default function NoOrganizationView({ user }) {
  const [orgRequest, setOrgRequest] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOrgRequest = async () => {
    if (!orgRequest.trim()) return;
    try {
      setLoading(true);

      const response = await axiosClient.post("/organization/join-request", {
        userId: user._id,
        organizationId: orgRequest.trim(),
      });

      toast.success(response.data.message || "Join request sent successfully!");
      setOrgRequest(""); // Clear input
    } catch (error) {
      const errorMsg = error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
                    disabled={!orgRequest.trim() || loading}
                    className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-semibold transition-all duration-200
                      ${loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                    ) : (
                      <UserPlus className="w-5 h-5" />
                    )}
                    <span>{loading ? "Sending..." : "Send Join Request"}</span>
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
