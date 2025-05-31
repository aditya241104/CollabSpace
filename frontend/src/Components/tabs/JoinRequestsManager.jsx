import { useState, useEffect } from 'react';
import { Check, X, Clock, Users } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

export default function JoinRequestsManager({ user }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosClient.get(`/organization/requests/${user._id}`);
        setRequests(data.requests);
      } catch (error) {
        console.error('Error fetching join requests:', error);
        setMessage({
          text: error.response?.data?.message || 'Failed to load join requests.',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.orgRole === 'admin') {
      fetchRequests();
    }
  }, [user]);

  const handleRequestAction = async (requestId, action) => {
    const actionEndpoint = action === 'accept' ? 'accept-request' : 'reject-request';
    try {
      await axiosClient.post(`/organization/${actionEndpoint}`, {
        requestId,
        adminId: user._id
      });

      // Remove the handled request from the local list
      setRequests((prev) => prev.filter(req => req._id !== requestId));
      setMessage({
        text: `Request ${action === 'accept' ? 'accepted' : 'rejected'} successfully.`,
        type: 'success'
      });
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      setMessage({
        text: error.response?.data?.message || `Failed to ${action} request.`,
        type: 'error'
      });
    }
  };

  if (!user || user.orgRole !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-red-500 mb-4">
          <X className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Access Denied</h3>
        <p className="text-gray-600 mt-2">
          Only organization admins can view and manage join requests.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <Users className="w-5 h-5 mr-2 text-indigo-600" />
        Pending Join Requests
      </h2>

      {message.text && (
        <div
          className={`p-3 rounded mb-6 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800">No pending requests</h3>
          <p className="text-gray-600 mt-2">
            There are currently no join requests to review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium text-gray-800">{request.userId.name}</h3>
                <p className="text-sm text-gray-600">{request.userId.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Requested on: {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRequestAction(request._id, 'accept')}
                  className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  title="Accept"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleRequestAction(request._id, 'reject')}
                  className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  title="Reject"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
