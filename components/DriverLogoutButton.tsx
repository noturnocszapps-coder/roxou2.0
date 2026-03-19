"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function DriverLogoutButton() {
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Use window.location.href for maximum reliability
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      // Fallback redirect
      window.location.href = "/login";
    }
  };

  return (
    <div className="w-full relative z-[999] pointer-events-auto">
      <button
        type="button"
        onClick={handleLogout}
        className="w-full py-5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-full font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl text-roxou-text-muted hover:text-red-500"
      >
        <LogOut className="w-5 h-5" />
        Sair
      </button>
    </div>
  );
}
