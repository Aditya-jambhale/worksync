"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SocialAuth from '@/app/components/SocialAuth';
import supabase from '@/app/DB/dbConnect';
import { useEffect } from 'react';

export default function SigninPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle hash-based OAuth (Implicit Flow) fallback
    useEffect(() => {
        const checkSession = async () => {
            // Log for debugging
            if (window.location.hash && window.location.hash.includes('access_token')) {
                console.log('Detected OAuth hash, synchronizing session...');
                setLoading(true);
                
                // Small delay to ensure Supabase client is ready
                await new Promise(resolve => setTimeout(resolve, 500));
                
                try {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    if (session) {
                        console.log('Session synchronized successfully!');
                        
                        // 1. Fetch user detail to get internal userId
                        let { data: userData } = await supabase
                            .from('users')
                            .select('userId')
                            .eq('email', session.user.email)
                            .single();
                            
                        const avatarUrl = session.user.user_metadata.avatar_url || session.user.user_metadata.picture;
                        const fullName = session.user.user_metadata.full_name || session.user.user_metadata.name || session.user.email.split('@')[0];
                        let finalUserId = userData?.userId;

                        // 2. Sync Social Info
                        if (userData) {
                            // UPDATE existing user with latest info
                            await supabase.from('users')
                                .update({ name: fullName, avatar_url: avatarUrl })
                                .eq('email', session.user.email);
                        } else {
                            // INSERT new social user
                            finalUserId = uuidv4();
                            await supabase.from('users').insert([{
                                userId: finalUserId,
                                name: fullName,
                                email: session.user.email,
                                password: 'social_auth_user',
                                role: 'Intern',
                                avatar_url: avatarUrl
                            }]);
                        }
                            
                        // 3. Prepare legacy session data
                        const sessionData = JSON.stringify({ 
                            token: uuidv4(), 
                            userId: finalUserId || session.user.id, 
                            role: "user" 
                        });
                        
                        // 4. Set the cookie so the Dashboard and APIs work
                        Cookies.set('user_session_token', sessionData, { expires: 7 });

                        // 5. CLEAR THE URL (Wipe hash and params to prevent loops)
                        window.history.replaceState({}, document.title, window.location.pathname);

                        toast.success('Social Login Successful!', { icon: '🔑' });
                        router.push('/user/Dashboard');
                    } else if (error) {
                        console.error('Auth error from hash:', error.message);
                        setError('Social login synchronization failed. Please try again.');
                    }
                } catch (err) {
                    console.error('Fatal hash auth error:', err);
                } finally {
                    setLoading(false);
                }
            }
        };
        checkSession();
    }, [router]);

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
            const response = await fetch('/api/users/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Invalid credentials');
            toast.success('Welcome back!');
            router.push('/user/Dashboard');
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
            
            <div className="w-full max-w-[400px] relative z-10 space-y-8">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="relative mb-4 group">
                        <div className="absolute -inset-1 bg-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center transition-transform hover:scale-105 duration-300">
                            <Image src="/logo.png" alt="WorkSync" width={28} height={28} className="object-contain" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950">Welcome back</h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        Enter your credentials to access your workspace
                    </p>
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
                            <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-0.5">
                                Work Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="name@company.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-0.5">
                                <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                    Password
                                </label>
                                <Link href="#" className="text-xs font-bold text-indigo-600 hover:underline underline-offset-4">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-0.5 py-1">
                            <div className="flex items-center h-5">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                            </div>
                            <label htmlFor="remember" className="text-[13px] font-medium text-slate-500 cursor-pointer select-none">
                                Keep me signed in
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                  <span>Sign in</span>
                                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <SocialAuth />

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-100" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
                            <span className="bg-white px-3 text-slate-400">Admin Portal</span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/admin/signin')}
                        className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98]"
                    >
                        Sign in as Administrator
                    </button>

                    <div className="text-center pt-2">
                       <p className="text-xs font-medium text-slate-500">
                          New to WorkSync? <Link href="/user/signup" className="text-indigo-600 font-bold hover:underline">Create Account</Link>
                       </p>
                    </div>
                </div>

                <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} WorkSync &bull; Secure Infrastructure
                </p>
            </div>
        </div>
    );
}