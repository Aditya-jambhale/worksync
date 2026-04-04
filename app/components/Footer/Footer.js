import React from 'react'
import { Heart, Globe, Terminal, Shield } from 'lucide-react'

function Footer() {
    return (
        <footer className='w-full border-t border-slate-100 bg-white/50 backdrop-blur-xl py-12 px-8'>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm p-1">
                       <img src="/logo.png" alt="W" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 tracking-tighter">WorkSync Core</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Edition</p>
                    </div>
                </div>

                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Terminal size={14} className="text-indigo-500" />
                        <span>v2.4.0 Stable</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Shield size={14} className="text-green-500" />
                        <span>Audit Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Globe size={14} className="text-blue-500" />
                        <span>Cloud Native</span>
                    </div>
                </div>

                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-right">
                    &copy; {new Date().getFullYear()} WorkSync Workforce. <br />
                    <span className="text-[8px] opacity-50">Empowering global remote infrastructures.</span>
                </p>
            </div>
        </footer>
    )
}

export default Footer