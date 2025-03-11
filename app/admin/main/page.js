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

    // Define fetchAdminTasks using useCallback so its reference is stable
    const fetchAdminTasks = useCallback(async (adminId) => {
        if (!adminId) return;
        setLoadingTasks(true);
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
          taskid,
          taskdescription,
          createdat,
          user:users(name)
        `)
                .eq('adminId', adminId)
                .order('createdat', { ascending: false });

            
            if (error) throw error;
            setAdminTasks(data || []);
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
                console.log(adminData);
                if (adminData && adminData.admin) {
                    setAdminId(adminData.admin.adminId);
                    setAdminName(adminData.admin.name || adminData.admin.email || 'Admin');

                    // Now that fetchAdminTasks is defined, we can call it
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

    // useEffect(() => {
    //   const fetchShifts = async () => {
    //     try {
    //       const { shiftdata, error } = await supabase
    //         .from('shifts')
    //         .select('user_id, notes, status')
    //         .eq('user_id')
    //         .order('user_id'); // You can change the column to order by if needed.
    //   console.log(shiftdata)
    //       if (error) throw error;
    //       // setShifts(data || []);
    //     } catch (error) {
    //       console.error('Error fetching shifts:', error);
    //       showNotification('Failed to load shifts', 'error');
    //     }
    //   };
    
    //   fetchShifts();
    // }, []);


    const confirmLogout = async () => {
        try {
            const response = await fetch("/api/admin/signout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // The token is included here if your API expects it;
                    // Note: If the cookie is HttpOnly, the browser sends it automatically.
                    "Authorization": `Bearer ${Cookies.get("admin_session_token")}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to sign out");
            }

            // Optionally, you can clear client-side tokens (if not HttpOnly)
            // Cookies.remove("admin_session_token");

            // Redirect to the admin sign in page
            router.push("/admin/signin");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };


    // If adminId changes, re-fetch tasks (this useEffect is optional since getAdminSession calls fetchAdminTasks already)
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
            // Insert task into the tasks table
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

            // Get the name of the selected user from local state
            const userName = users.find((user) => user.userId === selectedUser)?.name || 'Unknown';

            // Add the new task to the list; note we use data[0].taskid (ensure your column names match)
            setAdminTasks([
                {
                    taskid: data[0].taskid,
                    taskdescription: task,
                    createdat: data[0].createdat,
                    user: { name: userName },
                },
                ...adminTasks,
            ]);

            // Reset form fields
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
      
            {/* Task History */}
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
                        <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">
                          Task
                        </th>
                        <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">
                          Assigned To
                        </th>
                        <th className="px-5 py-2 text-left text-xs font-medium text-gray-500">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {adminTasks.map((item) => (
                        <tr key={item.taskid}>
                          <td className="px-5 py-2 text-xs text-gray-800">
                            {item.taskdescription}
                          </td>
                          <td className="px-5 py-2 text-xs text-gray-500">
                            {item.user?.name || 'Unknown'}
                          </td>
                          <td className="px-5 py-2 text-xs text-gray-500">
                            {new Date(item.createdat).toLocaleDateString()}
                          </td>
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
