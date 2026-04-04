"use client";
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import supabase from '@/app/DB/dbConnect';
import { useRouter } from 'next/navigation';
import { 
  Users, Calendar, CheckSquare, Plus, LogOut, Search, 
  Menu, X, Bell, ChevronDown, CheckCircle2, AlertCircle, 
  Clock, Hash, FileText, LayoutDashboard, Settings,
  MoreVertical, Command, TrendingUp, UserCheck, AlertTriangle,
  ArrowUpRight, Trash2, Edit3, UserPlus, Filter, ChevronLeft, ChevronRight,Shield
} from 'lucide-react';
import Image from 'next/image';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskStatus, setTaskStatus] = useState('Pending');

  // Notification helper
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const fetchAdminTasks = useCallback(async (adminId) => {
    if (!adminId) return;
    setLoadingTasks(true);
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`*, users(name)`)
        .eq('adminId', adminId)
        .order('createdat', { ascending: false });

      if (tasksError) throw tasksError;
      setAdminTasks(tasksData || []);
    } catch (error) {
      showNotification(`Tasks Error: ${error.message}`, 'error');
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  const fetchShiftsData = useCallback(async () => {
    setLoadingShifts(true);
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select(`*, users(name)`)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setShiftsData(data || []);
    } catch (error) {
      showNotification(`Shifts Error: ${error.message}`, 'error');
    } finally {
      setLoadingShifts(false);
    }
  }, []);

  useEffect(() => {
    const getAdminSession = async () => {
      try {
        const userResponse = await fetch('/api/admin/me', {
          headers: { 'Authorization': `Bearer ${Cookies.get('admin_session_token')}` }
        });
        if (!userResponse.ok) throw new Error('Failed to fetch admin details');
        const adminData = await userResponse.json();
        if (adminData && adminData.admin) {
          setAdminId(adminData.admin.adminId);
          setAdminName(adminData.admin.name || adminData.admin.email || 'Admin');
          fetchAdminTasks(adminData.admin.adminId);
          fetchShiftsData();
        }
      } catch (error) {
        router.push('/admin/signin');
      }
    };
    getAdminSession();
  }, [fetchAdminTasks, fetchShiftsData, router]);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const { data, error } = await supabase.from('users').select('userId, name, email, role').order('name');
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        showNotification('Failed to load users', 'error');
      }
    };
    fetchUsersData();
  }, []);

  const confirmLogout = async () => {
    try {
      await fetch("/api/admin/signout", { method: "POST" });
      router.push("/admin/signin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!adminId) return;
    if (!task.trim() || !selectedUser) {
      showNotification('Please fill all fields', 'warning');
      return;
    }
    setLoading(true);
    try {
      if (editingTaskId) {
        const { error } = await supabase
          .from('tasks')
          .update({ 
            taskdescription: task, 
            userId: selectedUser, 
            priority: taskPriority, 
            status: taskStatus 
          })
          .eq('taskid', editingTaskId);
        
        if (error) throw error;
        
        const userName = users.find((user) => user.userId === selectedUser)?.name || 'Unknown';
        setAdminTasks(prev => prev.map(t => t.taskid === editingTaskId ? { 
          ...t, 
          taskdescription: task, 
          userId: selectedUser, 
          priority: taskPriority, 
          status: taskStatus,
          user: { name: userName }
        } : t));
        
        showNotification('Task updated successfully', 'success');
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert([{ 
            taskdescription: task, 
            userId: selectedUser, 
            adminId: adminId, 
            status: taskStatus, 
            priority: taskPriority 
          }])
          .select();
        
        if (error) throw error;
        
        const userName = users.find((user) => user.userId === selectedUser)?.name || 'Unknown';
        setAdminTasks([{ 
          taskid: data[0].taskid, 
          taskdescription: task, 
          createdat: data[0].createdat, 
          userId: selectedUser, 
          user: { name: userName }, 
          status: taskStatus, 
          priority: taskPriority 
        }, ...adminTasks]);
        
        showNotification('Task assigned successfully', 'success');
      }
      
      resetModal();
    } catch (error) {
      showNotification(editingTaskId ? 'Failed to update task' : 'Failed to assign task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setTask('');
    setSelectedUser('');
    setTaskPriority('Medium');
    setTaskStatus('Pending');
    setEditingTaskId(null);
    setShowModal(false);
  };

  const openEditModal = (taskObj) => {
    setEditingTaskId(taskObj.taskid);
    setTask(taskObj.taskdescription);
    setSelectedUser(taskObj.userId);
    setTaskPriority(taskObj.priority || 'Medium');
    setTaskStatus(taskObj.status || 'Pending');
    setShowModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to permanently decommission this task node?')) return;
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('taskid', taskId);

      if (error) throw error;
      setAdminTasks(prev => prev.filter(t => t.taskid !== taskId));
      showNotification('Task decommissioned successfully', 'success');
    } catch (error) {
      showNotification(`Delete Error: ${error.message}`, 'error');
    }
  };

  const formatDate = (dateString) => {
     const date = new Date(dateString);
     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const stats = [
    { label: 'Active Personnel', value: users.length, icon: UserCheck, color: 'text-indigo-600', trend: '+4%' },
    { label: 'Tasks Pending', value: adminTasks.filter(t => t.status !== 'Completed').length, icon: Clock, color: 'text-amber-600', trend: '-2%' },
    { label: 'Tasks Completed', value: adminTasks.filter(t => t.status === 'Completed').length, icon: CheckCircle2, color: 'text-green-600', trend: '+12%' },
    { label: 'Efficiency Score', value: '98.2%', icon: TrendingUp, color: 'text-blue-600', trend: '+1.4%' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row text-slate-950 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[60] md:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar - SaaS Layout */}
      <aside 
        className={`fixed left-0 top-0 h-full border-r border-slate-200 bg-white transition-all duration-300 z-[70] flex flex-col 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
          ${sidebarCollapsed ? 'md:w-[72px]' : 'md:w-64'} 
          w-64`}
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center justify-between px-4 shrink-0">
           <div className={`flex items-center gap-3 transition-opacity duration-300 ${sidebarCollapsed ? 'md:opacity-0 md:overflow-hidden' : 'opacity-100'}`}>
              <div className="w-8 h-8 flex items-center justify-center bg-slate-950 rounded-lg">
                 <Image src="/logo.png" alt="W" width={18} height={18} className="invert brightness-0" />
              </div>
              <div className="flex flex-col">
                 <span className="font-semibold tracking-tight text-sm">WorkSync</span>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Admin Console</span>
              </div>
           </div>
           <button 
             onClick={() => {
               if (window.innerWidth < 768) setIsMobileMenuOpen(false);
               else setSidebarCollapsed(!sidebarCollapsed);
             }}
             className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
           >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
           </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
           {/* Section: Core */}
           <div className="space-y-1">
              {!sidebarCollapsed && <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Core Registry</p>}
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all h-10 relative group ${activeTab === 'dashboard' ? 'bg-slate-100 text-slate-950 font-semibold' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50 font-medium'}`}
              >
                <LayoutDashboard size={18} />
                <span className={`text-sm ${sidebarCollapsed ? 'md:hidden' : 'inline'}`}>Overview</span>
                {activeTab === 'dashboard' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-r-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all h-10 relative group ${activeTab === 'tasks' ? 'bg-slate-100 text-slate-950 font-semibold' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50 font-medium'}`}
              >
                <CheckSquare size={18} />
                <span className={`text-sm ${sidebarCollapsed ? 'md:hidden' : 'inline'}`}>Task Console</span>
                {activeTab === 'tasks' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-r-full" />}
              </button>
           </div>

           {/* Section: Management */}
           <div className="space-y-1">
              {!sidebarCollapsed && <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Management</p>}
              <button 
                onClick={() => setActiveTab('shifts')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all h-10 relative group ${activeTab === 'shifts' ? 'bg-slate-100 text-slate-950 font-semibold' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50 font-medium'}`}
              >
                <Clock size={18} />
                <span className={`text-sm ${sidebarCollapsed ? 'md:hidden' : 'inline'}`}>Shift Logs</span>
                {activeTab === 'shifts' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-r-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all h-10 relative group ${activeTab === 'users' ? 'bg-slate-100 text-slate-950 font-semibold' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50 font-medium'}`}
              >
                <Users size={18} />
                <span className={`text-sm ${sidebarCollapsed ? 'md:hidden' : 'inline'}`}>Personnel</span>
                {activeTab === 'users' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-r-full" />}
              </button>
           </div>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-slate-200 shrink-0">
           <button 
             onClick={confirmLogout}
             className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium text-xs h-10"
           >
              <LogOut size={18} className="shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>Logout  </span>
           </button>
           <div className={`mt-4 p-3 bg-slate-50 rounded-xl flex items-center gap-3 transition-all duration-300 ${sidebarCollapsed ? 'md:opacity-0 md:overflow-hidden' : 'opacity-100'}`}>
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-bold text-xs shrink-0">
                 {adminName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-xs font-semibold truncate text-slate-950">{adminName}</p>
                 <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tighter italic">Administrator</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 
        ${sidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-64'} 
        w-full min-w-0 bg-[#fafafa]`}>
        
        {/* Header Ribbon */}
        <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between gap-4">
           {/* Mobile Trigger */}
           <button 
             onClick={() => setIsMobileMenuOpen(true)}
             className="p-2 md:hidden hover:bg-slate-100 rounded-lg text-slate-600"
           >
             <Menu size={20} />
           </button>

           <div className="flex flex-1 items-center gap-4">
              <div className="relative w-full max-w-sm hidden sm:block group">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-950 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search (⌘K)" 
                   className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50 rounded-lg outline-none text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-950 transition-all"
                 />
              </div>
           </div>

           <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400 hover:text-slate-950 transition-colors relative">
                 <Bell size={18} />
                 <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></div>
              </button>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
                 <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">AD</div>
                 <ChevronDown size={14} className="text-slate-400" />
              </div>
           </div>
        </header>

        {/* Page Main View */}
        <main className="flex-1 space-y-8 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
           {/* Section Header */}
           <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                 <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {activeTab === 'dashboard' ? 'Operational Overview' : 
                     activeTab === 'tasks' ? 'Task Control Console' : 
                     activeTab === 'shifts' ? 'Shift Logs' : 
                     'Personnel Registry'}
                 </h1>
                 <p className="text-sm text-slate-500">
                    {activeTab === 'dashboard' ? "Aggregated telemetry from your operational workforce." :
                     activeTab === 'tasks' ? "Assign and monitor operational goals for personnel." :
                     activeTab === 'shifts' ? "Detailed historical logs of personnel work cycles." :
                     "Manage the active workforce identity registry."}
                 </p>
              </div>
              <div className="flex items-center gap-3">
                 <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold hover:bg-slate-50 transition-all">
                    <Filter size={14} className="text-slate-400" />
                    Filters
                 </button>
                 <button 
                   onClick={() => { resetModal(); setShowModal(true); }}
                   className="flex items-center gap-2 h-9 px-4 rounded-lg bg-slate-950 text-white text-xs font-semibold hover:bg-slate-900 shadow-sm transition-all active:scale-95"
                 >
                    <Plus size={16} />
                    Create Assignment
                 </button>
              </div>
           </header>

           {/* Overview Metrics */}
           {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                       <div key={i} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4 group hover:border-slate-300 transition-all">
                          <header className="flex items-center justify-between">
                             <div className={`p-2 rounded-lg bg-slate-50 border border-slate-100 ${stat.color}`}>
                                <stat.icon size={18} />
                             </div>
                             <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.trend}
                             </span>
                          </header>
                          <div className="space-y-1">
                             <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                             <h3 className="text-2xl font-semibold text-slate-950">{stat.value}</h3>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                    <div className="lg:col-span-8 space-y-6">
                       <header className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-slate-950">Active Assignments</h3>
                          <button className="text-[11px] font-bold text-slate-400 hover:text-slate-950 transition-colors uppercase tracking-widest">View All Console</button>
                       </header>
                       <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-0 overflow-hidden divide-y divide-slate-100">
                          {adminTasks.slice(0, 5).map((t, i) => (
                             <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                                <div className="flex items-start gap-4">
                                   <div className={`mt-0.5 w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-blue-500 ring-4 ring-blue-50' : 'bg-slate-200'}`}></div>
                                   <div className="space-y-0.5">
                                      <p className="text-sm font-semibold text-slate-900">{t.taskdescription}</p>
                                      <div className="flex items-center gap-3 text-xs text-slate-500">
                                         <span className="font-bold text-slate-950 uppercase text-[10px]">{t.users?.name}</span>
                                         <span>&bull;</span>
                                         <span>{formatDate(t.createdat)}</span>
                                      </div>
                                   </div>
                                </div>
                                <ArrowUpRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <header className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-slate-950">Personnel Summary</h3>
                        </header>
                        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 space-y-6">
                           {users.slice(0, 4).map((u, i) => (
                             <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">{u.name.charAt(0)}</div>
                                   <p className="text-xs font-bold text-slate-900">{u.name}</p>
                                </div>
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                             </div>
                           ))}
                           <button className="w-full py-2.5 border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-all">Expand Logs</button>
                        </div>
                    </div>
                 </div>
              </div>
           )}

           {/* Task Control Console View */}
           {activeTab === 'tasks' && (
              <div className="animate-in fade-in duration-500 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                             <th className="px-6 py-4">Assignment Node</th>
                             <th className="px-6 py-4">Assigned To</th>
                             <th className="px-6 py-4 text-center">Priority</th>
                             <th className="px-6 py-4 text-center">Status</th>
                             <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {adminTasks.map((item, i) => (
                             <tr key={item.taskid} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                   <div className="space-y-0.5">
                                      <p className="text-sm font-semibold text-slate-950 truncate max-w-sm">{item.taskdescription}</p>
                                      <p className="text-[10px] font-mono text-slate-400">ID: #{item.taskid.slice(0, 8)}</p>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">{item.users?.name?.charAt(0)}</div>
                                      <span className="text-xs font-semibold text-slate-950 uppercase">{item.users?.name}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                   <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                     item.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                                     item.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                     'bg-slate-50 text-slate-500 border-slate-200'
                                   }`}>
                                      {item.priority || 'Medium'}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                   <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                     item.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                                     item.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                     'bg-slate-100 text-slate-500 border-slate-200'
                                   }`}>
                                      {item.status || 'Pending'}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex items-center justify-end gap-2">
                                      <button 
                                        onClick={() => openEditModal(item)}
                                        className="p-1 px-2 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-md transition-all"
                                      >
                                        <Edit3 size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteTask(item.taskid)}
                                        className="p-1 px-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}

           {/* Shift Registry View */}
           {activeTab === 'shifts' && (
              <div className="animate-in fade-in duration-500 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                             <th className="px-6 py-4">Identity</th>
                             <th className="px-6 py-4">Interval</th>
                             <th className="px-6 py-4 text-center">Session Status</th>
                             <th className="px-6 py-4">Operational Notes</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {shiftsData.map((shift) => (
                             <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 uppercase">{shift.users?.name?.charAt(0)}</div>
                                      <span className="text-xs font-bold text-slate-950 uppercase">{shift.users?.name}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-950">
                                         <Clock size={12} className="text-slate-400" />
                                         {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(shift.start_time)}</p>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                   <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                     shift.status === 'completed' ? 'bg-slate-100 text-slate-700 border-slate-200' : 
                                     'bg-green-50 text-green-700 border-green-200 ring-2 ring-green-100 animate-pulse'
                                   }`}>
                                      {shift.status || 'Active'}
                                   </span>
                                </td>
                                <td className="px-6 py-4">
                                   <p className="text-[11px] font-medium text-slate-500 lg:max-w-xs truncate italic">{shift.notes || 'No operational comments recorded'}</p>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}

           {/* Personnel Registry View */}
           {activeTab === 'users' && (
              <div className="animate-in fade-in duration-500 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                             <th className="px-6 py-4">Personnel Identity</th>
                             <th className="px-6 py-4">Work Email</th>
                             <th className="px-6 py-4 text-center">Credential Role</th>
                             <th className="px-6 py-4 text-center">Current Status</th>
                             <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {users.map((u, i) => {
                             const isActive = shiftsData.some(s => s.user_id === u.userId && s.status !== 'completed');
                             return (
                               <tr key={u.userId} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-xs font-bold text-white uppercase">{u.name.charAt(0)}</div>
                                        <span className="text-xs font-bold text-slate-950 uppercase">{u.name}</span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className="text-xs font-medium text-slate-500">{u.email}</span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                     <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                        <Shield size={10} />
                                         {u.role || 'Personnel'}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                     <div className="flex items-center justify-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-slate-950' : 'text-slate-400'}`}>
                                          {isActive ? 'On-Duty' : 'Offline'}
                                        </span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <button className="p-1 px-2 text-slate-400 hover:text-slate-950 rounded-md transition-all"><MoreVertical size={14} /></button>
                                  </td>
                               </tr>
                             );
                           })}
                        </tbody>
                    </table>
                 </div>
              </div>
           )}
        </main>
      </div>

      {/* Assignment Modal - Pure SaaS UX */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden animate-in zoom-in-95 duration-200 relative border border-slate-200 my-auto">
             <header className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xl font-semibold text-slate-950">{editingTaskId ? 'Edit Assignment' : 'Create Assignment'}</h3>
                <p className="text-sm text-slate-500 mt-1">{editingTaskId ? 'Modify existing operational deliverables.' : 'Define requirements and deploy a task node.'}</p>
             </header>

             <form onSubmit={handleAssignTask} className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-0.5">Task Requirements</label>
                   <textarea
                     rows="3"
                     value={task}
                     onChange={(e) => setTask(e.target.value)}
                     placeholder="Example: Execute the security audit..."
                     className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-950 outline-none transition-all resize-none text-sm font-medium"
                     required
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-0.5">Priority Weight</label>
                      <select 
                         value={taskPriority}
                         onChange={(e) => setTaskPriority(e.target.value)}
                         className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none text-sm font-medium transition-all"
                      >
                         <option value="Low">Low</option>
                         <option value="Medium">Medium</option>
                         <option value="High">High</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-0.5">Initial Status</label>
                      <select 
                         value={taskStatus}
                         onChange={(e) => setTaskStatus(e.target.value)}
                         className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none text-sm font-medium transition-all"
                      >
                         <option value="Pending">Pending</option>
                         <option value="In Progress">In Progress</option>
                         <option value="Completed">Completed</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-0.5">Assign Personnel</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {users.map(u => (
                        <button
                          key={u.userId}
                          type="button"
                          onClick={() => setSelectedUser(u.userId)}
                          className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                            selectedUser === u.userId ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                           <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${selectedUser === u.userId ? 'bg-white/20' : 'bg-slate-100'}`}>{u.name.charAt(0)}</div>
                           <span className="text-xs font-bold truncate">{u.name}</span>
                        </button>
                      ))}
                   </div>
                </div>
             </form>

             <footer className="p-6 md:p-8 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3">
                <button 
                   onClick={() => setShowModal(false)} 
                   type="button" 
                   className="w-full sm:flex-1 h-11 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                   Discard
                </button>
                <button 
                   type="submit" 
                   onClick={handleAssignTask}
                   className="w-full sm:flex-[2] h-11 bg-slate-950 text-white rounded-lg text-sm font-bold hover:bg-slate-900 shadow-xl shadow-slate-200 transition-all font-mono tracking-tighter"
                >
                   {editingTaskId ? 'Execute Update' : 'Submit Assignment'}
                </button>
             </footer>
          </div>
        </div>
      )}

      {/* Global Notification */}
      {notification.show && (
        <div className="fixed bottom-8 right-8 z-[110] animate-in slide-in-from-right-4 duration-300">
           <div className={`p-4 rounded-xl border-t-4 shadow-2xl flex items-center gap-3 min-w-[280px] bg-white ${
              notification.type === 'success' ? 'border-green-500' : 'border-red-500'
           }`}>
              <div className={`p-1.5 rounded-full ${notification.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                 {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-950">{notification.message}</p>
                 <p className="text-[10px] font-medium text-slate-400 capitalize">{notification.type}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}