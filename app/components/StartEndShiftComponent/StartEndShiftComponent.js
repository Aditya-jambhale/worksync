"use client";
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Play, Square, FileText, CheckCircle, AlertCircle, X, ChevronRight, Clock, Loader2, Zap, Circle, Activity } from 'lucide-react';

const StartEndShiftComponent = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeShift, setActiveShift] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showEndShiftModal, setShowEndShiftModal] = useState(false);
    const [workNotes, setWorkNotes] = useState('');
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    useEffect(() => {
        fetchCurrentShift();
    }, []);

    useEffect(() => {
        if (!activeShift) return;
        const intervalId = setInterval(() => {
            const start = new Date(activeShift.start_time);
            const now = new Date();
            const diff = now - start;
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            setElapsedTime(`${h}:${m}:${s}`);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [activeShift]);

    const fetchCurrentShift = async () => {
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
            console.error('Error fetching current shift:', err);
        }
    };

    const startShift = async () => {
        setIsLoading(true);
        setError(null);
        const loadToast = toast.loading('Starting shift...');
        try {
            const token = Cookies.get('user_session_token');
            const response = await fetch('/api/shifts/start', {
                method: 'POST',
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to start shift');
            
            setActiveShift(data.shift);
            toast.success('Welcome back! Your shift has started.', { id: loadToast });
        } catch (err) {
            setError(err.message);
            toast.error(err.message, { id: loadToast });
        } finally {
            setIsLoading(false);
        }
    };

    const endShift = async () => {
        if (!workNotes.trim()) {
            toast.error('Please briefly describe what you did today.');
            return;
        }
        setIsLoading(true);
        setError(null);
        const loadToast = toast.loading('Ending shift...');
        try {
            const token = Cookies.get('user_session_token');
            const response = await fetch('/api/shifts/end', {
                method: 'POST',
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notes: workNotes })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to end shift');

            setActiveShift(null);
            setShowEndShiftModal(false);
            setWorkNotes('');
            toast.success('Shift completed. Great work today!', { id: loadToast });
        } catch (err) {
            setError(err.message);
            toast.error(err.message, { id: loadToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white transition-all overflow-hidden relative group/parent">
            {/* Header Area */}
            <div className="p-6 pb-2 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <h3 className="text-sm font-semibold text-slate-950">Shift Control</h3>
                    </div>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    activeShift ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                    <Circle size={6} className={activeShift ? 'fill-green-500 text-green-500' : 'fill-slate-300 text-slate-300'} />
                    {activeShift ? 'Active Session' : 'No active session'}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 z-10">
                {activeShift ? (
                    <div className="text-center space-y-2 animate-in zoom-in duration-500 relative">
                        {/* Background Glow */}
                        <div className="absolute -inset-12 bg-green-500/5 blur-3xl rounded-full animate-pulse pointer-events-none"></div>
                        
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none relative">Session Duration</p>
                        <div className="text-6xl font-semibold text-slate-950 tabular-nums tracking-tighter drop-shadow-sm transition-all relative">
                            {elapsedTime}
                        </div>
                        <p className="text-xs font-medium text-slate-500 pt-2 flex items-center justify-center gap-1.5 relative">
                            <Activity size={12} className="text-green-500 animate-pulse" />
                            Started at {new Date(activeShift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                ) : (
                    <div className="text-center space-y-5 animate-in fade-in duration-500">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mx-auto text-slate-300">
                           <Clock size={24} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-base font-semibold text-slate-950">Ready to start?</h4>
                            <p className="text-sm text-slate-500 max-w-[240px] mx-auto">Start your shift to begin recording your work metrics and productivity data.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="p-6 pt-2 z-10">
                <button
                    onClick={activeShift ? () => setShowEndShiftModal(true) : startShift}
                    disabled={isLoading}
                    className={`w-full h-11 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm ${
                        activeShift 
                            ? 'bg-slate-950 text-white hover:bg-slate-900 border-transparent' 
                            : 'bg-white text-slate-950 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {isLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        activeShift ? (
                            <>
                                <Square className="fill-white" size={14} />
                                <span>End Shift</span>
                            </>
                        ) : (
                            <>
                                <Play className="fill-slate-950" size={14} />
                                <span>Begin Shift</span>
                            </>
                        )
                    )}
                </button>
            </div>

            {/* Error/Success Feedbacks */}
            {(error || successMessage) && (
                <div className="px-6 pb-4 z-10">
                   <div className={`p-2.5 rounded-md flex items-center gap-3 border text-xs font-semibold animate-in slide-in-from-bottom-2 duration-300 ${
                      error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-700'
                   }`}>
                      {error ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                      <span>{error || successMessage}</span>
                      <button onClick={() => {setError(null); setSuccessMessage(null);}} className="ml-auto opacity-50 hover:opacity-100">
                         <X size={14} />
                      </button>
                   </div>
                </div>
            )}

            {/* End Shift Review Modal */}
            {showEndShiftModal && (
                <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-xl p-8 w-full max-w-sm mx-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                        <header className="space-y-2 mb-6">
                            <h3 className="text-lg font-semibold text-slate-950">Confirm sign off</h3>
                            <p className="text-sm text-slate-500">Briefly summarize your accomplishments before completing your shift.</p>
                        </header>

                        <div>
                            <textarea
                                value={workNotes}
                                onChange={(e) => setWorkNotes(e.target.value)}
                                placeholder="Describe what you worked on..."
                                className="w-full h-32 p-4 rounded-lg bg-slate-50 border border-slate-200 focus:border-slate-400 text-sm font-medium placeholder:text-slate-400 outline-none resize-none transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-8">
                            <button
                                onClick={() => setShowEndShiftModal(false)}
                                className="h-10 rounded-lg text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={endShift}
                                className="h-10 rounded-lg text-sm font-semibold bg-slate-950 text-white hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>Sign off</span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StartEndShiftComponent;