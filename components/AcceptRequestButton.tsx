"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Zap, Loader2, CheckCircle2 } from "lucide-react";

interface AcceptRequestButtonProps {
  requestId: string;
  driverId: string;
}

export default function AcceptRequestButton({ requestId, driverId }: AcceptRequestButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    setError(null);

    try {
      // Atomic update to prevent race conditions
      const { data, error: updateError } = await supabase
        .from("transport_requests")
        .update({ 
          status: "accepted", 
          driver_id: driverId 
        })
        .eq("id", requestId)
        .in("status", ["open", "pending"]) // Allow if open or pending
        .select();

      if (updateError) throw updateError;

      if (!data || data.length === 0) {
        throw new Error("Este pedido já foi aceito por outro motorista.");
      }

      setSuccess(true);
      
      // Optional: Create a connection/chat automatically
      const { data: connData, error: connError } = await supabase
        .from("connections")
        .insert({
          passenger_id: data[0].passenger_id,
          driver_id: driverId,
          request_id: requestId,
          status: "active"
        })
        .select()
        .single();

      if (connError) {
        console.error("Error creating connection:", connError);
        // We don't throw here because the request is already accepted
      }

      router.refresh();
      
      // Redirect to chat after a brief success message
      setTimeout(() => {
        if (!connError && connData) {
          router.push(`/chat/${connData.id}`);
        } else {
          router.push("/driver/dashboard");
        }
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Erro ao aceitar pedido.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20">
        <CheckCircle2 className="w-5 h-5" />
        Pedido Aceito!
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
        onClick={handleAccept}
        disabled={loading}
        className="w-full py-5 bg-roxou-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-roxou-primary/90 active:scale-95 transition-all shadow-lg shadow-roxou-primary/20 group disabled:opacity-50 disabled:scale-100"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Zap className="w-5 h-5 fill-current group-hover:animate-bounce" />
        )}
        {loading ? "Processando..." : "Aceitar e Iniciar Chat"}
      </button>
    </div>
  );
}
