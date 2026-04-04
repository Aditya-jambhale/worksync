"use client";
import React, { useState } from "react";
import { CheckCircle2, Circle, Clock, MessageSquare, Plus, Filter, Search, ChevronDown, ListTodo, MoreVertical, AlertTriangle, Loader2 } from "lucide-react";
import supabase from '@/app/DB/dbConnect';

export default function TaskListComponent({ tasks: initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all");
  const [loadingTaskId, setLoadingTaskId] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setLoadingTaskId(taskId);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('taskid', taskId);

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(t => t.taskid === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const filteredTasks = tasks?.filter(t => {
     if (filter === 'all') return true;
     return t.status?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="w-full bg-white transition-all">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Find tasks..." 
                className="w-full sm:w-48 pl-9 h-9 rounded-md border border-slate-200 bg-white text-xs font-medium focus:ring-1 focus:ring-slate-950 outline-none transition-all"
              />
           </div>
           <div className="relative">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-md border border-slate-200 bg-white text-xs font-semibold focus:ring-1 focus:ring-slate-950 outline-none appearance-none cursor-pointer"
              >
                 <option value="all">Display: All</option>
                 <option value="pending">Pending</option>
                 <option value="in progress">In Progress</option>
                 <option value="completed">Completed</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
        </div>
        {/* <button className="flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-slate-950 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-slate-900 shadow-sm transition-all active:scale-95">
           <Plus size={14} />
           Create New Task
        </button> */}
      </header>

      {filteredTasks && filteredTasks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Assignment</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.map((task, index) => (
                <tr key={task.taskid || index} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-4">
                       <div className="mt-1">
                          {task.status === 'Completed' ? (
                             <CheckCircle2 size={18} className="text-green-500" strokeWidth={2.5} />
                          ) : (
                             <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-200"></div>
                          )}
                       </div>
                       <div className="space-y-1">
                          <p className={`text-[13px] font-semibold leading-relaxed max-w-sm line-clamp-2 ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-950'}`}>
                             {task.taskdescription}
                          </p>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Active Node #{index + 1}</span>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="relative inline-block group/status">
                        <select 
                           value={task.status || 'Pending'}
                           onChange={(e) => handleStatusChange(task.taskid, e.target.value)}
                           disabled={loadingTaskId === task.taskid}
                           className={`appearance-none h-8 pl-3 pr-8 rounded-full text-[10px] font-bold uppercase border cursor-pointer outline-none transition-all ${
                             task.status === "Completed" ? "bg-green-50 text-green-700 border-green-200" :
                             task.status === "In Progress" ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm" :
                             "bg-slate-50 text-slate-600 border-slate-200"
                           } disabled:opacity-50`}
                        >
                           <option value="Pending">Pending</option>
                           <option value="In Progress">In Progress</option>
                           <option value="Completed">Completed</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-current">
                           {loadingTaskId === task.taskid ? (
                              <Loader2 size={10} className="animate-spin" />
                           ) : (
                              <ChevronDown size={10} />
                           )}
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPriorityColor(task.priority || 'Medium')}`}>
                        <AlertTriangle size={10} />
                        {task.priority || "Medium"}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{formatDate(task.createdat)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="p-1 px-2 text-slate-400 hover:text-slate-950 rounded hover:bg-slate-100 transition-all">
                        <MoreVertical size={14} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-20 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-1">
             <h3 className="text-lg font-semibold text-slate-950">No operational nodes</h3>
             <p className="text-sm text-slate-500 max-w-sm mx-auto">All assignments have been cleared or the filter set is empty.</p>
          </div>
          <button onClick={() => setFilter('all')} className="h-9 px-6 bg-slate-950 text-white rounded-md font-bold text-xs uppercase tracking-widest hover:bg-slate-900 shadow-sm transition-all">
            Clear Filters
          </button>
        </div>
      )}
      
      {filteredTasks && filteredTasks.length > 0 && (
         <footer className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasks are synchronized with the central Admin</p>
         </footer>
      )}
    </div>
  );
}
