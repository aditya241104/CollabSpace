/**
 * Dashboard Loading Component
 * 
 * Shows a loading spinner while dashboard data is being fetched.
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading your workspace...</p>
      </div>
    </div>
  );
}