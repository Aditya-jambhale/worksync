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
  const [shiftsData, setShiftsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [adminId, setAdminId] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');
  const [showModal, setShowModal] = useState(false);

  // Notification helper
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Fetch tasks assigned by the admin
  const fetchAdminTasks = useCallback(async (adminId) => {
    if (!adminId) return;
    setLoadingTasks(true);
    try {
      // Fetch tasks with the assigned user's name from the tasks table
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
      setAdminTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showNotification('Failed to load tasks', 'error');
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // Fetch shifts data separately
  const fetchShiftsData = useCallback(async () => {
    setLoadingShifts(true);
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          id,
          user_id,
          start_time,
          end_time,
          status,
          notes,
          users(name)
        `)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setShiftsData(data || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      showNotification('Failed to load shifts data', 'error');
    } finally {
      setLoadingShifts(false);
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
          fetchShiftsData();
        } else {
          showNotification('Admin session not found. Please login again.', 'error');
        }
      } catch (error) {
        console.error('Error retrieving admin session:', error);
        showNotification('Session error. Please login again.', 'error');
      }
    };

    getAdminSession();
  }, [fetchAdminTasks, fetchShiftsData]);

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

      // Find the assigned user's name
      const userName = users.find((user) => user.userId === selectedUser)?.name || 'Unknown';

      // Append the new task to the list
      setAdminTasks([
        {
          taskid: data[0].taskid,
          taskdescription: task,
          createdat: data[0].createdat,
          userId: selectedUser,
          user: { name: userName },
        },
        ...adminTasks,
      ]);

      // Reset form fields and close modal
      setTask('');
      setSelectedUser('');
      setShowModal(false);
      showNotification('Task assigned successfully', 'success');
    } catch (error) {
      console.error('Error assigning task:', error);
      showNotification('Failed to assign task', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Format date and time in 12-hour format
  const formatDateTime12Hour = (dateString) => {
    if (!dateString) return 'N/A';
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
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            {adminName && <p className="text-gray-500">Welcome, {adminName}</p>}
          </div>
          <button
            onClick={confirmLogout}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {notification.show && (
          <div
            className={`p-4 mb-6 rounded flex items-center ${
              notification.type === 'success'
                ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
                : notification.type === 'error'
                ? 'bg-red-50 text-red-700 border-l-4 border-red-500'
                : 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500'
            }`}
          >
            <div className="mr-3">
              {notification.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : notification.type === 'error' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            {notification.message}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded font-medium ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`px-4 py-2 rounded font-medium ${
                activeTab === 'shifts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Shifts
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Assign New Task
          </button>
        </div>

        {/* Task Assignment Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
              <div className="p-5 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Assign New Task</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAssignTask} className="p-5">
                <div className="mb-4">
                  <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Description
                  </label>
                  <textarea
                   id="task"
                   rows="4"
                   className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={task}
                   onChange={(e) => setTask(e.target.value)}
                   placeholder="Enter detailed task description..."
                   required
                 />
               </div>

               <div className="mb-4">
                 <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                   Assign To
                 </label>
                 <select
                   id="user"
                   className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={selectedUser}
                   onChange={(e) => setSelectedUser(e.target.value)}
                   required
                 >
                   <option value="">Select User</option>
                   {users.map((user) => (
                     <option key={user.userId} value={user.userId}>
                       {user.name}
                     </option>
                   ))}
                 </select>
               </div>

               <div className="flex justify-end space-x-3 mt-6">
                 <button
                   type="button"
                   onClick={() => setShowModal(false)}
                   className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   disabled={loading}
                   className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                 >
                   {loading ? (
                     <div className="flex items-center">
                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       Assigning...
                     </div>
                   ) : (
                     'Assign Task'
                   )}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Content Based on Active Tab */}
       <div className="bg-white shadow rounded-lg overflow-hidden">
         {/* Tasks View */}
         {activeTab === 'tasks' && (
           <div>
             <div className="px-6 py-4 border-b border-gray-200">
               <h2 className="text-lg font-medium text-gray-800">Assigned Tasks</h2>
             </div>

             {loadingTasks ? (
               <div className="p-6 flex justify-center">
                 <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
               </div>
             ) : adminTasks.length === 0 ? (
               <div className="p-6 text-center text-gray-500">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                 </svg>
                 <p>No tasks have been assigned yet.</p>
                 <button
                   onClick={() => setShowModal(true)}
                   className="mt-3 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
                 >
                   Assign Your First Task
                 </button>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                     <tr>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned On</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {adminTasks.map((item) => (
                       <tr key={item.taskid} className="hover:bg-gray-50">
                         <td className="px-6 py-4 whitespace-normal">
                           <div className="text-sm text-gray-900">{item.taskdescription}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-900">{item.user?.name || 'Unknown'}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-500">
                             {formatDateTime12Hour(item.createdat)}
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
         )}

         {/* Shifts View */}
         {activeTab === 'shifts' && (
           <div>
             <div className="px-6 py-4 border-b border-gray-200">
               <h2 className="text-lg font-medium text-gray-800">Staff Shifts</h2>
             </div>

             {loadingShifts ? (
               <div className="p-6 flex justify-center">
                 <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
               </div>
             ) : shiftsData.length === 0 ? (
               <div className="p-6 text-center text-gray-500">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 <p>No shifts data available.</p>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                     <tr>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {shiftsData.map((shift) => (
                       <tr key={shift.id} className="hover:bg-gray-50">
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-900">{shift.users?.name || 'Unknown'}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-900">{formatDateTime12Hour(shift.start_time)}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-900">{formatDateTime12Hour(shift.end_time)}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                             shift.status === 'completed' ? 'bg-green-100 text-green-800' : 
                             shift.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                             shift.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                             'bg-gray-100 text-gray-800'
                           }`}>
                             {shift.status ? shift.status.replace('_', ' ') : 'N/A'}
                           </span>
                         </td>
                         <td className="px-6 py-4 whitespace-normal">
                           <div className="text-sm text-gray-500 max-w-xs truncate">{shift.notes || 'No notes'}</div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
         )}
       </div>
     </main>
   </div>
 );
}