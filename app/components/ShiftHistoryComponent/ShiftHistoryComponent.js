"use client"
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Clock, Calendar, ChevronLeft, ChevronRight, Filter, AlertCircle, Loader2, Download, Search, FileDown } from 'lucide-react';

const ShiftHistoryComponent = () => {
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 0, limit: 10, count: 0 });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchShiftHistory();
  }, [pagination.page, pagination.limit, statusFilter]);

  const fetchShiftHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = Cookies.get('user_session_token');
      const queryParams = new URLSearchParams({ page: pagination.page, limit: pagination.limit });
      if (statusFilter) queryParams.append('status', statusFilter);
      
      const response = await fetch(`/api/shifts/history?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired');
        }
        throw new Error('Failed to fetch shift history');
      }
      
      const data = await response.json();
      setShifts(data.shifts);
      setPagination({ ...pagination, count: data.count });
    } catch (err) {
      setError(err.message || 'Failed to fetch shift history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString, type = 'full') => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (type === 'time') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (type === 'date') return date.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });
    return date.toLocaleString();
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '00:00';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const hours = Math.floor(diffMs / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((diffMs % 3600000) / 60000).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="w-full bg-white transition-all">
      <header className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 h-9 rounded-md border border-slate-200 bg-white text-xs font-medium focus:ring-1 focus:ring-slate-950 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
           </div>
        </div>
        <button className="flex items-center gap-2 h-9 px-3 text-xs font-semibold border border-slate-200 rounded-md hover:bg-slate-50 transition-all active:scale-95">
           <FileDown size={14} className="text-slate-500" />
           Export Logs
        </button>
      </header>

      {error && (
        <div className="p-4 m-6 bg-red-50 rounded-lg border border-red-100 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={18} />
          <p className="text-red-600 font-medium text-xs tracking-tight">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
           <Loader2 className="w-6 h-6 text-slate-950 animate-spin" />
           <p className="text-slate-500 text-xs font-medium">Loading historical records...</p>
        </div>
      ) : shifts && shifts.length === 0 ? (
        <div className="p-20 text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 border border-slate-100">
            <Clock size={24} />
          </div>
          <div className="space-y-1">
             <h3 className="text-base font-semibold text-slate-950">No shift history</h3>
             <p className="text-sm text-slate-500 max-w-xs mx-auto">You haven't recorded any shift sessions yet. Start your first shift to see history here.</p>
          </div>
          <button className="bg-slate-950 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 transition-all">Begin First Shift</button>
        </div>
      ) : (
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Session</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Time Frame</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Duration</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {shifts.map((shift, index) => (
                  <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-950">Shift #{pagination.count - (pagination.page * pagination.limit) - index}</span>
                          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px] italic">
                             {shift.notes || 'No operational notes Logged'}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-3">
                       <span className="text-sm font-medium text-slate-700">{formatDateTime(shift.start_time, 'date')}</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                       <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                          <span>{formatDateTime(shift.start_time, 'time')}</span>
                          <span className="text-slate-300">→</span>
                          <span>{shift.end_time ? formatDateTime(shift.end_time, 'time') : 'Live'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                       <span className="text-sm font-semibold text-slate-900">{calculateDuration(shift.start_time, shift.end_time)}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                         shift.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
                         shift.status === "completed" ? "bg-slate-100 text-slate-700 border-slate-200" :
                         "bg-amber-50 text-amber-700 border-amber-200"
                       }`}>
                         {shift.status || "active"}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="flex items-center justify-between p-4 border-t border-slate-100">
             <p className="text-xs text-slate-500">
               Showing <span className="font-semibold text-slate-950">{Math.min((pagination.page + 1) * pagination.limit, pagination.count)}</span> of <span className="font-semibold text-slate-950">{pagination.count}</span> records
             </p>
             <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                  disabled={pagination.page === 0}
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-30 transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={(pagination.page + 1) * pagination.limit >= pagination.count}
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-30 transition-all"
                >
                  Next
                </button>
             </div>
          </footer>
        </div>
      )}
    </div>
  );
};

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

export default ShiftHistoryComponent;