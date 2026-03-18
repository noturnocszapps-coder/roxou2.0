"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full bg-roxou-surface border border-roxou-border hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all text-sm font-bold group disabled:opacity-50 shadow-sm"
      title="Sair da conta"
    >
      <LogOut className="w-4 h-4 text-roxou-text-muted group-hover:text-red-500 group-hover:scale-110 transition-all" />
      <span className="hidden sm:inline">Sair</span>
    </button>
  );
}
