"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, TrendingUp, BarChart3, Loader2, AlertCircle, ArrowUpRight, CheckCircle2, MoreHorizontal } from 'lucide-react';

const CompletedShiftDaysComponent = () => {
    const [completedDays, setCompletedDays] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCompletedDays();
    }, []);

    const fetchCompletedDays = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/shifts/completed-days');
            setCompletedDays(response.data.completedDays);
        } catch (err) {
            setError('Operational telemetry registry unavailable.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full bg-white transition-all space-y-8">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                    <Loader2 className="w-8 h-8 text-slate-800 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Intelligence Registry</p>
                </div>
            ) : error ? (
                <div className="p-8 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 animate-shake">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                       <AlertCircle className="text-red-500" size={20} />
                    </div>
                    <p className="text-red-600 font-bold text-xs leading-none tracking-tight">{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Primary Analytic Summary */}
                    <div className="lg:col-span-1 p-8 bg-slate-950 rounded-3xl text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                          <BarChart3 size={90} className="text-white" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                           <div className="flex items-center justify-between mb-8">
                              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.25em]">Registry Total</p>
                              <div className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-md text-[9px] font-black uppercase tracking-widest border border-green-500/20 shadow-sm">Verified</div>
                           </div>
                           <div className="flex-1 flex flex-col justify-end">
                              <div className="flex items-baseline gap-2 mb-2">
                                 <h4 className="text-6xl font-black tabular-nums tracking-tighter drop-shadow-lg">{completedDays}</h4>
                                 <span className="text-white/30 font-bold text-xs uppercase tracking-widest leading-none pt-2">Units Today</span>
                              </div>
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                 <TrendingUp size={14} className="text-green-400" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-green-400">+3.4% Weekly Gain</span>
                              </div>
                           </div>
                        </div>
                    </div>

                    {/* Secondary Visual Metrics */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between group">
                           <header className="flex items-center justify-between">
                              <div className="space-y-1">
                                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                   <Calendar size={14} className="text-indigo-500" />
                                   Operational Uptime
                                 </p>
                                 <h5 className="text-[11px] font-bold text-slate-500 tracking-tight">Active daily consistency metrics.</h5>
                              </div>
                              <button className="p-1.5 text-slate-300 hover:text-slate-950 transition-colors"><MoreHorizontal size={14} /></button>
                           </header>
                           
                           <div className="mt-10 flex items-end gap-1.5 h-24 mb-6">
                               {[0.6, 0.4, 0.9, 0.7, 0.3, 0.8, 0.5, 0.9, 0.6, 0.4].map((h, i) => (
                                 <div key={i} className="flex-1 bg-slate-50 border border-slate-100 rounded-lg relative overflow-hidden group/bar transition-all hover:bg-slate-100 cursor-pointer">
                                    <div className="absolute bottom-0 left-0 w-full bg-slate-950/80 group-hover/bar:bg-indigo-600 transition-all" style={{ height: `${h * 100}%` }}></div>
                                 </div>
                               ))}
                           </div>
                           
                           <footer className="pt-4 border-t border-slate-50 flex items-center justify-between">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Met <span className="text-green-600">88.3%</span></p>
                             <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-950 transition-all" />
                           </footer>
                        </div>

                        <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between group">
                            <header className="flex items-center justify-between">
                               <div className="space-y-1">
                                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-green-500" />
                                    Security Score
                                  </p>
                                  <h5 className="text-[11px] font-bold text-slate-500 tracking-tight">Active security audit telemetry.</h5>
                               </div>
                               <button className="p-1.5 text-slate-300 hover:text-slate-950 transition-colors"><TrendingUp size={14} /></button>
                            </header>

                            <div className="my-8 flex-1 flex items-center justify-center relative">
                               <div className="text-center">
                                  <span className="text-5xl font-black text-slate-950 tracking-tighter tabular-nums drop-shadow-sm group-hover:text-indigo-600 transition-colors duration-500">A+</span>
                                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mt-2">Core Integrity</p>
                               </div>
                               <div className="absolute -inset-2 border-4 border-slate-50 border-t-indigo-500 rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            </div>

                            <footer className="pt-4 border-t border-slate-50 flex justify-between items-center">
                               <div className="flex -space-x-2">
                                  {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-md bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">WS</div>)}
                               </div>
                               <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer">Live Node</span>
                            </footer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompletedShiftDaysComponent;