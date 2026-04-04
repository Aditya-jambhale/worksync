"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, ArrowLeft, Key, Mail, Lock, Loader2 } from 'lucide-react';

export default function AdminSigninPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'admin'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/admin/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Invalid admin credentials');
            router.push('/admin/main');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

            <div className="w-full max-w-[400px] relative z-10 space-y-8">
                <button 
                  onClick={() => router.push('/user')}
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <ArrowLeft size={14} />
                  Return to User Login
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-500/20 flex items-center justify-center border border-white/10">
                        <ShieldCheck className="text-white" size={28} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-white">Admin Authentication</h1>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">Security-hardened management node</p>
                    </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-800/50 ring-1 ring-white/5 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-950/30 border border-red-500/20 text-red-400 rounded-2xl flex items-start gap-3 animate-shake">
                            <Lock size={16} className="mt-0.5 shrink-0" />
                            <span className="text-xs font-bold leading-relaxed">{error}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Admin Credentials
                            </label>
                            <div className="relative group">
                              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                              <input
                                  id="email"
                                  name="email"
                                  type="email"
                                  autoComplete="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  required
                                  placeholder="admin@worksync.core"
                                  className="w-full pl-11 pr-6 py-3 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-600 focus:bg-slate-950 outline-none transition-all text-sm font-medium text-white placeholder:text-slate-700"
                              />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Secure Keyphrase
                            </label>
                            <div className="relative group">
                              <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                              <input
                                  id="password"
                                  name="password"
                                  type="password"
                                  autoComplete="current-password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  required
                                  placeholder="••••••••"
                                  className="w-full pl-11 pr-6 py-3 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-600 focus:bg-slate-950 outline-none transition-all text-sm font-medium text-white placeholder:text-slate-700"
                              />
                            </div>
                        </div>

                        <input type="hidden" name="role" value={formData.role} />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-[0.98] text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                  <ShieldCheck size={16} />
                                  <span>Grant Access</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="pt-8 border-t border-slate-900 flex justify-between items-center px-2">
                  <div className="flex items-center gap-2 opacity-20">
                    <div className="w-5 h-5 bg-white rounded-md p-1">
                       <Image src="/logo.png" alt="WorkSync" width={16} height={16} className="grayscale brightness-0" />
                    </div>
                    <span className="text-[9px] font-black text-white tracking-widest uppercase">System Core</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">v2.4.0 Secure</span>
                </div>
            </div>
        </div>
    );
}