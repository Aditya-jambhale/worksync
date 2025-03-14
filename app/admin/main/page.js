"use client";
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import supabase from '@/app/DB/dbConnect';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [task, setTask] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [adminTasks, setAdminTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [adminId, setAdminId] = useState(null);
  const [adminName, setAdminName] = useState('');

  // Notification helper
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Fetch tasks assigned by the admin and then separately fetch the related shift details.
  const fetchAdminTasks = useCallback(async (adminId) => {
    if (!adminId) return;
    setLoadingTasks(true);
    try {
      // 1. Fetch tasks with the assigned user's name from the tasks table.
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          taskid,
          taskdescription,
          createdat,
          userId,
          user:users(name)
        `)
        .eq('adminId', adminId)
        .order('createdat', { ascending: false });

      if (tasksError) throw tasksError;

      // If no tasks are found, update state and exit.
      if (!tasksData || tasksData.length === 0) {
        setAdminTasks([]);
        return;
      }

      // 2. Extract unique user IDs from tasks.
      const uniqueUserIds = [...new Set(tasksData.map(task => task.userId))];

      // 3. Fetch shift details from the shifts table for these user IDs.
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('user_id, id, start_time, end_time, status, notes')
        .in('user_id', uniqueUserIds);

      if (shiftsError) throw shiftsError;

      // 4. Join the shift data to each task. If there are multiple shifts for a user,
      //    here we pick the one with the latest start_time.
      const tasksWithShifts = tasksData.map(task => {
        const matchingShifts = shiftsData.filter(shift => shift.user_id === task.userId);
        const shift = matchingShifts.reduce((prev, current) => {
          if (!prev) return current;
          return new Date(current.start_time) > new Date(prev.start_time) ? current : prev;
        }, null);
        return { ...task, shift };
      });

      setAdminTasks(tasksWithShifts);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showNotification('Failed to load tasks', 'error');
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // Get admin details from the /api/admin/me endpoint
  useEffect(() => {
    const getAdminSession = async () => {
      try {
        const userResponse = await fetch('/api/admin/me', {
          headers: {
            'Authorization': `Bearer ${Cookies.get('admin_session_token')}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch admin details');
        }

        const adminData = await userResponse.json();
        if (adminData && adminData.admin) {
          setAdminId(adminData.admin.adminId);
          setAdminName(adminData.admin.name || adminData.admin.email || 'Admin');
          fetchAdminTasks(adminData.admin.adminId);
        } else {
          showNotification('Admin session not found. Please login again.', 'error');
        }
      } catch (error) {
        console.error('Error retrieving admin session:', error);
        showNotification('Session error. Please login again.', 'error');
      }
    };

    getAdminSession();
  }, [fetchAdminTasks]);

  // Fetch all users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('userId, name')
          .order('name');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        showNotification('Failed to load users', 'error');
      }
    };

    fetchUsers();
  }, []);

  const confirmLogout = async () => {
    try {
      const response = await fetch("/api/admin/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get("admin_session_token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }
      router.push("/admin/signin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Re-fetch tasks if adminId changes.
  useEffect(() => {
    if (adminId) {
      fetchAdminTasks(adminId);
    }
  }, [adminId, fetchAdminTasks]);

  // Handle task assignment
  const handleAssignTask = async (e) => {
    e.preventDefault();

    if (!adminId) {
      showNotification('Admin session expired. Please login again.', 'error');
      return;
    }

    if (!task.trim()) {
      showNotification('Please enter a task description', 'warning');
      return;
    }

    if (!selectedUser) {
      showNotification('Please select a user', 'warning');
      return;
    }

    setLoading(true);

    try {
      // Insert task into the tasks table.
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            taskdescription: task,
            userId: selectedUser,
            adminId: adminId,
          },
        ])
        .select();

      if (error) throw error;

      // Find the assigned user's name.
      const userName = users.find((user) => user.userId === selectedUser)?.name || 'Unknown';

      // Append the new task to the list. Note that shift details are not available immediately.
      setAdminTasks([
        {
          taskid: data[0].taskid,
          taskdescription: task,
          createdat: data[0].createdat,
          userId: selectedUser,
          user: { name: userName },
          shift: null,
        },
        ...adminTasks,
      ]);

      // Reset form fields.
      setTask('');
      setSelectedUser('');
      showNotification('Task assigned successfully', 'success');
    } catch (error) {
      console.error('Error assigning task:', error);
      showNotification('Failed to assign task', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Formatter for 12hr date and time format.
  const formatDateTime12Hour = (dateString) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-gray-800">Admin</h1>
            {adminName && <p className="text-sm text-gray-500">Welcome, {adminName}</p>}
          </div>
          <button
            onClick={confirmLogout}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>
    
      <main className="max-w-5xl mx-auto px-4 py-6">
        {notification.show && (
          <div
            className={`p-3 mb-4 rounded-sm text-sm ${
              notification.type === 'success'
                ? 'bg-green-50 text-green-700'
                : notification.type === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-yellow-50 text-yellow-700'
            }`}
          >
            {notification.message}
          </div>
        )}
    
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Assignment Form */}
          <div className="bg-white p-5 rounded-sm border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Assign Task</h2>
            <form onSubmit={handleAssignTask}>
              <div className="mb-3">
                <label htmlFor="task" className="block text-sm text-gray-600 mb-1">
                  Task Description
                </label>
                <textarea
                  id="task"
                  rows="3"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Enter task details..."
                />
              </div>
    
              <div className="mb-3">
                <label htmlFor="user" className="block text-sm text-gray-600 mb-1">
                  Assign To
                </label>
                <select
                  id="user"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
    
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-sm focus:outline-none"
              >
                {loading ? 'Assigning...' : 'Assign Task'}
              </button>
            </form>
          </div>
    
          {/* Task History with Shift Details */}
          <div className="bg-white p-5 rounded-sm border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Task History</h2>
    
            {loadingTasks ? (
              <p className="text-sm text-gray-500">Loading tasks...</p>
            ) : adminTasks.length === 0 ? (
              <p className="text-sm text-gray-500">No tasks assigned yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-5">
                <table className="min-w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">Task</th>
                      <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">Assigned To</th>
                      <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">Assigned On</th>
                      <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">Shift Start Time</th>
                      <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">Shift End Time</th>
                      <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">Notes</th>
                      <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminTasks.map((item) => (
                      <tr key={item.taskid}>
                        <td className="px-5 py-2 text-xs text-gray-800">{item.taskdescription}</td>
                        <td className="px-5 py-2 text-xs text-gray-500">{item.user?.name || 'Unknown'}</td>
                        <td className="px-5 py-2 text-xs text-gray-500">
                          {new Date(item.createdat).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                          })}
                        </td>
                        <td className="px-5 py-2 text-xs text-gray-500">
                          {item.shift && item.shift.start_time
                            ? formatDateTime12Hour(item.shift.start_time)
                            : 'null'}
                        </td>
                        <td className="px-5 py-2 text-xs text-gray-500">
                          {item.shift && item.shift.end_time
                            ? formatDateTime12Hour(item.shift.end_time)
                            : 'null'}
                        </td>
                        <td className="px-5 py-2 text-xs text-gray-500">{item.shift?.notes || 'N/A'}</td>
                        <td className="px-5 py-2 text-xs text-gray-500">{item.shift?.status || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
