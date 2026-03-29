'use client';

import { Plus, Clock, MessageSquare, ChevronRight, Zap, RefreshCcw, Shield } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import LiveIndicators from "@/components/LiveIndicators";
import RealTimeNotification from "@/components/RealTimeNotification";
import PassengerRequestList from "@/components/PassengerRequestList";
import LightOnboarding from "@/components/LightOnboarding";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import Skeleton from "@/components/Skeleton";

export default function DashboardClient({ user, requests, connections }: { user: any, requests: any[], connections: any[] }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-roxou-bg pb-24 selection:bg-roxou-primary/30"
    >
      <RealTimeNotification />
      <LightOnboarding />
      
      {/* Header */}
      <header className="glass sticky top-0 z-40 py-4 px-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-roxou-primary to-roxou-secondary rounded-xl flex items-center justify-center violet-glow-sm">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-display font-black tracking-tighter text-white">ROXOU</span>
          </div>
          <div className="flex items-center gap-4">
            <LogoutButton />
            <Link 
              href="/profile"
              className="w-10 h-10 rounded-full bg-roxou-surface border border-roxou-border overflow-hidden ring-2 ring-transparent hover:ring-roxou-primary/50 transition-all active:scale-95"
            >
              <img 
                src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-10 space-y-10">
        {/* Welcome & Status */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mb-1"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Rede Roxou</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-roxou-border" />
              <div className="flex items-center gap-1.5">
                <RefreshCcw className="w-3 h-3 text-roxou-text-muted/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-roxou-text-muted/60">Painel Ativo</span>
              </div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-display font-black text-white tracking-tight"
            >
              Salve, <span className="text-transparent bg-clip-text bg-gradient-to-r from-roxou-primary to-violet-400">{user.user_metadata.full_name?.split(' ')[0] || 'Passageiro'}!</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-roxou-text-muted font-medium"
            >
              Bora pro próximo rolê?
            </motion.p>
          </div>
        </div>

        {/* Quick Stats */}
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
              <div className="p-5 rounded-[28px] bg-roxou-surface/40 border border-roxou-border flex flex-col gap-1 hover:border-roxou-primary/30 transition-all hover:translate-y-[-2px] group">
                <span className="text-[10px] font-bold uppercase tracking-widest text-roxou-text-muted/60">Motoristas</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-black text-white group-hover:text-roxou-primary transition-colors">Ativos</span>
                  <span className="text-[10px] font-bold text-roxou-primary/60">Na Rede</span>
                </div>
              </div>
              <div className="p-5 rounded-[28px] bg-roxou-surface/40 border border-roxou-border flex flex-col gap-1 hover:border-roxou-primary/30 transition-all hover:translate-y-[-2px] group">
                <span className="text-[10px] font-bold uppercase tracking-widest text-roxou-text-muted/60">Seus Pedidos</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-black text-white group-hover:text-roxou-primary transition-colors">{requests?.filter((r: any) => ["ABERTA", "EM_NEGOCIACAO", "ACEITA", "A_CAMINHO", "CHEGUEI", "EM_CORRIDA"].includes(r.status)).length || 0}</span>
                  <span className="text-[10px] font-bold text-roxou-primary">Ativos</span>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
        >
          {!isLoaded ? (
            <Skeleton className="h-48 rounded-[40px]" />
          ) : (
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link 
                href="/request/new"
                className="block p-10 rounded-[40px] bg-gradient-to-br from-roxou-primary via-roxou-primary to-roxou-secondary violet-glow transition-all group relative overflow-hidden border border-white/10 animate-gradient-slow animate-float"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-roxou-secondary/20 blur-[60px] rounded-full -ml-10 -mb-10" />
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-display font-black text-white tracking-tighter italic">Pedir Carona</h2>
                    <p className="text-white/70 text-sm font-medium max-w-[200px]">Alguém já vai te levar! Encontre motoristas agora.</p>
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

        {/* Active Connections */}
        {connections && connections.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-[10px] text-roxou-primary uppercase font-black tracking-[0.3em] mb-4 flex items-center gap-2 opacity-80">
              <MessageSquare className="w-4 h-4" />
              Negociações Ativas
            </h3>
            <div className="space-y-4">
              {connections.map((conn: any) => (
                <motion.div
                  key={conn.id}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    href={`/chat/${conn.id}`}
                    className="flex items-center gap-5 p-5 rounded-[32px] bg-roxou-surface/40 border border-roxou-border hover:border-roxou-primary/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-roxou-primary/5 blur-xl rounded-full -mr-10 -mt-10" />
                    
                    <div className="w-14 h-14 rounded-full bg-roxou-bg border border-roxou-border overflow-hidden relative ring-2 ring-roxou-primary/10 group-hover:ring-roxou-primary/30 transition-all">
                      <img 
                        src={conn.driver.avatar_url || `https://ui-avatars.com/api/?name=${conn.driver.full_name}`} 
                        alt={conn.driver.full_name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="flex-grow relative z-10">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-black text-white tracking-tight">{conn.driver.full_name}</h4>
                        {conn.driver.drivers?.[0]?.verification_status === 'approved' && (
                          <Shield className="w-3 h-3 text-roxou-primary" />
                        )}
                        <div className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                          ["ACEITA", "A_CAMINHO", "CHEGUEI", "EM_CORRIDA"].includes(conn.request.status) ? 'bg-roxou-primary/20 text-roxou-primary border border-roxou-primary/30' :
                          conn.request.status === 'FINALIZADA' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                          'bg-roxou-text-muted/20 text-roxou-text-muted border border-roxou-text-muted/30'
                        }`}>
                          {conn.request.status === 'ACEITA' ? 'Confirmado' : 
                           conn.request.status === 'A_CAMINHO' ? 'A Caminho' :
                           conn.request.status === 'CHEGUEI' ? 'No Local' :
                           conn.request.status === 'EM_CORRIDA' ? 'Em Corrida' : 
                           conn.request.status === 'FINALIZADA' ? 'Finalizado' : conn.request.status}
                        </div>
                      </div>
                      <p className="text-xs text-roxou-text-muted font-medium truncate max-w-[180px]">
                        Destino: {conn.request.origin}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-2 h-2 rounded-full bg-roxou-primary animate-pulse shadow-[0_0_8px_rgba(124,58,237,0.6)]" />
                      <ChevronRight className="w-6 h-6 text-roxou-text-muted group-hover:translate-x-1 group-hover:text-white transition-all" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Requests List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-display font-black flex items-center gap-3 text-white tracking-tight">
              <div className="w-10 h-10 rounded-2xl bg-roxou-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-roxou-primary" />
              </div>
              Meus Pedidos
            </h3>
          </div>
          <PassengerRequestList 
            initialRequests={requests || []} 
            initialConnections={connections || []}
            userId={user.id} 
          />
        </section>
      </main>
    </motion.div>
  );
}
