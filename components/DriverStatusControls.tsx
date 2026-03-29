"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Play, CheckCircle2, Loader2, AlertCircle, Navigation, MapPin } from "lucide-react";
import { sendNotification } from "@/lib/notifications";

interface DriverStatusControlsProps {
  requestId: string;
  currentStatus: string;
  driverId: string;
  passengerId?: string; // Optional: if passed, we use it directly
}

export default function DriverStatusControls({ requestId, currentStatus, driverId, passengerId }: DriverStatusControlsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch passengerId if not provided
      let targetPassengerId = passengerId;
      if (!targetPassengerId) {
        const { data: reqData } = await supabase
          .from("transport_requests")
          .select("passenger_id")
          .eq("id", requestId)
          .single();
        targetPassengerId = reqData?.passenger_id;
      }

      // 2. Update status
      const { error: updateError } = await supabase
        .from("transport_requests")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId)
        .eq("driver_id", driverId)
        .eq("status", currentStatus);

      if (updateError) throw updateError;

      // 3. Notify passenger
      if (targetPassengerId) {
        let title = "Atualização na sua corrida! 🚗";
        let body = `O status da sua corrida mudou para: ${newStatus}`;

        if (newStatus === 'A_CAMINHO') {
          title = "Motorista a caminho! 🚗";
          body = "O motorista já está vindo te buscar. Fique atento!";
        } else if (newStatus === 'CHEGUEI') {
          title = "Motorista no local! 📍";
          body = "O motorista acabou de chegar no ponto de encontro.";
        } else if (newStatus === 'EM_CORRIDA') {
          title = "Viagem iniciada! 🏁";
          body = "Sua viagem começou. Aproveite o rolê Roxou!";
        } else if (newStatus === 'FINALIZADA') {
          title = "Viagem finalizada! ✨";
          body = "Você chegou ao seu destino. Obrigado por usar o Roxou!";
        }

        await sendNotification({
          userId: targetPassengerId,
          type: 'STATUS_CHANGE',
          title,
          body,
          data: { requestId, newStatus }
        });
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar status.");
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === "FINALIZADA" || currentStatus === "CANCELADA") {
    return null;
  }

  return (
    <div className="space-y-3 w-full">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {currentStatus === "ACEITA" && (
        <button
          onClick={() => updateStatus("A_CAMINHO")}
          disabled={loading}
          className="w-full py-4 bg-roxou-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-roxou-primary/90 active:scale-95 transition-all shadow-lg shadow-roxou-primary/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
          Estou a Caminho
        </button>
      )}

      {currentStatus === "A_CAMINHO" && (
        <button
          onClick={() => updateStatus("CHEGUEI")}
          disabled={loading}
          className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-amber-500/90 active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
          Cheguei no Local
        </button>
      )}

      {currentStatus === "CHEGUEI" && (
        <button
          onClick={() => updateStatus("EM_CORRIDA")}
          disabled={loading}
          className="w-full py-4 bg-roxou-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-roxou-primary/90 active:scale-95 transition-all shadow-lg shadow-roxou-primary/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
          Iniciar Corrida
        </button>
      )}

      {currentStatus === "EM_CORRIDA" && (
        <button
          onClick={() => updateStatus("FINALIZADA")}
          disabled={loading}
          className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-500/90 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          Finalizar Corrida
        </button>
      )}
    </div>
  );
}
