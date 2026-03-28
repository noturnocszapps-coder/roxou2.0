"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Zap, Loader2, CheckCircle2 } from "lucide-react";

interface InterestButtonProps {
  requestId: string;
  driverId: string;
  passengerId: string;
}

export default function InterestButton({ requestId, driverId, passengerId }: InterestButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleInterest = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Check if connection already exists to prevent duplicates
      const { data: existingConn } = await supabase
        .from("connections")
        .select("id")
        .eq("request_id", requestId)
        .eq("driver_id", driverId)
        .maybeSingle();

      if (existingConn) {
        router.push(`/chat/${existingConn.id}`);
        return;
      }

      // 2. Create connection
      const { data: connData, error: connError } = await supabase
        .from("connections")
        .insert({
          passenger_id: passengerId,
          driver_id: driverId,
          request_id: requestId,
          status: "active"
        })
        .select()
        .single();

      if (connError) throw connError;

      // 3. Update request status to EM_NEGOCIACAO if it's still ABERTA
      const { error: updateError } = await supabase
        .from("transport_requests")
        .update({ status: "EM_NEGOCIACAO" })
        .eq("id", requestId)
        .eq("status", "ABERTA");

      // We don't throw if updateError because the connection is already created
      // and someone else might have already updated the status to EM_NEGOCIACAO
      if (updateError) {
        console.warn("Could not update status to EM_NEGOCIACAO, might already be updated:", updateError);
      }

      setSuccess(true);
      router.refresh();
      
      // Redirect to chat
      setTimeout(() => {
        router.push(`/chat/${connData.id}`);
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Erro ao expressar interesse.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20">
        <CheckCircle2 className="w-5 h-5" />
        Interesse Enviado!
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {error && (
        <p className="text-xs text-red-500 font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
          {error}
        </p>
      )}
      <button 
        onClick={handleInterest}
        disabled={loading}
        className="w-full py-5 bg-roxou-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-roxou-primary/90 active:scale-95 transition-all shadow-lg shadow-roxou-primary/20 group disabled:opacity-50 disabled:scale-100"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Zap className="w-5 h-5 fill-current group-hover:animate-bounce" />
        )}
        {loading ? "Processando..." : "Tenho interesse"}
      </button>
    </div>
  );
}
