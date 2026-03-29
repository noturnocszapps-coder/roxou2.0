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
import AddressSearch from "@/components/AddressSearch";

export default function NewRequestPage() {
  return (
    <div className="min-h-screen bg-roxou-bg">
      <Suspense fallback={
        <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Zap className="w-12 h-12 text-roxou-primary animate-pulse" />
            <p className="text-[10px] font-black text-roxou-primary uppercase tracking-[0.2em]">Carregando pista...</p>
          </div>
        </div>
      }>
        <NewRequestForm />
      </Suspense>
    </div>
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
    pickup_address: "Minha Localização Atual",
    pickup_lat: null as number | null,
    pickup_lng: null as number | null,
    destination_address: "",
    destination_lat: null as number | null,
    destination_lng: null as number | null,
    departure_time: "",
    notes: "",
    is_return: false,
    accepted_terms: false,
  });

  const [isPickerOpen, setIsPickerOpen] = useState(false);

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
        destination_address: destino || prev.destination_address,
        pickup_address: origem || prev.pickup_address,
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

    if (!formData.destination_address) {
      setError("Por favor, informe o destino.");
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
        origin: formData.destination_address, // Keeping 'origin' as the destination string for backward compatibility if needed, but we should probably use a better name. Actually, let's stick to the schema.
        origin_lat: formData.pickup_lat,
        origin_lng: formData.pickup_lng,
        destination_lat: formData.destination_lat,
        destination_lng: formData.destination_lng,
        departure_time: formatForDB(formData.departure_time),
        notes: formData.notes,
        is_return: formData.is_return,
        status: "ABERTA",
        description: eventContext.nome ? { 
          evento_nome: eventContext.nome, 
          evento_id: eventContext.id,
          origem: formData.pickup_address,
          destino: formData.destination_address
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

  const isReady = formData.origin && formData.departure_time && formData.accepted_terms;

  return (
    <div className="min-h-screen bg-roxou-bg pb-44">
      {/* Header */}
      <header className="glass sticky top-0 z-40 py-3 px-6 border-b border-roxou-border/50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <h1 className="text-lg font-display font-black text-white tracking-tight">Novo Pedido</h1>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Pista Ativa</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-6 space-y-6">
        {/* Event Context Card */}
        <AnimatePresence>
          {eventContext.nome && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-roxou-primary/20 to-violet-600/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-4 rounded-3xl bg-roxou-surface/40 backdrop-blur-xl border border-roxou-primary/30 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Sparkles className="w-16 h-16 text-roxou-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-roxou-primary/20 flex items-center justify-center flex-shrink-0 border border-roxou-primary/30">
                    <Calendar className="w-5 h-5 text-roxou-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-roxou-primary uppercase tracking-[0.2em]">Indo para</p>
                    <h3 className="text-xl font-display font-black text-white leading-tight">{eventContext.nome}</h3>
                    {eventContext.origem && (
                      <p className="text-[10px] text-roxou-text-muted font-medium flex items-center gap-1 mt-1">
                        <MapPin className="w-2.5 h-2.5" />
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
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-black text-white tracking-tight leading-none">
            Bora pro <span className="text-transparent bg-clip-text bg-gradient-to-r from-roxou-primary to-violet-400">rolê?</span>
          </h2>
          <p className="text-xs text-roxou-text-muted font-medium">Preencha os detalhes e encontre um motorista.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pickup */}
          <AddressSearch 
            label="Local de Partida"
            placeholder="Onde você está?"
            value={formData.pickup_address}
            onChange={(val, coords) => setFormData({ 
              ...formData, 
              pickup_address: val,
              pickup_lat: coords?.lat ?? null,
              pickup_lng: coords?.lng ?? null
            })}
            onOpenChange={setIsPickerOpen}
          />

          {/* Destination */}
          <AddressSearch 
            label="Destino Final"
            placeholder="Para onde você vai?"
            value={formData.destination_address}
            onChange={(val, coords) => setFormData({ 
              ...formData, 
              destination_address: val,
              destination_lat: coords?.lat ?? null,
              destination_lng: coords?.lng ?? null
            })}
            onOpenChange={setIsPickerOpen}
            isEventPrefilled={!!eventContext.nome}
          />

          {/* Departure Time */}
          <RoxouDateTimePicker 
            value={formData.departure_time}
            onChange={(val) => setFormData({ ...formData, departure_time: val })}
            onOpenChange={setIsPickerOpen}
          />

          {/* Notes */}
          <div className="space-y-2 group">
            <label className="text-[9px] text-roxou-primary uppercase font-black tracking-[0.25em] ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">Detalhes do Grupo</label>
            <div className="relative">
              <textarea 
                rows={2}
                placeholder="Ex: 3 pessoas, saindo da portaria..."
                className="w-full p-4 pr-14 rounded-2xl bg-roxou-surface/50 border border-roxou-border focus:border-roxou-primary focus:ring-1 focus:ring-roxou-primary/50 outline-none transition-all placeholder:text-roxou-text-muted/20 resize-none text-sm font-medium text-white shadow-inner"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
              <div className="absolute right-4 top-4 w-8 h-8 rounded-xl bg-roxou-primary/10 flex items-center justify-center border border-roxou-primary/20">
                <Users className="w-4 h-4 text-roxou-primary" />
              </div>
            </div>
          </div>

          {/* Return Trip Toggle */}
          <div 
            onClick={() => setFormData({ ...formData, is_return: !formData.is_return })}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group select-none ${
              formData.is_return 
                ? 'bg-roxou-primary/10 border-roxou-primary/50 shadow-[0_0_20px_rgba(124,58,237,0.1)]' 
                : 'bg-roxou-surface/40 border-roxou-border hover:border-roxou-primary/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                formData.is_return ? 'bg-roxou-primary text-white' : 'bg-roxou-bg text-roxou-text-muted'
              }`}>
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-base text-white">Quero ida e volta</p>
                <p className="text-[9px] text-roxou-text-muted uppercase tracking-widest">Garante sua volta com segurança</p>
              </div>
            </div>
            <div className={`w-12 h-6.5 rounded-full p-1 transition-all ${
              formData.is_return ? 'bg-roxou-primary' : 'bg-roxou-bg border border-roxou-border'
            }`}>
              <motion.div 
                animate={{ x: formData.is_return ? 22 : 0 }}
                className="w-4.5 h-4.5 rounded-full bg-white shadow-lg"
              />
            </div>
          </div>

          {/* Conversion Block */}
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="text-[10px] font-black text-roxou-primary animate-pulse">⚡</span>
            <p className="text-[10px] font-black text-roxou-primary uppercase tracking-[0.2em]">Alta chance de encontrar motorista</p>
          </div>

          {/* Security Block */}
          <div className="p-6 rounded-3xl bg-roxou-surface/30 border border-roxou-border space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="w-24 h-24 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-base font-display font-black text-white tracking-tight">Segurança Roxou</h4>
                <p className="text-[9px] text-roxou-text-muted uppercase tracking-widest">Sua integridade é prioridade</p>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                "Negociação direta com o motorista",
                "Você escolhe com quem ir (veja o perfil)",
                "Priorize locais seguros e iluminados"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-xs text-roxou-text-muted font-medium">
                  <div className="w-1 h-1 rounded-full bg-roxou-primary" />
                  {item}
                </li>
              ))}
            </ul>
            
            <div 
              onClick={() => setFormData({ ...formData, accepted_terms: !formData.accepted_terms })}
              className="flex items-center gap-3 pt-4 border-t border-roxou-border cursor-pointer group"
            >
              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                formData.accepted_terms ? 'bg-roxou-primary border-roxou-primary' : 'bg-roxou-bg border-roxou-border'
              }`}>
                {formData.accepted_terms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] cursor-pointer select-none text-white opacity-70 group-hover:opacity-100">Aceito os termos e avisos</label>
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
      <AnimatePresence>
        {!isPickerOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-5 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-roxou-bg via-roxou-bg/95 to-transparent z-50"
          >
            <div className="max-w-2xl mx-auto">
              <button
                onClick={handleSubmit}
                disabled={loading || !isReady}
                className={`w-full py-4.5 bg-gradient-to-r from-roxou-primary via-roxou-secondary to-pink-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:scale-100 group relative overflow-hidden ${
                  isReady && !loading ? 'shadow-[0_20px_50px_rgba(157,78,221,0.4)] violet-glow scale-[1.02]' : 'shadow-none'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="animate-pulse">Buscando motoristas...</span>
                  </div>
                ) : (
                  <>
                    <Zap className={`w-5 h-5 fill-current transition-transform ${isReady ? 'group-hover:animate-bounce' : ''}`} />
                    <span>Encontrar motorista</span>
                    {isReady && (
                      <motion.div 
                        layoutId="ready-glow"
                        className="absolute inset-0 bg-white/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
