"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Check,
  LayoutDashboard,
  Clock,
  Zap,
  Github
} from 'lucide-react';
import Footer from '@/app/components/Footer/Footer';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-zinc-100 selection:text-zinc-900">
      {/* Navbar (Shadcn inspired) */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md border-b border-zinc-100 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-zinc-900 rounded-md flex items-center justify-center transition-transform group-hover:rotate-12">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight">WorkSync</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {["Product", "Solutions", "About"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/user/signin')}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-950 px-3 py-1.5 transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={() => router.push('/user/signin')}
              className="bg-zinc-900 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors active:scale-95 shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section (Side-by-Side Grid) */}
      <main className="pt-20 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Content */}
          <div className="text-left space-y-8 relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-full animate-fade-in opacity-0 [animation-fill-mode:forwards]">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-none">V2.0 is now live</span>
              <div className="w-px h-3 bg-zinc-200" />
              <span className="text-[11px] font-bold text-zinc-900">Startups OS</span>
            </div>

            {/* headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.05]">
                Know what your team <br />
                actually did <span className="text-zinc-400">today.</span>
              </h1>
              <p className="text-lg text-zinc-500 max-w-xl leading-relaxed font-medium">
                Execution visibility for early-stage startups. Track tasks, shifts, and team activity without the overhead of heavy HR tools.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button 
                onClick={() => router.push('/user/signin')}
                className="w-full sm:w-auto bg-zinc-900 text-zinc-50 px-8 py-4 rounded-md font-bold text-base hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-200"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-md font-bold text-zinc-600 hover:bg-zinc-50 transition-all border border-zinc-200">
                Take a Tour
              </button>
            </div>
          </div>

          {/* Right Side: Hero Image */}
          <div className="relative">
            <div className="absolute -inset-1 blur-3xl bg-gradient-to-tr from-zinc-200 via-transparent to-zinc-100 opacity-50 -z-10" />
            <div className="bg-white rounded-xl border border-zinc-200 shadow-[0_30px_60px_rgba(0,0,0,0.08)] overflow-hidden lg:scale-105 transition-transform duration-500 hover:scale-[1.07]">
              <div className="h-10 bg-zinc-50 border-b border-zinc-100 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                </div>
                <div className="mx-auto text-[9px] uppercase font-black text-zinc-300 tracking-[0.25em]">Command Center</div>
              </div>
              <img 
                src="/shifts.png" 
                alt="WorkSync App Preview" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Core Value Props (Minimalist) */}
      <section id="product" className="py-24 px-6 border-t border-zinc-100 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-16">
          {[
            { 
              icon: <LayoutDashboard className="w-5 h-5" />, 
              title: "Transparency First", 
              desc: "Every shift and task is logged in a clean, unified feed. No more mystery updates." 
            },
            { 
              icon: <Clock className="w-5 h-5" />, 
              title: "Shift-based Logs", 
              desc: "Track execution time by sessions. Simple, session-driven tracking for remote teams." 
            },
            { 
              icon: <Zap className="w-5 h-5" />, 
              title: "High Velocity", 
              desc: "Built for speed. No 40-field forms. Just execute, log, and move to the next thing." 
            },
          ].map((item, i) => (
            <div key={i} className="space-y-4">
              <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-50 shadow-sm">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-zinc-900">{item.title}</h3>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Simple CTA before footer */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900">
            Stop guessing. <br />
            Start executing.
          </h2>
          <p className="text-base text-zinc-500 font-medium leading-relaxed">
            Join 200+ founders who use WorkSync to keep their teams aligned and accountable every single day.
          </p>
          <button 
            onClick={() => router.push('/user/signin')}
            className="inline-flex items-center gap-2 bg-zinc-900 text-zinc-50 px-6 py-3 rounded-md font-bold text-sm hover:bg-zinc-800 transition-all"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out 0.2s;
        }
      `}</style>
    </div>
  );
}