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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showTestLogin, setShowTestLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === "Invalid login credentials" ? "Credenciais inválidas." : authError.message);
      setLoading(false);
    } else {
      // Middleware will handle redirection after session is established
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-roxou-bg">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-roxou-primary/10 blur-[100px] rounded-full -z-10" />
      
      <div className="w-full max-w-md p-8 sm:p-10 rounded-[40px] bg-roxou-surface border border-roxou-border violet-glow text-center">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-roxou-primary rounded-2xl flex items-center justify-center">
            <Zap className="text-white w-8 h-8 sm:w-10 sm:h-10 fill-current" />
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold mb-3 sm:mb-4">Bem-vindo à Roxou</h1>
        <p className="text-sm sm:text-base text-roxou-text-muted mb-8 sm:mb-10">Acesse sua conta para continuar sua jornada urbana.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white text-roxou-bg rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/90 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-xl"
          >
            <Chrome className="w-6 h-6" />
            {loading && !showTestLogin ? "Conectando..." : "Entrar com Google"}
          </button>

          <div className="pt-4">
            {!showTestLogin ? (
              <button 
                onClick={() => setShowTestLogin(true)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-roxou-text-muted hover:text-roxou-primary transition-colors"
              >
                Acesso de teste
              </button>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-3">
                  <input 
                    type="email"
                    placeholder="Email de teste"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-roxou-bg border border-roxou-border text-white placeholder:text-roxou-text-muted/50 focus:border-roxou-primary outline-none transition-all"
                  />
                  <input 
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-roxou-bg border border-roxou-border text-white placeholder:text-roxou-text-muted/50 focus:border-roxou-primary outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-roxou-surface border border-roxou-primary text-roxou-primary rounded-full font-bold text-lg hover:bg-roxou-primary hover:text-white transition-all disabled:opacity-50"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowTestLogin(false)}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-roxou-text-muted hover:text-white transition-colors"
                >
                  Voltar para Google
                </button>
              </form>
            )}
          </div>
        </div>
        
        <p className="mt-8 text-[10px] sm:text-xs text-roxou-text-muted leading-relaxed">
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
