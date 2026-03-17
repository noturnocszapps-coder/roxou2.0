"use client";

import { createClient } from "@/lib/supabase/client";
import { Zap, Chrome } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Suspense } from "react";

function LoginContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-roxou-bg">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-roxou-primary/10 blur-[100px] rounded-full -z-10" />
      
      <div className="w-full max-w-md p-10 rounded-[40px] bg-roxou-surface border border-roxou-border violet-glow text-center">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-roxou-primary rounded-2xl flex items-center justify-center">
            <Zap className="text-white w-10 h-10 fill-current" />
          </div>
        </div>
        
        <h1 className="text-3xl font-display font-extrabold mb-4">Bem-vindo à Roxou</h1>
        <p className="text-roxou-text-muted mb-10">Acesse sua conta para continuar sua jornada urbana.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-white text-roxou-bg rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/90 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
        >
          <Chrome className="w-6 h-6" />
          {loading ? "Conectando..." : "Entrar com Google"}
        </button>
        
        <p className="mt-8 text-xs text-roxou-text-muted leading-relaxed">
          Ao entrar, você concorda com nossos <br />
          <a href="/terms" className="text-roxou-primary hover:underline">Termos de Uso</a> e <a href="/privacy" className="text-roxou-primary hover:underline">Privacidade</a>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-roxou-bg">
        <Zap className="w-12 h-12 text-roxou-primary animate-pulse" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
