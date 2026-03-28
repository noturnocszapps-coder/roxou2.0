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
  ChevronRight, 
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Car,
  Repeat
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
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

  // Form State
  const [formData, setFormData] = useState({
    origin: "",
    departure_time: "",
    notes: "",
    is_return: false,
    accepted_terms: false,
  });

  // Event Context State
  const [eventContext, setEventContext] = useState<{
    id: string | null;
    nome: string | null;
    origem: string | null;
  }>({ id: null, nome: null, origem: null });

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

    if (eventoId || eventoNome || origem) {
      setEventContext({ 
        id: eventoId, 
        nome: eventoNome,
        origem: origem
      });
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-10 max-w-sm w-full"
        >
          <div className="relative w-32 h-32 mx-auto">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-full h-full bg-roxou-primary/20 rounded-[48px] flex items-center justify-center violet-glow"
            >
              <Zap className="text-roxou-primary w-16 h-16 fill-current" />
            </motion.div>
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-roxou-primary rounded-[48px] -z-10"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-display font-black tracking-tight text-white">Pedido enviado! 🚀</h1>
            <p className="text-roxou-text-muted text-lg font-medium">Agora é só aguardar um motorista aceitar seu rolê.</p>
          </div>

          <button 
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
            className="w-full py-5 bg-roxou-surface border border-roxou-border text-white rounded-[32px] font-black text-lg hover:bg-roxou-primary transition-all active:scale-95 shadow-2xl"
          >
            Voltar para o Início
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-roxou-bg pb-32">
      {/* Header */}
      <header className="glass sticky top-0 z-40 py-4 px-6 border-b border-roxou-border/50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <h1 className="text-xl font-display font-black text-white tracking-tight">Novo Pedido</h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Pista Ativa</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-8">
        {/* Event Context Card */}
        <AnimatePresence>
          {eventContext.nome && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-roxou-primary/20 to-violet-600/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6 rounded-[40px] bg-roxou-surface/40 backdrop-blur-xl border border-roxou-primary/30 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-20 h-20 text-roxou-primary" />
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-roxou-primary/20 flex items-center justify-center flex-shrink-0 border border-roxou-primary/30">
                    <Calendar className="w-6 h-6 text-roxou-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-roxou-primary uppercase tracking-[0.2em]">Indo para o evento</p>
                    <h3 className="text-2xl font-display font-black text-white leading-tight">{eventContext.nome}</h3>
                    {eventContext.origem && (
                      <p className="text-xs text-roxou-text-muted font-medium flex items-center gap-1.5 mt-2">
                        <MapPin className="w-3 h-3" />
                        Saindo de: <span className="text-white">{eventContext.origem}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Title */}
        <div className="space-y-2">
          <h2 className="text-4xl font-display font-black text-white tracking-tight leading-none">
            Bora pro <span className="text-transparent bg-clip-text bg-gradient-to-r from-roxou-primary to-violet-400">rolê?</span>
          </h2>
          <p className="text-roxou-text-muted font-medium">Preencha os detalhes e encontre um motorista agora.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Destination */}
          <div className="space-y-3 group">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] text-roxou-primary uppercase font-black tracking-[0.25em] opacity-80 group-focus-within:opacity-100 transition-opacity">Destino Final</label>
              {eventContext.nome && (
                <span className="text-[9px] font-black bg-roxou-primary/20 text-roxou-primary px-2 py-0.5 rounded-full uppercase tracking-widest border border-roxou-primary/30">Evento Sugerido</span>
              )}
            </div>
            <div className="relative">
              <input 
                required
                type="text"
                placeholder="Ex: Arena Club, Bar do Juarez..."
                className="w-full p-6 rounded-[32px] bg-roxou-surface/50 border border-roxou-border focus:border-roxou-primary focus:ring-1 focus:ring-roxou-primary/50 outline-none transition-all placeholder:text-roxou-text-muted/20 text-lg font-bold text-white shadow-inner"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-roxou-primary/10 flex items-center justify-center border border-roxou-primary/20">
                <MapPin className="w-5 h-5 text-roxou-primary" />
              </div>
            </div>
          </div>

          {/* Departure Time */}
          <div className="space-y-3">
            <label className="text-[10px] text-roxou-primary uppercase font-black tracking-[0.25em] ml-1 opacity-80">Horário de Partida</label>
            <RoxouDateTimePicker 
              value={formData.departure_time}
              onChange={(val) => setFormData({ ...formData, departure_time: val })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-3 group">
            <label className="text-[10px] text-roxou-primary uppercase font-black tracking-[0.25em] ml-1 opacity-80 group-focus-within:opacity-100 transition-opacity">Detalhes do Grupo</label>
            <div className="relative">
              <textarea 
                rows={3}
                placeholder="Ex: 3 pessoas, saindo da portaria..."
                className="w-full p-6 rounded-[32px] bg-roxou-surface/50 border border-roxou-border focus:border-roxou-primary focus:ring-1 focus:ring-roxou-primary/50 outline-none transition-all placeholder:text-roxou-text-muted/20 resize-none text-base font-medium text-white shadow-inner"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
              <div className="absolute right-6 top-6 w-10 h-10 rounded-2xl bg-roxou-primary/10 flex items-center justify-center border border-roxou-primary/20">
                <Users className="w-5 h-5 text-roxou-primary" />
              </div>
            </div>
          </div>

          {/* Return Trip Toggle */}
          <div 
            onClick={() => setFormData({ ...formData, is_return: !formData.is_return })}
            className={`flex items-center justify-between p-6 rounded-[32px] border transition-all cursor-pointer group select-none ${
              formData.is_return 
                ? 'bg-roxou-primary/10 border-roxou-primary shadow-[0_0_30px_rgba(124,58,237,0.15)]' 
                : 'bg-roxou-surface/50 border-roxou-border hover:border-roxou-primary/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                formData.is_return ? 'bg-roxou-primary text-white' : 'bg-roxou-bg text-roxou-text-muted'
              }`}>
                <Repeat className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-lg text-white">Quero ida e volta 🚗🔁</p>
                <p className="text-[10px] text-roxou-text-muted uppercase tracking-widest">Garante sua volta com segurança</p>
              </div>
            </div>
            <div className={`w-14 h-8 rounded-full p-1 transition-all ${
              formData.is_return ? 'bg-roxou-primary' : 'bg-roxou-bg border border-roxou-border'
            }`}>
              <motion.div 
                animate={{ x: formData.is_return ? 24 : 0 }}
                className="w-6 h-6 rounded-full bg-white shadow-lg"
              />
            </div>
          </div>

          {/* Conversion Block */}
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-xs font-black text-roxou-primary animate-pulse">⚡</span>
            <p className="text-xs font-black text-roxou-primary uppercase tracking-[0.2em]">Alta chance de encontrar motorista agora</p>
          </div>

          {/* Security Block */}
          <div className="p-8 rounded-[40px] bg-roxou-surface/30 border border-roxou-border space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="w-32 h-32 text-white" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-lg font-display font-black text-white tracking-tight">Segurança Roxou</h4>
                <p className="text-[10px] text-roxou-text-muted uppercase tracking-widest">Sua integridade é prioridade</p>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                "Negociação direta com o motorista",
                "Você escolhe com quem ir (veja o perfil)",
                "Priorize locais seguros e iluminados"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-roxou-text-muted font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-roxou-primary" />
                  {item}
                </li>
              ))}
            </ul>
            
            <div 
              onClick={() => setFormData({ ...formData, accepted_terms: !formData.accepted_terms })}
              className="flex items-center gap-4 pt-6 border-t border-roxou-border cursor-pointer group"
            >
              <div className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
                formData.accepted_terms ? 'bg-roxou-primary border-roxou-primary' : 'bg-roxou-bg border-roxou-border'
              }`}>
                {formData.accepted_terms && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer select-none text-white opacity-80 group-hover:opacity-100">Aceito os termos e avisos</label>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[32px] text-sm font-bold flex items-center gap-4"
            >
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Spacer for fixed button */}
          <div className="h-20" />
        </form>
      </main>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-roxou-bg via-roxou-bg/95 to-transparent z-50">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-roxou-primary via-roxou-secondary to-pink-500 text-white rounded-[32px] font-black text-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-[0_20px_50px_rgba(157,78,221,0.3)] violet-glow group"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-6 h-6 fill-current group-hover:animate-bounce" />
                <span>Encontrar motorista agora</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
