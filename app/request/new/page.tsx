"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { 
  ArrowLeft, 
  Zap, 
  Info, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  ChevronRight, 
  Sparkles 
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import RoxouDateTimePicker from "@/components/RoxouDateTimePicker";

export default function NewRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-roxou-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Zap className="w-12 h-12 text-roxou-primary animate-pulse" />
          <p className="text-[10px] font-black text-roxou-primary uppercase tracking-[0.2em]">Carregando pista...</p>
        </div>
      </div>
    }>
      <NewRequestForm />
    </Suspense>
  );
}

function NewRequestForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const [eventContext, setEventContext] = useState<{
    id: string | null;
    nome: string | null;
  }>({ id: null, nome: null });

  useEffect(() => {
    const destino = searchParams.get("destino");
    const origem = searchParams.get("origem");
    const eventoId = searchParams.get("evento_id");
    const eventoNome = searchParams.get("evento_nome");

    if (destino || origem) {
      setFormData(prev => ({
        ...prev,
        origin: destino || prev.origin,
        notes: origem ? `Saindo de: ${origem}. ${prev.notes}`.trim() : prev.notes
      }));
    }

    if (eventoId || eventoNome) {
      setEventContext({ id: eventoId, nome: eventoNome });
    }
  }, [searchParams]);

  const formatForDB = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const time = date.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit",
      timeZone: "America/Sao_Paulo"
    });
    return date.toLocaleDateString("pt-BR", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric",
      timeZone: "America/Sao_Paulo"
    }) + ` às ${time}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accepted_terms) {
      setError("Você deve aceitar o aviso legal para continuar.");
      return;
    }

    if (!formData.departure_time) {
      setError("Por favor, selecione o horário de partida.");
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
        departure_time: formatForDB(formData.departure_time),
        notes: formData.notes,
        is_return: formData.is_return,
        status: "open",
        description: eventContext.nome ? { 
          evento_nome: eventContext.nome, 
          evento_id: eventContext.id 
        } : null
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
            <button 
              onClick={() => {
                router.push("/dashboard");
                router.refresh();
              }}
              className="block w-full py-5 bg-roxou-surface border border-roxou-border text-white rounded-full font-bold text-lg hover:bg-roxou-primary hover:border-roxou-primary transition-all active:scale-95 shadow-xl"
            >
              Voltar para dashboard
            </button>
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

      <main className="max-w-2xl mx-auto px-6 pt-10 pb-20">
        {eventContext.nome && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-[32px] bg-roxou-primary/10 border border-roxou-primary/20 flex items-center gap-4 shadow-xl shadow-roxou-primary/5"
          >
            <div className="w-12 h-12 rounded-2xl bg-roxou-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-roxou-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-roxou-primary uppercase tracking-widest">Você está indo para:</p>
              <p className="text-xl font-display font-black text-white">{eventContext.nome}</p>
            </div>
          </motion.div>
        )}

        <div className="mb-12">
          <h2 className="text-4xl font-display font-black mb-3 tracking-tight">Para onde é o <span className="text-transparent bg-clip-text bg-gradient-to-r from-roxou-primary to-violet-400">rolê?</span></h2>
          <p className="text-roxou-text-muted font-medium">Informe seu destino e horário para que os motoristas te encontrem na pista.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Origin */}
          <div className="space-y-3 group">
            <label className="text-[10px] text-roxou-primary uppercase font-black tracking-[0.25em] ml-1 opacity-80 group-focus-within:opacity-100 transition-opacity">Destino Final</label>
            <div className="relative">
              <input 
                required
                type="text"
                placeholder="Ex: Arena Club, Bar do Juarez, Casa do Amigo..."
                className="w-full p-6 rounded-[32px] bg-roxou-surface/50 border border-roxou-border focus:border-roxou-primary focus:ring-1 focus:ring-roxou-primary/50 outline-none transition-all placeholder:text-roxou-text-muted/20 text-lg font-medium shadow-inner"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-roxou-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-roxou-primary/60" />
              </div>
            </div>
          </div>

          {/* Departure Time */}
          <RoxouDateTimePicker 
            value={formData.departure_time}
            onChange={(val) => setFormData({ ...formData, departure_time: val })}
          />

          {/* Notes */}
          <div className="space-y-3 group">
            <label className="text-[10px] text-roxou-primary uppercase font-black tracking-[0.25em] ml-1 opacity-80 group-focus-within:opacity-100 transition-opacity">Detalhes do Grupo (Opcional)</label>
            <textarea 
              rows={3}
              placeholder="Ex: Estamos em 3 pessoas, saindo da portaria, levo mochila..."
              className="w-full p-6 rounded-[32px] bg-roxou-surface/50 border border-roxou-border focus:border-roxou-primary focus:ring-1 focus:ring-roxou-primary/50 outline-none transition-all placeholder:text-roxou-text-muted/20 resize-none text-base font-medium shadow-inner"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Return Trip */}
          <div 
            onClick={() => setFormData({ ...formData, is_return: !formData.is_return })}
            className={`flex items-center gap-4 p-6 rounded-[32px] border transition-all cursor-pointer group ${
              formData.is_return 
                ? 'bg-roxou-primary/10 border-roxou-primary shadow-[0_0_20px_rgba(124,58,237,0.1)]' 
                : 'bg-roxou-surface/50 border-roxou-border hover:border-roxou-primary/30'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
              formData.is_return ? 'bg-roxou-primary border-roxou-primary' : 'bg-roxou-bg border-roxou-border'
            }`}>
              {formData.is_return && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <label className="font-bold text-lg cursor-pointer flex-grow select-none">Vou precisar de volta também</label>
          </div>

          {/* Legal Disclaimer */}
          <div className="p-6 rounded-[32px] bg-roxou-surface/30 border border-roxou-border">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-roxou-primary/10 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-roxou-primary" />
              </div>
              <p className="text-xs text-roxou-text-muted leading-relaxed">
                O Roxou é uma plataforma de conexão. Negocie valores e detalhes diretamente com o motorista. Segurança em primeiro lugar.
              </p>
            </div>
            <div 
              onClick={() => setFormData({ ...formData, accepted_terms: !formData.accepted_terms })}
              className="flex items-center gap-3 pt-6 border-t border-roxou-border cursor-pointer group"
            >
              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                formData.accepted_terms ? 'bg-roxou-primary border-roxou-primary' : 'bg-roxou-bg border-roxou-border'
              }`}>
                {formData.accepted_terms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <label className="text-xs font-black uppercase tracking-[0.15em] cursor-pointer select-none opacity-80 group-hover:opacity-100">Aceito os termos e avisos</label>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-bold flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-roxou-primary to-roxou-secondary text-white rounded-[32px] font-black text-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-2xl shadow-roxou-primary/30 violet-glow"
          >
            <Zap className="w-6 h-6 fill-current" />
            {loading ? "Publicando..." : "Publicar Pedido"}
          </button>
        </form>
      </main>
    </div>
  );
}
