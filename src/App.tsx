import * as React from "react";
import { LoginForm } from "./components/LoginForm";
import { UserDashboard } from "./components/UserDashboard";
import { supabase } from "./lib/supabase";
import { type Session } from "@supabase/supabase-js";
import { Database, ShieldCheck } from "lucide-react";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = React.useState(true);
  const backgroundImage = "/src/assets/images/premium_abstract_background_1793968528616.jpg";

  React.useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoadingSession(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main 
      className="relative min-h-screen w-full flex items-center justify-center font-['Plus_Jakarta_Sans'] overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-white/15 backdrop-blur-[3px]"></div>
      </div>

      {/* Decorative Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#16A34A]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#16A34A]/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center py-12">
        {/* Brand & Supabase Header */}
        <header className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-9 h-9 rounded-xl bg-[#16A34A] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#16A34A]/25 transition-transform group-hover:scale-105">
              V
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#111827]">Veridian</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-emerald-100 shadow-xs text-xs text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
            <span className="font-medium">Supabase Auth Integrated</span>
          </div>
        </header>

        {isLoadingSession ? (
          <div className="w-full max-w-md px-6 flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-3 border-[#16A34A]/20 border-t-[#16A34A] rounded-full animate-spin"></div>
            <span className="text-xs text-gray-500 mt-4 font-medium">Verifying Supabase session...</span>
          </div>
        ) : session ? (
          <UserDashboard user={session.user} onSignOut={() => setSession(null)} />
        ) : (
          <LoginForm onSuccess={() => {}} />
        )}

        {/* Footer Links */}
        <footer className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-gray-500">
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
            <Database className="w-3 h-3" />
            Supabase Project: <span className="font-mono text-gray-700">thargrxgvnkswblezchd</span>
          </a>
          <span className="text-gray-300">·</span>
          <button type="button" className="hover:text-gray-800 transition-colors">Privacy Policy</button>
          <span className="text-gray-300">·</span>
          <button type="button" className="hover:text-gray-800 transition-colors">Terms of Service</button>
        </footer>
      </div>
    </main>
  );
}
