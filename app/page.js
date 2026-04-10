"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userResponse = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${Cookies.get('user_session_token')}` }
        });
        if (userResponse.ok) {
          router.push('/user/Dashboard');
        } else {
          router.push('/user/signin');
        }
      } catch (err) {
        router.push('/user/signin');
      }
    };
    fetchUserDetails();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
         <div className="w-10 h-10 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Workspace</p>
      </div>
    </div>
  );
}