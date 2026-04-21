"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Mail, Lock, User, ShieldCheck, ChevronRight, Briefcase } from 'lucide-react';
import SocialAuth from '@/app/components/SocialAuth';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Intern' 
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.name || !formData.email || !formData.password || !formData.role) {
            setError('All fields are required');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: formData.name,
                  email: formData.email,
                  password: formData.password,
                  role: formData.role
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Signup failed');
            router.push('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafafa] selection:bg-indigo-100 selection:text-indigo-900">
            {/* Subtle background texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
            
            <div className="w-full max-w-[440px] relative z-10 space-y-8">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="relative mb-4 group">
                        <div className="absolute -inset-1 bg-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center transition-transform hover:scale-105 duration-300">
                            <Image src="/logo.png" alt="WorkSync" width={28} height={28} className="object-contain" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950">Join WorkSync</h1>
                    <p className="text-sm text-muted-foreground font-medium">Create your workforce account to begin</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                            <p className="text-xs font-semibold leading-relaxed">{error}</p>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-0.5">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Aditya Jambhale"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-0.5">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="name@company.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-0.5">Password</label>
                               <div className="relative group">
                                   <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                   <input
                                       name="password"
                                       type="password"
                                       value={formData.password}
                                       onChange={handleChange}
                                       required
                                       placeholder="••••••••"
                                       className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                                   />
                               </div>
                           </div>
                           <div className="space-y-2">
                               <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-0.5">Confirm</label>
                               <div className="relative">
                                   <Lock className="absolute left-3-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                   <input
                                       name="confirmPassword"
                                       type="password"
                                       value={formData.confirmPassword}
                                       onChange={handleChange}
                                       required
                                       placeholder="••••••••"
                                       className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                                   />
                               </div>
                           </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-0.5">Operational Role</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <select 
                                   name="role"
                                   value={formData.role}
                                   onChange={handleChange}
                                   className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm appearance-none"
                                >
                                   <option value="Intern">Intern</option>
                                   <option value="Freelancer">Freelancer</option>
                                   <option value="Contractor">Contractor</option>
                                   <option value="Associate">Associate</option>
                                   <option value="Lead Dev">Lead Dev</option>
                                </select>
                                <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group mt-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                  <span>Create Account</span>
                                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <SocialAuth />

                    <div className="text-center pt-2">
                       <p className="text-xs font-medium text-slate-500">
                          Already registered? <Link href="/user/signin" className="text-indigo-600 font-bold hover:underline">Sign in</Link>
                       </p>
                    </div>
                </div>
                
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">By creating an account, you agree to WorkSync's Operational Guidelines &bull; Core Encryption Active</p>
            </div>
        </div>
    );
}
