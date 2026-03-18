"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Clock, MapPin, Zap, History, LayoutDashboard, ChevronRight } from "lucide-react";
import TimeAgo from "@/components/TimeAgo";
import PassengerCancelButton from "@/components/PassengerCancelButton";
import { motion, AnimatePresence } from "motion/react";
import Skeleton from "@/components/Skeleton";

interface PassengerRequestListProps {
  initialRequests: any[];
  userId: string;
}

export default function PassengerRequestList({ initialRequests, userId }: PassengerRequestListProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("passenger_requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transport_requests",
          filter: `passenger_id=eq.${userId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, router]);

  useEffect(() => {
    setRequests(initialRequests);
    setLoading(false);
  }, [initialRequests]);

  const activeRequests = requests.filter((r) => ["open", "accepted", "in_progress"].includes(r.status));
  const historyRequests = requests.filter((r) => ["completed", "cancelled"].includes(r.status));

  const displayRequests = activeTab === "active" ? activeRequests : historyRequests;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 w-full rounded-[32px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex p-1.5 bg-roxou-surface/60 backdrop-blur-md border border-roxou-border rounded-[24px] relative">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all relative z-10 ${
            activeTab === "active" ? "text-white" : "text-roxou-text-muted hover:text-white"
          }`}
        >
          {activeTab === "active" && (
            <motion.div 
              layoutId="activeTab"
              className="absolute inset-0 bg-roxou-primary rounded-[18px] shadow-lg shadow-roxou-primary/20"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <LayoutDashboard className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Ativos ({activeRequests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all relative z-10 ${
            activeTab === "history" ? "text-white" : "text-roxou-text-muted hover:text-white"
          }`}
        >
          {activeTab === "history" && (
            <motion.div 
              layoutId="activeTab"
              className="absolute inset-0 bg-roxou-primary rounded-[18px] shadow-lg shadow-roxou-primary/20"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <History className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Histórico ({historyRequests.length})</span>
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {displayRequests.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {displayRequests.map((req: any, index: number) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-6 rounded-[32px] bg-roxou-surface/40 border border-roxou-border hover:border-roxou-primary/30 transition-all group relative overflow-hidden ${
                    req.status === 'in_progress' ? 'ring-1 ring-roxou-primary/20' : ''
                  }`}
                >
                  {/* Status Glow */}
                  {req.status === 'in_progress' && (
                    <div className="absolute inset-0 bg-roxou-primary/5 animate-pulse pointer-events-none" />
                  )}
                  
                  <div className="absolute top-0 right-0 w-24 h-24 bg-roxou-primary/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-roxou-primary/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.15em] ${
                        req.status === "open"
                          ? "bg-roxou-primary/10 border-roxou-primary/20 text-roxou-primary shadow-[0_0_10px_rgba(124,58,237,0.1)]"
                          : req.status === "accepted"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                          : req.status === "in_progress"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                          : req.status === "completed"
                          ? "bg-roxou-text-muted/10 border-roxou-text-muted/20 text-roxou-text-muted"
                          : "bg-red-500/10 border-red-500/20 text-red-500"
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        req.status === "open" ? "bg-roxou-primary" :
                        req.status === "accepted" ? "bg-emerald-500" :
                        req.status === "in_progress" ? "bg-blue-500" :
                        req.status === "completed" ? "bg-roxou-text-muted" : "bg-red-500"
                      }`} />
                      {req.status === "open"
                        ? "Aberto"
                        : req.status === "accepted"
                        ? "Aceito"
                        : req.status === "in_progress"
                        ? "Em Andamento"
                        : req.status === "completed"
                        ? "Finalizado"
                        : "Cancelado"}
                    </div>
                    <TimeAgo
                      date={req.created_at}
                      className="text-[10px] text-roxou-text-muted font-black uppercase tracking-[0.2em] opacity-60"
                    />
                  </div>

                  {(req.status === "accepted" || req.status === "in_progress" || req.status === "completed") && req.driver && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`mb-6 p-4 rounded-2xl border flex items-center gap-4 relative z-10 overflow-hidden ${
                        req.status === "in_progress"
                          ? "bg-blue-500/5 border-blue-500/10"
                          : "bg-emerald-500/5 border-emerald-500/10"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-roxou-bg border border-roxou-border overflow-hidden ring-2 ring-roxou-primary/20">
                        <img
                          src={req.driver.avatar_url || `https://ui-avatars.com/api/?name=${req.driver.full_name}`}
                          alt={req.driver.full_name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p
                          className={`text-[10px] uppercase font-black tracking-[0.2em] mb-0.5 ${
                            req.status === "in_progress" ? "text-blue-400" : "text-emerald-500"
                          }`}
                        >
                          {req.status === "in_progress"
                            ? "Corrida em andamento"
                            : req.status === "completed"
                            ? "Corrida finalizada"
                            : "Motorista a caminho"}
                        </p>
                        <p className="text-sm font-bold text-white leading-tight">
                          {req.status === "completed"
                            ? `Você viajou com ${req.driver.full_name}`
                            : `${req.driver.full_name} ${
                                req.status === "in_progress" ? "está levando você" : "aceitou seu pedido!"
                              }`}
                        </p>
                      </div>
                    </motion.div>
                  )}
                  <div className="space-y-4 mb-6 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-roxou-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-roxou-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-roxou-text-muted uppercase font-black tracking-widest mb-0.5">Destino</p>
                        <p className="text-base font-bold text-white/90">{req.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-roxou-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-roxou-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-roxou-text-muted uppercase font-black tracking-widest mb-0.5">Horário</p>
                        <p className="text-base font-bold text-white/90">{req.departure_time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <PassengerCancelButton requestId={req.id} currentStatus={req.status} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 px-8 rounded-[40px] border border-dashed border-roxou-border bg-roxou-surface/20 space-y-6"
            >
              <div className="w-20 h-20 bg-roxou-surface rounded-full flex items-center justify-center mx-auto border border-roxou-border">
                <Zap className="w-10 h-10 text-roxou-text-muted/30" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-display font-black text-white italic">Nenhum rolê ainda...</p>
                <p className="text-roxou-text-muted font-medium">Bora chamar um motorista para hoje?</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/request/new")}
                className="px-8 py-4 bg-roxou-primary text-white rounded-full font-black text-sm uppercase tracking-widest violet-glow-sm"
              >
                Criar primeiro pedido
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
