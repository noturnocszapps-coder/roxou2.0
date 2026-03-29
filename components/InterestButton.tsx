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
      // 1. Validate driver is approved
      const { data: driver, error: driverError } = await supabase
        .from("drivers")
        .select("verification_status")
        .eq("user_id", driverId)
        .single();

      if (driverError || driver?.verification_status !== 'approved') {
        setError("Sua conta ainda não foi aprovada para aceitar pedidos.");
        setLoading(false);
        return;
      }

      // 2. Prevent duplicate connection
      const { data: existingConnection, error: connError } = await supabase
        .from("connections")
        .select("id")
        .eq("request_id", requestId)
        .eq("driver_id", driverId)
        .maybeSingle();

      if (existingConnection) {
        // Redirect to existing chat
        router.push(`/chat/${existingConnection.id}`);
        return;
      }

      // 3. Create connection
      const { data: newConnection, error: insertError } = await supabase
        .from("connections")
        .insert({
          request_id: requestId,
          driver_id: driverId,
          passenger_id: passengerId,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Update request status
      // We also assign the driver_id to the request to move it to the driver's active list
      const { error: updateError } = await supabase
        .from("transport_requests")
        .update({ 
          status: 'EM_NEGOCIACAO',
          driver_id: driverId 
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      setSuccess(true);
      
      // 5. Redirect to chat
      // Small delay to show success state
      setTimeout(() => {
        router.push(`/chat/${newConnection.id}`);
      }, 1000);

    } catch (err: any) {
      console.error("Error creating interest:", err);
      setError("Ocorreu um erro ao processar seu interesse. Tente novamente.");
    } finally {
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
        <p className="text-xs text-roxou-primary font-bold text-center bg-roxou-primary/10 py-2 rounded-lg border border-roxou-primary/20">
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
      <p className="text-[10px] text-roxou-text-muted text-center font-bold uppercase tracking-widest opacity-50">
        Próxima etapa: Chat de negociação
      </p>
    </div>
  );
}
