"use client"
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Timer, Activity, Hash, ArrowUpRight, Copy, Check, Loader2, Zap, Circle, MoveUpRight, ZapOff , Calendar} from 'lucide-react';

const CurrentShiftComponent = ({ setActiveTab }) => {
    const [activeShift, setActiveShift] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [copied, setCopied] = useState(false);

    const [activityData, setActivityData] = useState([]);

    useEffect(() => {
        fetchCurrentShift();
        fetchActivityData();
    }, []);

    const fetchCurrentShift = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get('user_session_token');
            const response = await fetch('/api/shifts/current', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const data = await response.json();
              setActiveShift(data.activeShift);
            }
        } catch (err) {
            setError('Failed to fetch current shift');
            toast.error('Failed to load active shift data');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchActivityData = async () => {
        try {
            const token = Cookies.get('user_session_token');
            const response = await fetch('/api/shifts/history?limit=100', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const data = await response.json();
              setActivityData(data.shifts || []);
            }
        } catch (err) {
            console.error('Activity Error:', err);
        }
    };

    const getActivityLevel = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayShifts = activityData.filter(s => s.start_time.startsWith(dateStr));
        if (dayShifts.length === 0) return 'bg-slate-50 border-slate-100';
        
        let totalMs = 0;
        dayShifts.forEach(s => {
           if (s.end_time) {
             totalMs += (new Date(s.end_time) - new Date(s.start_time));
           } else {
             totalMs += (new Date() - new Date(s.start_time));
           }
        });
        
        const hours = totalMs / 3600000;
        if (hours < 2) return 'bg-emerald-100 border-emerald-200';
        if (hours < 5) return 'bg-emerald-300 border-emerald-400';
        if (hours < 8) return 'bg-emerald-500 border-emerald-600';
        return 'bg-emerald-700 border-emerald-800 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    };

    const renderActivityGrid = () => {
        const today = new Date();
        const days = [];
        // Show last 18 weeks (about 4 months)
        for (let i = 126; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            days.push(d);
        }

        return (
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-fit mx-auto">
                {days.map((day, i) => (
                    <div 
                        key={i} 
                        title={`${day.toLocaleDateString()}`}
                        className={`w-3 h-3 rounded-[2px] border transition-all hover:scale-125 cursor-crosshair ${getActivityLevel(day)}`}
                    ></div>
                ))}
            </div>
        );
    };

    const copyId = () => {
        navigator.clipboard.writeText(activeShift.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-white transition-all group selection:bg-indigo-100 min-h-[440px]">
            {/* Header */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-200">
                        <Calendar size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Pulse</h3>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest leading-none mt-1">Shift Activity Grid</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                   <Zap size={10} className="fill-slate-400 text-slate-400" />
                   Core Synced
                </div>
            </div>

            {/* Main Insights Panel - Activity Grid */}
            <div className="flex-1 p-8 flex flex-col justify-center space-y-8 min-h-[300px]">
                <header className="text-center space-y-1">
                   <h4 className="text-base font-semibold text-slate-950">Shift Momentum</h4>
                   <p className="text-xs text-slate-500 max-w-[280px] mx-auto">Visualization of operational engagement over the last 18 weeks.</p>
                </header>

                <div className="relative p-6 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden group/grid">
                   <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
                   <div className="relative z-10 overflow-x-auto no-scrollbar py-2">
                       {renderActivityGrid()}
                   </div>
                   
                   <div className="flex items-center justify-between mt-6 px-1">
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         <span>Less</span>
                         <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-sm bg-slate-50 border border-slate-100"></div>
                            <div className="w-2 h-2 rounded-sm bg-emerald-100"></div>
                            <div className="w-2 h-2 rounded-sm bg-emerald-300"></div>
                            <div className="w-2 h-2 rounded-sm bg-emerald-500"></div>
                            <div className="w-2 h-2 rounded-sm bg-emerald-700"></div>
                         </div>
                         <span>More</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-950 uppercase tracking-tighter">Rolling 126 Day Matrix</span>
                   </div>
                </div>
            </div>

            {/* Footer Summary Bar */}
            <footer className="p-6 pt-0 border-t border-slate-50 mt-auto bg-slate-50/20">
               <div className="flex items-center justify-between py-6">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Session Density</p>
                     <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <Activity size={14} className="text-emerald-500" />
                        {activityData.length} Completed Cycles
                     </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="flex items-center gap-2 h-9 px-4 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:border-slate-950 transition-all active:scale-95 shadow-sm"
                  >
                     Review History
                     <ArrowUpRight size={12} />
                  </button>
               </div>
            </footer>
        </div>
    );
};

export default CurrentShiftComponent;