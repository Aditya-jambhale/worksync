"use client";
import React, { useState } from 'react';
import supabase from '@/app/DB/dbConnect';
import { toast } from 'react-hot-toast';
import { Github, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function SocialAuth() {
    const [loading, setLoading] = useState({ google: false, github: false });

    const handleOAuthSignIn = async (provider) => {
        setLoading(prev => ({ ...prev, [provider]: true }));
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    // Redirect back to the auth callback handler
                    redirectTo: `${window.location.origin}/auth/callback`,
                },  
            });

            if (error) throw error;
        } catch (error) {
            toast.error(`Error: ${error.message}`);
            setLoading(prev => ({ ...prev, [provider]: false }));
        }
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
                    <span className="bg-white px-3 text-slate-400">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={loading.google}
                    className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70"
                >
                    {loading.google ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Image 
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                                alt="Google" 
                                width={18} 
                                height={18} 
                            />
                            <span>Google</span>
                        </>
                    )}
                </button>

                <button
                    onClick={() => handleOAuthSignIn('github')}
                    disabled={loading.github}
                    className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70"
                >
                    {loading.github ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Github className="h-[18px] w-[18px] text-[#24292e]" />
                            <span>GitHub</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
