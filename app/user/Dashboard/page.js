"use client";
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import UserNavigation from '../lib/navigation';
import StartEndShiftComponent from '../../components/StartEndShiftComponent/StartEndShiftComponent.js';
import CurrentShiftComponent from '../../components/CurrentShiftComponent/CurrentShiftComponent.js';

export default function DashboardPage() {
  const [activeShift, setActiveShift] = useState(null);
  const [totalHours, setTotalHours] = useState(0);
  const [activeDuration, setActiveDuration] = useState('00:00:00');
  const [tasks, setTasks] = useState([]);
  const hasShownToast = useRef(false);

  // Handle OAuth Success Toast
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'success' && !hasShownToast.current) {
      toast.success('Successfully logged in with Social ID!', {
        icon: '🚀',
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#fff',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        },
      });
      hasShownToast.current = true;
      
      // Clean up URL without refreshing the page
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
     const fetchOperationalStats = async () => {
        try {
           const token = Cookies.get('user_session_token');
           const currentResponse = await fetch('/api/shifts/current', {
              headers: { 'Authorization': `Bearer ${token}` }
           });
           if (currentResponse.ok) {
              const data = await currentResponse.json();
              setActiveShift(data.activeShift);
           }

           const historyResponse = await fetch('/api/shifts/history?limit=1000', {
              headers: { 'Authorization': `Bearer ${token}` }
           });
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

           const tasksResponse = await fetch('/api/users/readtask/', { 
             credentials: 'include',
             headers: { 'Authorization': `Bearer ${token}` }
           });
           if (tasksResponse.ok) {
             const data = await tasksResponse.json();
             setTasks(data.tasks || []);
           }
        } catch (err) {
           toast.error('Failed to load dashboard metrics');
           console.error('Stats missing:', err);
        }
     };
     fetchOperationalStats();
  }, []);

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

  return (
    <UserNavigation>
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
              <CurrentShiftComponent />
           </div>
        </div>
      </div>
    </UserNavigation>
  );
}
