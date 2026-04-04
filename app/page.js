"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import StartEndShiftComponent from './components/StartEndShiftComponent/StartEndShiftComponent.js';
import CurrentShiftComponent from './components/CurrentShiftComponent/CurrentShiftComponent.js';
import ShiftHistoryComponent from './components/ShiftHistoryComponent/ShiftHistoryComponent.js';
import CompletedShiftDaysComponent from './components/CompletedShiftDaysComponent/CompletedShiftDaysComponent';
import { 
  LogOut, LayoutDashboard, CheckSquare, Clock, 
  Settings, Bell, Search, Menu, X, ChevronLeft, 
  ChevronRight, CreditCard, User, 
  Zap, Calendar, BarChart3, HelpCircle, 
  Shield, Globe, Terminal, UserSquare2, 
  ToggleLeft, Lock, Trash2, Smartphone
} from 'lucide-react';
import TaskListComponent from './components/TaskListComponent/TaskListComponent.js';
import Footer from './components/Footer/Footer.js';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userResponse = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${Cookies.get('user_session_token')}` }
        });
        if (!userResponse.ok) throw new Error('Unauthorized');
        const userData = await userResponse.json();
        setUser(userData.user);

        const tasksResponse = await fetch('/api/users/readtask/', { credentials: 'include' });
        if (tasksResponse.ok) {
          const data = await tasksResponse.json();
          setTasks(data.tasks || []);
        }
      } catch (err) {
        router.push('/user');
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [router]);

  const [activeShift, setActiveShift] = useState(null);
  const [totalHours, setTotalHours] = useState(0);
  const [activeDuration, setActiveDuration] = useState('00:00:00');

  useEffect(() => {
    const fetchOperationalStats = async () => {
       try {
          const currentResponse = await fetch('/api/shifts/current');
          if (currentResponse.ok) {
             const data = await currentResponse.json();
             setActiveShift(data.activeShift);
          }

          const historyResponse = await fetch('/api/shifts/history?limit=1000');
          if (historyResponse.ok) {
             const data = await historyResponse.json();
             const shifts = data.shifts || [];
             let totalMs = 0;
             shifts.forEach(s => {
                if (s.end_time) {
                   totalMs += (new Date(s.end_time) - new Date(s.start_time));
                }
             });
             setTotalHours((totalMs / 3600000).toFixed(1));
          }
       } catch (err) {
          console.error('Stats missing:', err);
       }
    };
    fetchOperationalStats();
  }, [activeTab]);

  useEffect(() => {
     if (!activeShift) {
       setActiveDuration('00:00:00');
       return;
     }
     const intervalId = setInterval(() => {
        const start = new Date(activeShift.start_time);
        const now = new Date();
        const diff = now - start;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setActiveDuration(`${h}:${m}:${s}`);
     }, 1000);
     return () => clearInterval(intervalId);
  }, [activeShift]);

  const productivityScore = tasks.length > 0 ? 
    Math.min(95, 75 + (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 20).toFixed(1) : 
    "0.0";

  const handleLogout = () => setShowLogoutPopup(true);

  const confirmLogout = async () => {
    await fetch('/api/users/signout', { method: 'POST' });
    router.push('/user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Workspace</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, badge: tasks.length },
    { id: 'analytics', label: 'Shift Logs', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const sidebarWidth = sidebarCollapsed ? 'md:w-[72px]' : 'md:w-64';

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row text-slate-950 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[60] md:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Primary Sidebar Navigation */}
      <aside 
        className={`fixed left-0 top-0 h-full border-r border-slate-200 bg-white transition-all duration-300 z-[70] flex flex-col 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
          ${sidebarWidth} 
          w-64`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 shrink-0">
           <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarCollapsed ? 'md:opacity-0 md:overflow-hidden' : 'opacity-100'}`}>
              <div className="w-8 h-8 flex items-center justify-center bg-slate-950 rounded-lg shadow-sm">
                 <Image src="/logo.png" alt="W" width={18} height={18} className="invert brightness-0" />
              </div>
              <span className="font-semibold tracking-tight text-sm">WorkSync</span>
           </div>
           <button 
             onClick={() => {
               if (window.innerWidth < 768) setIsMobileMenuOpen(false);
               else setSidebarCollapsed(!sidebarCollapsed);
             }}
             className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
           >
             <div className="md:block hidden">
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
             </div>
             <div className="md:hidden">
                <X size={18} />
             </div>
           </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
           {navItems.map((item) => (
             <button
               key={item.id}
               onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 768) setIsMobileMenuOpen(false);
               }}
               className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative group h-10 ${
                 activeTab === item.id 
                   ? 'bg-slate-100 text-slate-950 font-semibold' 
                   : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50 font-medium'
               }`}
             >
               <item.icon size={18} className={`shrink-0 ${activeTab === item.id ? 'text-slate-950' : 'text-slate-400 group-hover:text-slate-950'}`} />
               <span className={`text-sm transition-opacity duration-300 ${sidebarCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
                  {item.label}
               </span>
               {(!sidebarCollapsed || isMobileMenuOpen) && item.badge > 0 && (
                 <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                   activeTab === item.id ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-600'
                 }`}>
                   {item.badge}
                 </span>
               )}
               {activeTab === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-r-full" />
               )}
             </button>
           ))}
        </nav>

        {/* Lower Sidebar */}
        <div className="p-3 border-t border-slate-200 space-y-1 shrink-0">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium text-xs h-10"
           >
              <LogOut size={18} className="shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>Log out</span>
           </button>
           <div className={`mt-4 p-3 bg-slate-50 rounded-xl flex items-center gap-3 transition-all duration-300 ${sidebarCollapsed ? 'md:opacity-0 md:overflow-hidden' : 'opacity-100'}`}>
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-bold text-xs shrink-0">
                 {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-xs font-semibold truncate text-slate-950">{user?.name}</p>
                 <p className="text-[10px] text-slate-500 font-medium truncate italic">{user?.email}</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 
        ${sidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-64'} 
        w-full min-w-0 bg-[#fafafa]`}>
        
        {/* Header Ribbon */}
        <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between gap-4">
           <button 
             onClick={() => setIsMobileMenuOpen(true)}
             className="p-2 md:hidden hover:bg-slate-100 rounded-lg text-slate-600"
           >
             <Menu size={20} />
           </button>

           <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-sm hidden sm:block">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 px-0" />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50 rounded-lg outline-none text-sm font-medium focus:bg-white focus:ring-1 focus:ring-slate-950 transition-all"
                 />
              </div>
           </div>

           <div className="flex items-center gap-2 md:gap-3">
              <button className="p-2 text-slate-400 hover:text-slate-950 transition-all relative">
                 <Bell size={18} />
                 <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></div>
              </button>
              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              <div className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
                 <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">{user?.name?.substring(0, 2).toUpperCase()}</div>
                 <ChevronDown size={14} className="text-slate-400" />
              </div>
           </div>
        </header>

        {/* View Content Rendering Area */}
        <main className="flex-1 space-y-6 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
           {/* Section Header */}
           <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                 <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {activeTab === 'dashboard' ? `Welcome back, ${user?.name?.split(' ')[0]}` : 
                     activeTab === 'tasks' ? 'Active Tasks' : 
                     activeTab === 'analytics' ? 'Shift History' : 
                     'Settings'}
                 </h1>
                 <p className="text-sm text-slate-500 mt-1">
                    {activeTab === 'dashboard' ? "Your operational metrics for today." : 
                     activeTab === 'tasks' ? "Manage and prioritize your workplace assignments." :
                     activeTab === 'analytics' ? "Detailed historical logs and telemetry." :
                     "Manage your account and workspace preferences."}
                 </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-600">
                 <Calendar size={14} className="text-slate-400 pt-0" />
                 {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
              </div>
           </header>

           {/* Dashboard View */}
           {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {/* KPI Card: Total Work Hours */}
                   <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1">
                      <p className="text-sm font-medium text-slate-500">Total Work Hours</p>
                      <div className="flex items-baseline gap-2">
                         <h2 className="text-2xl font-semibold text-slate-950">{totalHours}h</h2>
                         <span className={`text-[10px] font-bold ${totalHours > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                           {totalHours > 0 ? '+Active' : 'Standby'}
                         </span>
                      </div>
                   </div>
                   {/* KPI Card: Active Shift Duration */}
                   <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1">
                      <p className="text-sm font-medium text-slate-500">Active Shift Duration</p>
                      <h2 className="text-2xl font-semibold text-slate-950">{activeDuration}</h2>
                   </div>
                   {/* KPI Card: Productivity Score */}
                   <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1">
                      <p className="text-sm font-medium text-slate-500">Productivity Score</p>
                      <div className="flex items-baseline gap-2">
                         <h2 className="text-2xl font-semibold text-slate-950">{productivityScore}%</h2>
                         <span className="text-[10px] font-bold text-indigo-600">{Number(productivityScore) > 80 ? 'Peak' : 'Norm'}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-0 overflow-hidden">
                      <StartEndShiftComponent />
                   </div>
                   <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-0 overflow-hidden">
                      <CurrentShiftComponent setActiveTab={setActiveTab} />
                   </div>
                </div>
              </div>
           )}

           {/* Tasks View */}
           {activeTab === 'tasks' && (
              <div className="animate-in fade-in duration-500 card bg-white">
                 <TaskListComponent tasks={tasks} />
              </div>
           )}

           {/* Shift Analytics View */}
           {activeTab === 'analytics' && (
              <div className="animate-in fade-in duration-500 card bg-white">
                 <ShiftHistoryComponent />
              </div>
           )}

           {/* Settings View - Redesigned as structured layout */}
           {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <nav className="space-y-1">
                       <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 font-semibold text-sm">
                          <UserSquare2 size={18} /> General
                       </button>
                       <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 font-medium text-sm">
                          <Bell size={18} /> Notifications
                       </button>
                       <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 font-medium text-sm">
                          <Shield size={18} /> Security
                       </button>
                       <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 font-medium text-sm">
                          <Smartphone size={18} /> Devices
                       </button>
                    </nav>

                    <div className="md:col-span-3 space-y-6">
                       {/* General Settings Section */}
                       <div className="card p-6 space-y-6 border border-slate-200 bg-white">
                          <header>
                             <h3 className="text-lg font-medium text-slate-950">Workspace Preferences</h3>
                             <p className="text-sm text-slate-500">Manage how your operational environment functions.</p>
                          </header>

                          <div className="space-y-4">
                             <div className="flex items-center justify-between py-1">
                                <div className="space-y-0.5">
                                   <p className="text-sm font-semibold">Enable Telemetry</p>
                                   <p className="text-xs text-slate-500">Allow WorkSync to collect session metadata for analytics.</p>
                                </div>
                                <div className="w-10 h-5 bg-slate-950 rounded-full flex items-center px-1">
                                   <div className="w-3 h-3 bg-white rounded-full ml-auto"></div>
                                </div>
                             </div>
                             <div className="h-px bg-slate-100"></div>
                             <div className="flex items-center justify-between py-1">
                                <div className="space-y-0.5">
                                   <p className="text-sm font-semibold">High Intensity Mode</p>
                                   <p className="text-xs text-slate-500">Optimize dashboard for real-time focus tracking.</p>
                                </div>
                                <div className="w-10 h-5 bg-slate-200 rounded-full flex items-center px-1">
                                   <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                             </div>
                          </div>

                          <footer className="pt-4 flex justify-end">
                             <button className="btn-primary">Save Changes</button>
                          </footer>
                       </div>

                       {/* Danger Zone */}
                       <div className="card p-6 space-y-6 border border-red-100 bg-red-50/20">
                          <header>
                             <h3 className="text-lg font-medium text-red-700">Account Security</h3>
                             <p className="text-sm text-red-600/70">Critical actions related to your workspace instance.</p>
                          </header>
                          <button className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-widest hover:underline">
                             <Trash2 size={14} /> Clear Cache & Manifest
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
           )}
        </main>
        
        <Footer />
      </div>

      {/* Logout Dialog */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
           <div className="bg-white border border-slate-200 shadow-2xl rounded-xl p-8 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-slate-950">Sign out?</h3>
              <p className="text-sm text-slate-500 mt-2">Are you sure you want to end your current dashboard session?</p>
              <div className="grid grid-cols-2 gap-3 mt-8">
                 <button onClick={() => setShowLogoutPopup(false)} className="btn-secondary">Cancel</button>
                 <button onClick={confirmLogout} className="btn-primary bg-red-600 hover:bg-red-700 border-transparent">Log out</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

const ChevronDown = ({ className, size }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
);