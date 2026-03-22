'use client';

import { Plus, Clock, MessageSquare, ChevronRight, Zap, RefreshCcw, Shield } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import RealTimeNotification from "@/components/RealTimeNotification";
import PassengerRequestList from "@/components/PassengerRequestList";
import LightOnboarding from "@/components/LightOnboarding";
import { motion } from "motion/react";
import { useState, useEffect, useMemo } from "react";
import Skeleton from "@/components/Skeleton";

type DashboardClientProps = {
  user: any;
  requests: any[];
  connections: any[];
};

function safeAvatar(name?: string, avatarUrl?: string) {
  if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim().length > 0) {
    return avatarUrl;
  }
  const safeName = encodeURIComponent(name || "Motorista");
  return `https://ui-avatars.com/api/?name=${safeName}`;
}

function getStatusLabel(status?: string) {
  switch (status) {
    case "accepted":
      return "Aceito";
    case "en_route":
      return "A Caminho";
    case "arrived":
      return "No Local";
    case "in_progress":
      return "Em Andamento";
    case "completed":
      return "Finalizado";
    default:
      return status || "Sem status";
  }
}

function getStatusClasses(status?: string) {
  if (status === "accepted" || status === "en_route") {
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  }
  if (status === "in_progress" || status === "arrived") {
    return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
  }
  return "bg-zinc-700/30 text-zinc-400 border border-zinc-700/50";
}

export default function DashboardClient({
  user,
  requests = [],
  connections = [],
}: DashboardClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const firstName = useMemo(() => {
    const fullName =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email ||
      "Motorista";

    return String(fullName).split(" ")[0] || "Motorista";
  }, [user]);

  const openRequestsCount = useMemo(() => {
    return (requests || []).filter((r: any) => r?.status === "open").length;
  }, [requests]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-zinc-950 pb-24 selection:bg-emerald-500/30"
    >
      <RealTimeNotification />
      <LightOnboarding />

      <header className="sticky top-0 z-40 py-4 px-6 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.18)]">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">DriverDash</span>
          </div>

          <div className="flex items-center gap-4">
            <LogoutButton />
            <Link
              href="/profile"
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden ring-2 ring-transparent hover:ring-emerald-500/50 transition-all active:scale-95"
            >
              <img
                src={safeAvatar(user?.user_metadata?.full_name || user?.email, user?.user_metadata?.avatar_url)}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-10 space-y-10">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mb-1"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500/70 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/70">
                  Rede DriverDash
                </span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-700" />
              <div className="flex items-center gap-1.5">
                <RefreshCcw className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Painel Ativo
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black text-white tracking-tight"
            >
              Salve,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-300">
                {firstName}
              </span>
              !
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-400 font-medium"
            >
              Bora pro próximo rolê?
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          {!isLoaded ? (
            <>
              <Skeleton className="h-24 rounded-[28px]" />
              <Skeleton className="h-24 rounded-[28px]" />
            </>
          ) : (
            <>
              <div className="p-5 rounded-[28px] bg-zinc-900/70 border border-zinc-800 flex flex-col gap-1 hover:border-emerald-500/30 transition-all hover:-translate-y-[2px] group">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400/70">
                  Motoristas
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                    Ativos
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400/70">Na Rede</span>
                </div>
              </div>

              <div className="p-5 rounded-[28px] bg-zinc-900/70 border border-zinc-800 flex flex-col gap-1 hover:border-emerald-500/30 transition-all hover:-translate-y-[2px] group">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400/70">
                  Seus Pedidos
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                    {openRequestsCount}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">Abertos</span>
                </div>
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
        >
          {!isLoaded ? (
            <Skeleton className="h-48 rounded-[40px]" />
          ) : (
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Link
                href="/request/new"
                className="block p-10 rounded-[40px] bg-gradient-to-br from-emerald-500 via-emerald-500 to-emerald-400 transition-all group relative overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-300/20 blur-[60px] rounded-full -ml-10 -mb-10" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-white tracking-tighter italic">
                      Pedir Carona
                    </h2>
                    <p className="text-white/80 text-sm font-medium max-w-[200px]">
                      Alguém já vai te levar. Encontre motoristas agora.
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    className="w-20 h-20 rounded-[32px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl"
                  >
                    <Plus className="text-white w-12 h-12" />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {Array.isArray(connections) && connections.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-[10px] text-emerald-400 uppercase font-black tracking-[0.3em] mb-4 flex items-center gap-2 opacity-80">
              <MessageSquare className="w-4 h-4" />
              Negociações Ativas
            </h3>

            <div className="space-y-4">
              {connections.map((conn: any) => {
                const driver = conn?.driver || null;
                const request = conn?.request || null;
                const verificationStatus = driver?.drivers?.[0]?.verification_status;
                const fullName = driver?.full_name || "Motorista";
                const avatarUrl = safeAvatar(fullName, driver?.avatar_url);
                const status = request?.status;

                return (
                  <motion.div key={conn?.id || Math.random()} whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href={`/chat/${conn?.id ?? ""}`}
                      className="flex items-center gap-5 p-5 rounded-[32px] bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 blur-xl rounded-full -mr-10 -mt-10" />

                      <div className="w-14 h-14 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden relative ring-2 ring-emerald-500/10 group-hover:ring-emerald-500/30 transition-all">
                        <img
                          src={avatarUrl}
                          alt={fullName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-grow relative z-10 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h4 className="font-black text-white tracking-tight">{fullName}</h4>

                          {verificationStatus === "approved" && (
                            <Shield className="w-3 h-3 text-emerald-400" />
                          )}

                          <div className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${getStatusClasses(status)}`}>
                            {getStatusLabel(status)}
                          </div>
                        </div>

                        <p className="text-xs text-zinc-400 font-medium truncate max-w-[180px]">
                          Destino: {request?.origin || "Destino não informado"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        <ChevronRight className="w-6 h-6 text-zinc-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        <section className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black flex items-center gap-3 text-white tracking-tight">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              Meus Pedidos
            </h3>
          </div>

          <PassengerRequestList initialRequests={Array.isArray(requests) ? requests : []} userId={user?.id || ""} />
        </section>
      </main>
    </motion.div>
  );
}