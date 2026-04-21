"use client";
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  LogOut, LayoutDashboard, CheckSquare, Clock, 
  Settings, Bell, Search, Menu, X, ChevronLeft, 
  ChevronRight, Calendar, UserSquare2, Shield, Smartphone, Trash2
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import Footer from '../../components/Footer/Footer.js';
import supabase from '@/app/DB/dbConnect';

export default function UserNavigation({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = Cookies.get('user_session_token');
        const userResponse = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (userResponse.status === 401) {
          toast.error('Please log in again');
          router.push('/user/signin');
          return;
        }

        if (!userResponse.ok) throw new Error('Unauthorized');
        
        const userData = await userResponse.json();
        setUser(userData.user);

        const tasksResponse = await fetch('/api/users/readtask/', { 
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (tasksResponse.ok) {
          const data = await tasksResponse.json();
          setTasks(data.tasks || []);
        }
      } catch (err) {
        toast.error('Session expired. Please log in again.');
        router.push('/user/signin');
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [router]);

  const handleLogout = () => setShowLogoutPopup(true);

  const confirmLogout = async () => {
    const loadToast = toast.loading('Signing out...');
    try {
      // 1. Clear the custom app session
      await fetch('/api/users/signout', { method: 'POST' });
      
      // 2. Clear the Supabase social session
      await supabase.auth.signOut();

      toast.success('Logged out successfully', { id: loadToast });
      router.push('/user/signin');
    } catch (err) {
      toast.error('Logout failed', { id: loadToast });
    }
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/user/Dashboard' },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, badge: tasks.length, path: '/user/mytasks' },
    { id: 'analytics', label: 'Shift Logs', icon: Clock, path: '/user/shiftlogs' },
    // { id: 'settings', label: 'Settings', icon: Settings, path: '/user/settings' }, // Even if not on list, keep link
  ];

  const sidebarWidth = sidebarCollapsed ? 'md:w-[72px]' : 'md:w-64';

  const getActiveTab = () => {
    if (pathname.includes('/Dashboard')) return 'dashboard';
    if (pathname.includes('/mytasks')) return 'tasks';
    if (pathname.includes('/shiftlogs')) return 'analytics';
    if (pathname.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

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
                  router.push(item.path);
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
               <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                  {user?.avatar_url ? (
                     <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                     user?.name?.charAt(0)
                  )}
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
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold overflow-hidden border border-slate-200">
                     {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                     ) : (
                        user?.name?.substring(0, 2).toUpperCase()
                     )}
                  </div>
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

           {children}
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
