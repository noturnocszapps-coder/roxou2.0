"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { X, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PassengerCancelButtonProps {
  requestId: string;
  currentStatus: string;
}

export default function PassengerCancelButton({ requestId, currentStatus }: PassengerCancelButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("transport_requests")
        .update({ status: "cancelled" })
        .eq("id", requestId)
        .eq("status", "open"); // Only allow if still open

      if (updateError) throw updateError;

      setShowConfirm(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao cancelar pedido.");
      setLoading(false);
    }
  };

  if (currentStatus !== "open") {
    return null;
  }

  return (
    <>
      <div className="w-full">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold mb-3"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          Cancelar Pedido
        </motion.button>
      </div>

      {/* Custom Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowConfirm(false)}
              className="absolute inset-0 bg-roxou-bg/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-roxou-surface border border-roxou-border rounded-[40px] p-8 shadow-2xl space-y-8"
            >
              <div className="w-20 h-20 rounded-[32px] bg-red-500/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-display font-black text-white italic">Cancelar Rolê?</h3>
                <p className="text-roxou-text-muted font-medium">Tem certeza? Os motoristas não verão mais seu pedido na pista.</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full py-5 bg-red-500 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sim, Cancelar
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  className="w-full py-5 bg-roxou-bg border border-roxou-border text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-roxou-surface transition-all active:scale-95 disabled:opacity-50"
                >
                  Manter Pedido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
