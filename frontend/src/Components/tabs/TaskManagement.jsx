
import React, { useState, useEffect } from 'react';
import axiosClient from '../../utils/axiosClient';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  User,
  Filter
} from 'lucide-react';

const TaskManagementSystem = ({ user }) => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [subtasks, setSubtasks] = useState({});
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  
  // Modal states
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateSubtask, setShowCreateSubtask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: '',
    teamId: '',
    status: 'pending'
  });
  
  const [subtaskForm, setSubtaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    taskId: ''
  });

  // Check user permissions
  const canManageAllTasks = user?.orgRole === 'admin' || user?.orgRole === 'project_manager';
  const isTeamManager = teams.some(team => 
    team.userRole === 'team_manager' && team.teamId
  );

  // Fetch initial data on component mount
  useEffect(() => {
    fetchInitialData();
  }, [user._id]);

  // Fetch all required data
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTasks(),
        fetchTeams(),
        fetchProjects()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks based on user role
  const fetchTasks = async () => {
    try {
      let response;
      if (canManageAllTasks) {
        // Admin/Project Manager can see all tasks
        response = await axiosClient.get(`/task/all/${user._id}`);
      } else {
        // Regular users see only their assigned subtasks
        response = await axiosClient.get(`/task/user/${user._id}`);
      }
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Fetch user's teams
  const fetchTeams = async () => {
    try {
      const response = await axiosClient.get(`/team/user/${user._id}`);
      setTeams(response.data);
      
      // Fetch members for each team
      const membersData = {};
      for (const team of response.data) {
        try {
          const membersResponse = await axiosClient.get(`/team/${team.teamId}`);
          membersData[team.teamId] = membersResponse.data.members;
        } catch (error) {
          console.error(`Error fetching members for team ${team.teamId}:`, error);
        }
      }
      setTeamMembers(membersData);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  // Fetch user's projects
  const fetchProjects = async () => {
    try {
      const response = await axiosClient.get(`/project/${user._id}`);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Fetch subtasks for a specific task
  const fetchSubtasks = async (taskId) => {
    try {
      const response = await axiosClient.get(`/task/subtasks/${taskId}`);
      setSubtasks(prev => ({
        ...prev,
        [taskId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    }
  };

  // Toggle task expansion and load subtasks
  const toggleTaskExpansion = async (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (expandedTasks.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
      // Fetch subtasks if not already loaded
      if (!subtasks[taskId]) {
        await fetchSubtasks(taskId);
      }
    }
    setExpandedTasks(newExpanded);
  };

  // Create new main task (Admin/Project Manager only)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/task/assign-main', {
        ...taskForm,
        userId: user._id
      });
      
      setShowCreateTask(false);
      setTaskForm({ title: '', description: '', projectId: '', teamId: '', status: 'pending' });
      await fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task: ' + (error.response?.data?.message || error.message));
    }
  };

  // Create new subtask (Team Manager only)
  const handleCreateSubtask = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/task/assign-sub', {
        ...subtaskForm,
        assignedBy: user._id
      });
      
      setShowCreateSubtask(false);
      setSubtaskForm({ title: '', description: '', assignedTo: '', taskId: '' });
      
      // Refresh subtasks for the specific task
      if (subtaskForm.taskId) {
        await fetchSubtasks(subtaskForm.taskId);
      }
    } catch (error) {
      console.error('Error creating subtask:', error);
      alert('Error creating subtask: ' + (error.response?.data?.message || error.message));
    }
  };

  // Update task status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await axiosClient.patch(`/task/${taskId}/status`, {
        status: newStatus,
        userId: user._id
      });
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating task status: ' + (error.response?.data?.message || error.message));
    }
  };

  // Update subtask status
  const handleUpdateSubtaskStatus = async (subtaskId, newStatus, taskId) => {
    try {
      await axiosClient.patch(`/task/subtask/${subtaskId}/status`, {
        status: newStatus,
        userId: user._id
      });
      
      // Refresh subtasks for the specific task
      await fetchSubtasks(taskId);
    } catch (error) {
      console.error('Error updating subtask status:', error);
      alert('Error updating subtask status: ' + (error.response?.data?.message || error.message));
    }
  };

  // Delete task (Admin/Project Manager only)
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task? This will also delete all subtasks.')) {
      return;
    }
    
    try {
      await axiosClient.delete(`/task/${taskId}`, {
        data: { userId: user._id }
      });
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task: ' + (error.response?.data?.message || error.message));
    }
  };

  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Get status color classes
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const teamMatch = teamFilter === 'all' || task.assignedTeam?._id === teamFilter;
    return statusMatch && teamMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Management</h1>
        <p className="text-gray-600">
          {canManageAllTasks 
            ? 'Manage all tasks and assign work to teams' 
            : 'View and update your assigned tasks'
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        {canManageAllTasks && (
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        )}
        
        {(isTeamManager || canManageAllTasks) && (
          <button
            onClick={() => setShowCreateSubtask(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Subtask
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {canManageAllTasks && (
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-2">
              <Calendar className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
            <p className="text-gray-500">
              {canManageAllTasks 
                ? 'Create your first task to get started'
                : 'No tasks have been assigned to you yet'
              }
            </p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isExpanded = expandedTasks.has(task._id);
            const taskSubtasks = subtasks[task._id] || [];
            
            return (
              <div key={task._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Main Task */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <button
                          onClick={() => toggleTaskExpansion(task._id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                        
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.title}
                        </h3>
                        
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(task.status)}
                            {task.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {task.projectId && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {task.projectId.name}
                          </div>
                        )}
                        
                        {task.assignedTeam && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {task.assignedTeam.name}
                          </div>
                        )}
                        
                        {task.createdBy && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Created by {task.createdBy.name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Task Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {canManageAllTasks && (
                        <>
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Subtasks */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">
                          Subtasks ({taskSubtasks.length})
                        </h4>
                        
                        {(isTeamManager || canManageAllTasks) && (
                          <button
                            onClick={() => {
                              setSubtaskForm({ ...subtaskForm, taskId: task._id });
                              setShowCreateSubtask(true);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            + Add Subtask
                          </button>
                        )}
                      </div>
                      
                      {taskSubtasks.length === 0 ? (
                        <p className="text-gray-500 text-sm">No subtasks yet</p>
                      ) : (
                        <div className="space-y-3">
                          {taskSubtasks.map(subtask => (
                            <div
                              key={subtask._id}
                              className="bg-white rounded-lg p-4 border border-gray-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h5 className="font-medium text-gray-900">
                                      {subtask.title}
                                    </h5>
                                    
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subtask.status)}`}>
                                      <div className="flex items-center gap-1">
                                        {getStatusIcon(subtask.status)}
                                        {subtask.status.replace('_', ' ').toUpperCase()}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {subtask.description && (
                                    <p className="text-gray-600 text-sm mb-2">
                                      {subtask.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex gap-4 text-xs text-gray-500">
                                    {subtask.assignedTo && (
                                      <span>Assigned to: {subtask.assignedTo.name}</span>
                                    )}
                                    {subtask.assignedBy && (
                                      <span>Assigned by: {subtask.assignedBy.name}</span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Subtask Actions */}
                                <div className="ml-4">
                                  {(subtask.assignedTo?._id === user._id || isTeamManager || canManageAllTasks) && (
                                    <select
                                      value={subtask.status}
                                      onChange={(e) => handleUpdateSubtaskStatus(subtask._id, e.target.value, task._id)}
                                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project *
                </label>
                <select
                  value={taskForm.projectId}
                  onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.project._id} value={project.project._id}>
                      {project.project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Team *
                </label>
                <select
                  value={taskForm.teamId}
                  onChange={(e) => setTaskForm({ ...taskForm, teamId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team.teamId} value={team.teamId}>
                      {team.teamName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Subtask Modal */}
      {showCreateSubtask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Subtask</h2>
            
            <form onSubmit={handleCreateSubtask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={subtaskForm.title}
                  onChange={(e) => setSubtaskForm({ ...subtaskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={subtaskForm.description}
                  onChange={(e) => setSubtaskForm({ ...subtaskForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Task *
                </label>
                <select
                  value={subtaskForm.taskId}
                  onChange={(e) => setSubtaskForm({ ...subtaskForm, taskId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Task</option>
                  {filteredTasks.map(task => (
                    <option key={task._id} value={task._id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Member *
                </label>
                <select
                  value={subtaskForm.assignedTo}
                  onChange={(e) => setSubtaskForm({ ...subtaskForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Member</option>
                  {Object.values(teamMembers).flat().map(member => (
                    <option key={member.userId._id} value={member.userId._id}>
                      {member.userId.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Create Subtask
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateSubtask(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagementSystem;