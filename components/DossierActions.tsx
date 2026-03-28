"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  UserX
} from "lucide-react";

interface DossierActionsProps {
  driverId: string;
  adminId: string;
  initialStatus: string;
  initialNote: string;
}

export default function DossierActions({ driverId, adminId, initialStatus, initialNote }: DossierActionsProps) {
  const supabase = createClient();
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState(initialNote);
  const [loading, setLoading] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleUpdateStatus = async (newStatus: string, finalNote?: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("drivers")
      .upsert({
        user_id: driverId,
        verification_status: newStatus,
        admin_review_note: finalNote || note,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (!error) {
      // Insert moderation log
      await supabase
        .from("moderation_logs")
        .insert({
          driver_id: driverId,
          admin_id: adminId,
          action: newStatus,
          reason: finalNote || note
        });

      setStatus(newStatus);
      if (finalNote) setNote(finalNote);
      router.refresh();
      setShowRejectReason(false);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10">
      {/* Current Status Banner */}
      <div className={`p-6 rounded-3xl border flex items-center gap-4 ${
        status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
        status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
        status === 'in_review' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
        'bg-roxou-primary/10 border-roxou-primary/20 text-roxou-primary'
      }`}>
        {status === 'approved' ? <ShieldCheck className="w-6 h-6" /> :
         status === 'rejected' ? <UserX className="w-6 h-6" /> :
         status === 'in_review' ? <AlertCircle className="w-6 h-6" /> :
         <Clock className="w-6 h-6" />}
        <div className="flex-grow">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Atual</p>
          <p className="text-sm font-bold">
            {status === 'approved' ? 'Motorista Aprovado e Verificado' :
             status === 'rejected' ? 'Cadastro Rejeitado' :
             status === 'in_review' ? 'Documentação em Análise' :
             'Aguardando Primeira Revisão'}
          </p>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-roxou-text-muted flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5" />
          Notas de Revisão Interna
        </label>
        <textarea 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Adicione observações sobre este motorista..."
          className="w-full h-32 px-6 py-4 rounded-3xl bg-roxou-bg border border-roxou-border outline-none text-sm text-white placeholder:text-roxou-text-muted/30 focus:border-roxou-primary transition-all resize-none"
        />
        <button 
          onClick={() => handleUpdateStatus(status)}
          disabled={loading || note === initialNote}
          className="px-6 py-3 rounded-2xl bg-roxou-bg border border-roxou-border text-[10px] font-black uppercase tracking-widest hover:bg-roxou-surface transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Salvar Nota"}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="pt-8 border-t border-roxou-border/50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            disabled={loading || status === 'approved'}
            onClick={() => handleUpdateStatus("approved")}
            className="px-8 py-5 rounded-3xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            Aprovar
          </button>

          <button 
            disabled={loading || status === 'in_review'}
            onClick={() => handleUpdateStatus("in_review")}
            className="px-8 py-5 rounded-3xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all disabled:opacity-50 shadow-xl shadow-amber-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
            Análise
          </button>

          <button 
            disabled={loading || status === 'rejected'}
            onClick={() => setShowRejectReason(true)}
            className="px-8 py-5 rounded-3xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all disabled:opacity-50 shadow-xl shadow-red-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
            Rejeitar
          </button>
        </div>

        {/* Rejection Modal/Overlay */}
        {showRejectReason && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg rounded-[48px] bg-roxou-surface border border-roxou-border p-10 sm:p-12 space-y-8 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h4 className="text-xl font-display font-black text-white">Motivo da Rejeição</h4>
                  <p className="text-xs text-roxou-text-muted">Informe o motivo para o motorista</p>
                </div>
              </div>

              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: Documentação da CNH vencida ou veículo não condiz com as diretrizes..."
                className="w-full h-40 px-6 py-4 rounded-3xl bg-roxou-bg border border-roxou-border outline-none text-sm text-white placeholder:text-roxou-text-muted/30 focus:border-red-500 transition-all resize-none"
              />

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowRejectReason(false)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-roxou-bg border border-roxou-border text-[10px] font-black uppercase tracking-widest hover:bg-roxou-surface transition-all"
                >
                  Cancelar
                </button>
                <button 
                  disabled={loading || !rejectReason.trim()}
                  onClick={() => handleUpdateStatus("rejected", rejectReason)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 shadow-xl shadow-red-500/20"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirmar Rejeição"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
