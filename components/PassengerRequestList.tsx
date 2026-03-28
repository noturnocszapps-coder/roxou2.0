"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, MapPin, Zap, History, LayoutDashboard, ChevronRight, Shield } from "lucide-react";
import TimeAgo from "@/components/TimeAgo";
import PassengerCancelButton from "@/components/PassengerCancelButton";
import { motion, AnimatePresence } from "motion/react";
import Skeleton from "@/components/Skeleton";

interface PassengerRequestListProps {
  initialRequests: any[];
  initialConnections: any[];
  userId: string;
}

export default function PassengerRequestList({ initialRequests, initialConnections, userId }: PassengerRequestListProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [connections, setConnections] = useState(initialConnections);
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

    const connChannel = supabase
      .channel("passenger_connections")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connections",
          filter: `passenger_id=eq.${userId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(connChannel);
    };
  }, [userId, supabase, router]);

  useEffect(() => {
    setRequests(initialRequests);
    setConnections(initialConnections);
    setLoading(false);
  }, [initialRequests, initialConnections]);

  const activeRequests = requests.filter((r) => ["ABERTA", "EM_NEGOCIACAO", "ACEITA"].includes(r.status));
  const historyRequests = requests.filter((r) => ["FINALIZADA", "CANCELADA"].includes(r.status));

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
              {displayRequests.map((req: any, index: number) => {
                const requestConnections = connections.filter(c => c.request_id === req.id);
                
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-6 rounded-[32px] bg-roxou-surface/40 border border-roxou-border hover:border-roxou-primary/30 transition-all group relative overflow-hidden ${
                      req.status === 'ACEITA' ? 'ring-1 ring-roxou-primary/20' : ''
                    }`}
                  >
                    {/* Status Glow */}
                    {req.status === 'ACEITA' && (
                      <div className="absolute inset-0 bg-roxou-primary/5 animate-pulse pointer-events-none" />
                    )}
                    
                    <div className="absolute top-0 right-0 w-24 h-24 bg-roxou-primary/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-roxou-primary/10 transition-colors" />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.15em] ${
                          req.status === "ABERTA"
                            ? "bg-roxou-text-muted/10 border-roxou-text-muted/20 text-roxou-text-muted"
                            : req.status === "EM_NEGOCIACAO"
                            ? "bg-roxou-primary/10 border-roxou-primary/20 text-roxou-primary shadow-[0_0_10px_rgba(124,58,237,0.1)]"
                            : req.status === "ACEITA"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                            : req.status === "FINALIZADA"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                            : "bg-red-500/10 border-red-500/20 text-red-500"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          req.status === "ABERTA" ? "bg-roxou-text-muted" :
                          req.status === "EM_NEGOCIACAO" ? "bg-roxou-primary" :
                          req.status === "ACEITA" ? "bg-amber-500" :
                          req.status === "FINALIZADA" ? "bg-emerald-500" : "bg-red-500"
                        }`} />
                        {req.status === "ABERTA" ? "Aberto" : 
                         req.status === "EM_NEGOCIACAO" ? "Em Negociação" :
                         req.status === "ACEITA" ? "Aceito" :
                         req.status === "FINALIZADA" ? "Finalizado" : "Cancelado"}
                      </div>
                      {req.status === "ABERTA" && (
                        <div className="flex items-center gap-1.5 opacity-60">
                          <Shield className="w-3 h-3 text-roxou-primary/40" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-roxou-text-muted">Pedido ativo na rede</span>
                        </div>
                      )}
                      <TimeAgo
                        date={req.created_at}
                        className="text-[10px] text-roxou-text-muted font-black uppercase tracking-[0.2em] opacity-60"
                      />
                    </div>

                    {/* Interested Drivers */}
                    {req.status === "ABERTA" || req.status === "EM_NEGOCIACAO" ? (
                      <div className="mb-6 space-y-3 relative z-10">
                        <p className="text-[10px] text-roxou-text-muted font-black uppercase tracking-widest">Motoristas Interessados ({requestConnections.length})</p>
                        {requestConnections.length > 0 ? (
                          <div className="space-y-2">
                            {requestConnections.map((conn: any) => (
                              <div key={conn.id} className="p-4 rounded-2xl bg-roxou-bg/50 border border-roxou-border flex items-center justify-between group/driver">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-roxou-surface border border-roxou-border overflow-hidden">
                                    <img 
                                      src={conn.driver.avatar_url || `https://ui-avatars.com/api/?name=${conn.driver.full_name}`} 
                                      alt={conn.driver.full_name} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white">{conn.driver.full_name}</p>
                                    <p className="text-[10px] text-roxou-primary font-black uppercase tracking-widest">Disponível</p>
                                  </div>
                                </div>
                                <Link 
                                  href={`/chat/${conn.id}`}
                                  className="px-4 py-2 bg-roxou-primary/10 hover:bg-roxou-primary text-roxou-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                  Abrir Conversa
                                </Link>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-roxou-bg/30 border border-dashed border-roxou-border text-center">
                            <p className="text-[10px] text-roxou-text-muted font-bold">Aguardando motoristas...</p>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {req.status === "ACEITA" && req.driver && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6 p-5 rounded-[24px] border flex items-center gap-5 relative z-10 overflow-hidden bg-roxou-primary/5 border-roxou-primary/10"
                      >
                        <div className="w-14 h-14 rounded-full bg-roxou-bg border border-roxou-border overflow-hidden ring-2 ring-roxou-primary/20 flex-shrink-0">
                          <img
                            src={req.driver.avatar_url || `https://ui-avatars.com/api/?name=${req.driver.full_name}`}
                            alt={req.driver.full_name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-base font-black text-white leading-tight">
                              {req.driver.full_name}
                            </p>
                            {req.driver.drivers?.[0]?.verification_status === 'approved' && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-roxou-primary/20 border border-roxou-primary/30">
                                <Shield className="w-2.5 h-2.5 text-roxou-primary" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-roxou-primary">Verificado</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-roxou-primary">
                            Motorista aceitou seu pedido
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
                );
              })}
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
                <p className="text-roxou-text-muted font-medium">Alguém já vai te levar, bora pedir?</p>
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
