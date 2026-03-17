"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Zap, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";

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
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-roxou-bg">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-green-500 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-display font-extrabold">Pedido Publicado!</h1>
          <p className="text-roxou-text-muted">Motoristas interessados entrarão em contato em breve.</p>
        </div>
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Origin */}
          <div className="space-y-2">
            <label className="text-xs text-roxou-text-muted uppercase font-bold tracking-widest ml-1">Para onde você vai?</label>
            <input 
              required
              type="text"
              placeholder="Ex: Bar do Zé, Evento X..."
              className="w-full p-5 rounded-2xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all placeholder:text-roxou-text-muted/50"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            />
          </div>

          {/* Departure Time */}
          <div className="space-y-2">
            <label className="text-xs text-roxou-text-muted uppercase font-bold tracking-widest ml-1">Que horas pretende sair?</label>
            <input 
              required
              type="text"
              placeholder="Ex: 22:30, Agora..."
              className="w-full p-5 rounded-2xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all placeholder:text-roxou-text-muted/50"
              value={formData.departure_time}
              onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs text-roxou-text-muted uppercase font-bold tracking-widest ml-1">Observações (Opcional)</label>
            <textarea 
              rows={3}
              placeholder="Ex: Estou com mais 2 amigos, levo mala pequena..."
              className="w-full p-5 rounded-2xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all placeholder:text-roxou-text-muted/50 resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Return Trip */}
          <div className="flex items-center gap-3 p-5 rounded-2xl bg-roxou-surface border border-roxou-border">
            <input 
              type="checkbox"
              id="is_return"
              className="w-6 h-6 rounded-lg bg-roxou-bg border border-roxou-border checked:bg-roxou-primary transition-all"
              checked={formData.is_return}
              onChange={(e) => setFormData({ ...formData, is_return: e.target.checked })}
            />
            <label htmlFor="is_return" className="font-medium">Preciso de volta também</label>
          </div>

          {/* Legal Disclaimer - Compact Version */}
          <div className="p-6 rounded-3xl bg-roxou-primary/5 border border-roxou-primary/10 space-y-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-roxou-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-roxou-primary uppercase tracking-wider mb-2">Aviso Legal — Roxou</h4>
                <p className="text-xs text-roxou-text-muted leading-relaxed">
                  O Roxou Transporte conecta passageiros e motoristas. Valores, negociação e execução da viagem são definidos diretamente entre as partes.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-roxou-primary/10">
              <input 
                required
                type="checkbox"
                id="accepted_terms"
                className="w-5 h-5 rounded-lg bg-roxou-bg border border-roxou-border checked:bg-roxou-primary transition-all"
                checked={formData.accepted_terms}
                onChange={(e) => setFormData({ ...formData, accepted_terms: e.target.checked })}
              />
              <label htmlFor="accepted_terms" className="text-xs font-medium">Li e aceito os termos</label>
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
