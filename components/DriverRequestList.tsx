"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Zap, MapPin, Clock, MessageSquare, ChevronRight, Star, Users, Navigation, DollarSign, AlertCircle, Activity, History, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import TimeAgo from "@/components/TimeAgo";
import InterestButton from "@/components/InterestButton";
import DriverStatusControls from "@/components/DriverStatusControls";
import LiveRideMap from "@/components/Map/LiveRideMap";
import DriverLocationTracker from "@/components/DriverLocationTracker";

interface DriverRequestListProps {
  initialLeads: any[];
  initialActiveRides: any[];
  initialHistory: any[];
  userId: string;
}

export default function DriverRequestList({ 
  initialLeads, 
  initialActiveRides, 
  initialHistory,
  userId 
}: DriverRequestListProps) {
  const [activeTab, setActiveTab] = useState<"leads" | "active" | "history">("leads");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("driver_requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transport_requests",
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const isNew = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    return diffInMinutes < 15;
  };

  const renderRequestCard = (req: any, showControls: boolean = false) => {
    let eventContext = null;
    try {
      if (req.description) {
        eventContext = JSON.parse(req.description);
      }
    } catch (e) {
      // Not JSON or legacy format
    }

    return (
      <div 
        key={req.id}
        className={`relative p-6 rounded-[32px] bg-roxou-surface border border-roxou-border hover:border-roxou-primary/40 transition-all group overflow-hidden ${isNew(req.created_at) && req.status === 'ABERTA' ? 'shadow-2xl shadow-roxou-primary/5' : ''}`}
      >
        {isNew(req.created_at) && req.status === 'ABERTA' && (
          <div className="absolute top-0 right-0 bg-roxou-primary text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-tighter animate-pulse z-10">
            Novo Pedido
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-roxou-bg border border-roxou-border overflow-hidden shadow-inner relative">
              <img 
                src={req.passenger.avatar_url || `https://ui-avatars.com/api/?name=${req.passenger.full_name}`} 
                alt={req.passenger.full_name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">{req.passenger.full_name}</h4>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-roxou-text-muted font-bold uppercase tracking-widest">Passageiro</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest mb-2 inline-block ${
              req.status === 'ABERTA' ? 'bg-roxou-primary/20 text-roxou-primary border border-roxou-primary/30' :
              req.status === 'ACEITA' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
              req.status === 'A_CAMINHO' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
              req.status === 'CHEGUEI' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
              req.status === 'EM_CORRIDA' ? 'bg-roxou-primary/20 text-roxou-primary border border-roxou-primary/30' :
              req.status === 'EM_NEGOCIACAO' ? 'bg-roxou-primary/20 text-roxou-primary border border-roxou-primary/30' :
              req.status === 'FINALIZADA' ? 'bg-roxou-text-muted/20 text-roxou-text-muted border border-roxou-text-muted/30' :
              'bg-red-500/20 text-red-500 border border-red-500/30'
            }`}>
              {req.status === 'ABERTA' ? 'Aberto' : 
               req.status === 'ACEITA' ? 'Aceito' : 
               req.status === 'A_CAMINHO' ? 'A Caminho' :
               req.status === 'CHEGUEI' ? 'No Local' :
               req.status === 'EM_CORRIDA' ? 'Em Corrida' :
               req.status === 'EM_NEGOCIACAO' ? 'Em Negociação' :
               req.status === 'FINALIZADA' ? 'Finalizado' : 'Cancelado'}
            </div>
            <TimeAgo 
              date={req.created_at} 
              prefix="" 
              className="block text-xs font-bold text-roxou-text-muted" 
            />
          </div>
        </div>

        {eventContext?.evento_nome && (
          <div className="mb-6 p-4 rounded-2xl bg-roxou-primary/5 border border-roxou-primary/20 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-roxou-primary fill-current" />
              <div>
                <p className="text-[10px] text-roxou-primary font-black uppercase tracking-widest">Indo para o evento</p>
                <p className="text-sm font-bold text-white">{eventContext.evento_nome}</p>
              </div>
            </div>
            
            {(eventContext.origem || eventContext.destino) && (
              <div className="grid grid-cols-1 gap-2 pt-3 border-t border-roxou-primary/10">
                {eventContext.origem && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-roxou-primary" />
                    <p className="text-[10px] text-roxou-text-muted font-medium">
                      Origem: <span className="text-white">{eventContext.origem}</span>
                    </p>
                  </div>
                )}
                {eventContext.destino && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="text-[10px] text-roxou-text-muted font-medium">
                      Destino: <span className="text-white">{eventContext.destino}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-roxou-bg/50 border border-roxou-border">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-3 h-3 text-roxou-primary" />
              <span className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-tighter">Destino</span>
            </div>
            <p className="text-sm font-bold text-white truncate">{req.origin}</p>
          </div>
          <div className="p-4 rounded-2xl bg-roxou-bg/50 border border-roxou-border">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3 h-3 text-roxou-primary" />
              <span className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-tighter">Saída</span>
            </div>
            <p className="text-sm font-bold text-white">{req.departure_time}</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 p-3 rounded-xl bg-roxou-primary/5 border border-roxou-primary/10 flex items-center gap-3">
            <Navigation className="w-4 h-4 text-roxou-primary" />
            <div>
              <p className="text-[9px] text-roxou-text-muted uppercase font-bold">Retorno</p>
              <p className="text-xs font-bold text-white">{req.is_return ? "Sim" : "Não"}</p>
            </div>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-[9px] text-roxou-text-muted uppercase font-bold">Estimativa</p>
              <p className="text-xs font-bold text-emerald-500">A combinar</p>
            </div>
          </div>
        </div>

        {req.notes && (
          <div className="mb-6 p-4 rounded-2xl bg-roxou-bg/30 border border-dashed border-roxou-border">
            <p className="text-xs text-roxou-text-muted italic leading-relaxed">
              &quot;{req.notes}&quot;
            </p>
          </div>
        )}

        {req.status === 'ABERTA' ? (
          <InterestButton requestId={req.id} driverId={userId} passengerId={req.passenger_id} />
        ) : showControls ? (
          <div className="space-y-6">
            {/* Live Map for Active Rides */}
            {["ACEITA", "A_CAMINHO", "CHEGUEI", "EM_CORRIDA"].includes(req.status) && (
              <div className="rounded-[24px] overflow-hidden border border-roxou-border h-[200px] relative z-10">
                <LiveRideMap 
                  requestId={req.id}
                  status={req.status}
                  pickup={{ lat: req.origin_lat || -23.9448, lng: req.origin_lng || -46.3303 }}
                  destination={{ lat: req.destination_lat || -23.5273, lng: req.destination_lng || -46.6784 }}
                  driverLocation={req.driver_lat && req.driver_lng ? { lat: req.driver_lat, lng: req.driver_lng } : undefined}
                />
              </div>
            )}

            {/* Location Tracker */}
            {["ACEITA", "A_CAMINHO", "CHEGUEI", "EM_CORRIDA"].includes(req.status) && (
              <DriverLocationTracker 
                requestId={req.id} 
                isActive={["A_CAMINHO", "CHEGUEI", "EM_CORRIDA"].includes(req.status)} 
              />
            )}

            <DriverStatusControls requestId={req.id} currentStatus={req.status} driverId={userId} />
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex p-1 bg-roxou-surface border border-roxou-border rounded-2xl sticky top-20 z-30 shadow-2xl">
        <button
          onClick={() => setActiveTab("leads")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === "leads" ? "bg-roxou-primary text-white shadow-lg" : "text-roxou-text-muted hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Oportunidades ({initialLeads.length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === "active" ? "bg-roxou-primary text-white shadow-lg" : "text-roxou-text-muted hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4" />
          Ativas ({initialActiveRides.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === "history" ? "bg-roxou-primary text-white shadow-lg" : "text-roxou-text-muted hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          Histórico ({initialHistory.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "leads" && (
          <div className="space-y-6">
            {initialLeads.length > 0 ? (
              initialLeads.map((lead) => renderRequestCard(lead))
            ) : (
              <div className="text-center py-20 px-8 rounded-[40px] border border-dashed border-roxou-border bg-roxou-surface/20">
                <AlertCircle className="w-10 h-10 text-roxou-text-muted mx-auto mb-4" />
                <h4 className="text-xl font-display font-bold mb-2 text-white">Nenhum rolê agora...</h4>
                <p className="text-roxou-text-muted">Fique ligado, as melhores oportunidades surgem rápido.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "active" && (
          <div className="space-y-6">
            {initialActiveRides.length > 0 ? (
              initialActiveRides.map((ride) => renderRequestCard(ride, true))
            ) : (
              <div className="text-center py-20 px-8 rounded-[40px] border border-dashed border-roxou-border bg-roxou-surface/20">
                <Zap className="w-10 h-10 text-roxou-text-muted mx-auto mb-4" />
                <h4 className="text-xl font-display font-bold mb-2 text-white">Nenhuma corrida ativa</h4>
                <p className="text-roxou-text-muted">Aceite uma oportunidade para começar.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            {initialHistory.length > 0 ? (
              initialHistory.map((ride) => renderRequestCard(ride))
            ) : (
              <div className="text-center py-20 px-8 rounded-[40px] border border-dashed border-roxou-border bg-roxou-surface/20">
                <History className="w-10 h-10 text-roxou-text-muted mx-auto mb-4" />
                <h4 className="text-xl font-display font-bold mb-2 text-white">Histórico vazio</h4>
                <p className="text-roxou-text-muted">Suas corridas finalizadas aparecerão aqui.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
