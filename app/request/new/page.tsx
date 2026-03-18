"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Zap, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function NewRequestPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    origin: "",
    departure_time: "",
    notes: "",
    is_return: false,
    accepted_terms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accepted_terms) {
      setError("Você deve aceitar o aviso legal para continuar.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error: insertError } = await supabase
      .from("transport_requests")
      .insert({
        passenger_id: user.id,
        origin: formData.origin,
        departure_time: formData.departure_time,
        notes: formData.notes,
        is_return: formData.is_return,
        status: "open",
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-roxou-bg overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center space-y-10 max-w-sm w-full"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="w-28 h-28 bg-roxou-primary/20 rounded-[48px] flex items-center justify-center mx-auto violet-glow relative"
          >
            <Zap className="text-roxou-primary w-14 h-14 fill-current" />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-roxou-primary rounded-[48px] -z-10"
            />
          </motion.div>

          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-display font-extrabold tracking-tight"
            >
              Pedido enviado 🚀
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-roxou-text-muted text-lg leading-relaxed px-4"
            >
              Agora é só aguardar um motorista aceitar seu rolê
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="pt-4"
          >
            <Link 
              href="/dashboard"
              className="block w-full py-5 bg-roxou-surface border border-roxou-border text-white rounded-full font-bold text-lg hover:bg-roxou-primary hover:border-roxou-primary transition-all active:scale-95 shadow-xl"
            >
              Voltar para dashboard
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-roxou-bg pb-20">
      <header className="glass sticky top-0 z-40 py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-display font-bold">Novo Pedido</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8">
        <div className="mb-10">
          <h2 className="text-3xl font-display font-extrabold mb-2">Para onde é o rolê?</h2>
          <p className="text-roxou-text-muted">Informe seu destino e horário para que os motoristas te encontrem.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Origin */}
          <div className="space-y-3">
            <label className="text-[10px] text-roxou-primary uppercase font-bold tracking-[0.2em] ml-1">Destino Final</label>
            <input 
              required
              type="text"
              placeholder="Ex: Arena Club, Bar do Juarez, Casa do Amigo..."
              className="w-full p-6 rounded-3xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all placeholder:text-roxou-text-muted/30 text-lg"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            />
          </div>

          {/* Departure Time */}
          <div className="space-y-3">
            <label className="text-[10px] text-roxou-primary uppercase font-bold tracking-[0.2em] ml-1">Horário de Partida</label>
            <input 
              required
              type="text"
              placeholder="Ex: 23:45, Agora, Daqui 30min..."
              className="w-full p-6 rounded-3xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all placeholder:text-roxou-text-muted/30 text-lg"
              value={formData.departure_time}
              onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="text-[10px] text-roxou-primary uppercase font-bold tracking-[0.2em] ml-1">Detalhes do Grupo (Opcional)</label>
            <textarea 
              rows={3}
              placeholder="Ex: Estamos em 3 pessoas, levo mochila, aguardo na portaria..."
              className="w-full p-6 rounded-3xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all placeholder:text-roxou-text-muted/30 resize-none text-base"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Return Trip */}
          <div className="flex items-center gap-4 p-6 rounded-3xl bg-roxou-surface border border-roxou-border hover:border-roxou-primary/30 transition-all cursor-pointer group">
            <input 
              type="checkbox"
              id="is_return"
              className="w-7 h-7 rounded-xl bg-roxou-bg border border-roxou-border checked:bg-roxou-primary transition-all cursor-pointer"
              checked={formData.is_return}
              onChange={(e) => setFormData({ ...formData, is_return: e.target.checked })}
            />
            <label htmlFor="is_return" className="font-bold text-lg cursor-pointer flex-grow">Vou precisar de volta também</label>
          </div>

          {/* Legal Disclaimer - Ultra Compact */}
          <div className="p-5 rounded-3xl bg-roxou-primary/5 border border-roxou-primary/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-roxou-primary/20 flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-roxou-primary" />
              </div>
              <p className="text-[10px] text-roxou-text-muted leading-tight">
                O Roxou é uma plataforma de conexão. Negocie valores e detalhes diretamente com o motorista.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-roxou-primary/10">
              <input 
                required
                type="checkbox"
                id="accepted_terms"
                className="w-5 h-5 rounded-lg bg-roxou-bg border border-roxou-border checked:bg-roxou-primary transition-all cursor-pointer"
                checked={formData.accepted_terms}
                onChange={(e) => setFormData({ ...formData, accepted_terms: e.target.checked })}
              />
              <label htmlFor="accepted_terms" className="text-xs font-bold uppercase tracking-wider cursor-pointer">Aceito os termos e avisos</label>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-roxou-primary text-white rounded-full font-bold text-xl flex items-center justify-center gap-3 hover:bg-roxou-primary/90 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-2xl shadow-roxou-primary/20"
          >
            <Zap className="w-6 h-6 fill-current" />
            {loading ? "Publicando..." : "Publicar Pedido"}
          </button>
        </form>
      </main>
    </div>
  );
}
