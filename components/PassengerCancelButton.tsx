"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { X, Loader2, AlertCircle } from "lucide-react";

interface PassengerCancelButtonProps {
  requestId: string;
  currentStatus: string;
}

export default function PassengerCancelButton({ requestId, currentStatus }: PassengerCancelButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) return;

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("transport_requests")
        .update({ status: "cancelled" })
        .eq("id", requestId)
        .eq("status", "open"); // Only allow if still open

      if (updateError) throw updateError;

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao cancelar pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus !== "open") {
    return null;
  }

  return (
    <div className="w-full">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold mb-3">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <button
        onClick={handleCancel}
        disabled={loading}
        className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        Cancelar Pedido
      </button>
    </div>
  );
}
