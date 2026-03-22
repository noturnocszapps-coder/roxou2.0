"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter,
  CheckSquare,
  XSquare,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Driver {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  verification_status: string;
  updated_at: string;
  phone?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  admin_review_note?: string;
  created_at?: string;
}

export default function AdminDriverManagement({ initialDrivers }: { initialDrivers: Driver[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredDrivers = drivers.filter(d => d.verification_status === filter);

  const fetchDrivers = async () => {
    setLoading(true);
    // Fetch from profiles table and join with drivers
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        updated_at,
        drivers:drivers(
          verification_status,
          phone,
          vehicle_model,
          vehicle_plate,
          admin_review_note,
          created_at
        )
      `)
      .eq("role", "driver")
      .order("updated_at", { ascending: false });
    
    if (!error && data) {
      const formattedDrivers = data.map((p: any) => ({
        id: p.id,
        full_name: p.full_name || "N/A",
        email: p.email || "N/A",
        avatar_url: p.avatar_url || "",
        verification_status: p.drivers?.[0]?.verification_status || "pending",
        updated_at: p.updated_at,
        phone: p.drivers?.[0]?.phone || "N/A",
        vehicle_model: p.drivers?.[0]?.vehicle_model || "N/A",
        vehicle_plate: p.drivers?.[0]?.vehicle_plate || "N/A",
        admin_review_note: p.drivers?.[0]?.admin_review_note || "",
        created_at: p.drivers?.[0]?.created_at || p.updated_at
      }));
      setDrivers(formattedDrivers);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (driverId: string, status: string, note?: string) => {
    setActionLoading(driverId);
    const { error } = await supabase
      .from("drivers")
      .upsert({
        user_id: driverId,
        verification_status: status,
        admin_review_note: note,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (!error) {
      await fetchDrivers();
      router.refresh();
    }
    setActionLoading(null);
  };

  const handleBulkAction = async (status: "approved" | "rejected") => {
    const driversToUpdate = filteredDrivers.map(d => d.id);
    if (driversToUpdate.length === 0) return;

    if (!confirm(`Tem certeza que deseja ${status === 'approved' ? 'APROVAR' : 'REJEITAR'} todos os ${driversToUpdate.length} motoristas filtrados?`)) {
      return;
    }

    setActionLoading("bulk");
    const { error } = await supabase
      .from("drivers")
      .upsert(driversToUpdate.map(id => ({
        user_id: id,
        verification_status: status,
        updated_at: new Date().toISOString()
      })));

    if (!error) {
      await fetchDrivers();
      router.refresh();
    }
    setActionLoading(null);
  };

  const pendingCount = drivers.filter(d => d.verification_status === 'pending').length;
  const inReviewCount = drivers.filter(d => d.verification_status === 'in_review').length;
  const approvedCount = drivers.filter(d => d.verification_status === 'approved').length;
  const rejectedCount = drivers.filter(d => d.verification_status === 'rejected').length;

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <h3 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-3">
          <Users className="w-6 h-6 sm:w-7 sm:h-7 text-roxou-primary" />
          Gestão de Motoristas
        </h3>
        
        <div className="flex items-center gap-1 sm:gap-2 bg-roxou-surface p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-roxou-border shadow-inner overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setFilter("pending")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${filter === 'pending' ? 'bg-roxou-primary text-white shadow-lg shadow-roxou-primary/40 scale-105' : 'text-roxou-text-muted hover:text-white hover:bg-white/5'}`}
          >
            Pendentes
            <span className={`px-1 sm:px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] ${filter === 'pending' ? 'bg-white text-roxou-primary' : 'bg-roxou-border text-roxou-text-muted'}`}>
              {pendingCount}
            </span>
          </button>
          <button 
            onClick={() => setFilter("in_review")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${filter === 'in_review' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40 scale-105' : 'text-roxou-text-muted hover:text-white hover:bg-white/5'}`}
          >
            Em Análise
            <span className={`px-1 sm:px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] ${filter === 'in_review' ? 'bg-white text-amber-500' : 'bg-roxou-border text-roxou-text-muted'}`}>
              {inReviewCount}
            </span>
          </button>
          <button 
            onClick={() => setFilter("approved")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${filter === 'approved' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105' : 'text-roxou-text-muted hover:text-white hover:bg-white/5'}`}
          >
            Aprovados
            <span className={`px-1 sm:px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] ${filter === 'approved' ? 'bg-white text-emerald-500' : 'bg-roxou-border text-roxou-text-muted'}`}>
              {approvedCount}
            </span>
          </button>
          <button 
            onClick={() => setFilter("rejected")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${filter === 'rejected' ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 scale-105' : 'text-roxou-text-muted hover:text-white hover:bg-white/5'}`}
          >
            Rejeitados
            <span className={`px-1 sm:px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] ${filter === 'rejected' ? 'bg-white text-red-500' : 'bg-roxou-border text-roxou-text-muted'}`}>
              {rejectedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredDrivers.length > 0 && filter === "pending" && (
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-4 rounded-2xl sm:rounded-3xl bg-roxou-primary/5 border border-roxou-primary/10 animate-in fade-in slide-in-from-top-2">
          <p className="text-[10px] sm:text-xs font-bold text-roxou-primary uppercase tracking-widest flex-grow sm:ml-2">Ações em Massa ({filteredDrivers.length})</p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              disabled={actionLoading !== null}
              onClick={() => handleBulkAction("approved")}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-green-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              {actionLoading === "bulk" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckSquare className="w-3 h-3" />}
              Aprovar Todos
            </button>
            <button 
              disabled={actionLoading !== null}
              onClick={() => handleBulkAction("rejected")}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-red-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              {actionLoading === "bulk" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XSquare className="w-3 h-3" />}
              Rejeitar Todos
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-roxou-primary animate-spin" />
          </div>
        ) : filteredDrivers.length > 0 ? (
          filteredDrivers.map((driver) => (
            <div 
              key={driver.id}
              className="p-5 sm:p-8 rounded-[32px] sm:rounded-[48px] bg-roxou-surface border border-roxou-border flex flex-col gap-6 group hover:border-roxou-primary/40 transition-all hover:shadow-2xl hover:shadow-roxou-primary/5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[32px] bg-roxou-bg border border-roxou-border overflow-hidden violet-glow">
                    <img 
                      src={driver.avatar_url || `https://ui-avatars.com/api/?name=${driver.full_name}`} 
                      alt={driver.full_name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-xl sm:text-2xl leading-tight text-white">{driver.full_name}</h4>
                    <p className="text-xs sm:text-sm text-roxou-text-muted mb-2">{driver.email}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[9px] sm:text-[10px] uppercase font-black tracking-widest border ${
                        driver.verification_status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                        driver.verification_status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                        driver.verification_status === 'in_review' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                        'bg-roxou-primary/10 border-roxou-primary/20 text-roxou-primary'
                      }`}>
                        {driver.verification_status === 'approved' ? 'Aprovado' : 
                         driver.verification_status === 'rejected' ? 'Rejeitado' : 
                         driver.verification_status === 'in_review' ? 'Em Análise' :
                         'Pendente'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-roxou-bg border border-roxou-border text-[9px] sm:text-[10px] text-roxou-text-muted font-bold uppercase tracking-widest">
                        Desde {new Date(driver.created_at || driver.updated_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/admin/drivers/${driver.id}`}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-roxou-bg border border-roxou-border flex items-center justify-center gap-2 hover:bg-roxou-primary hover:text-white transition-all group-hover:scale-105 text-xs font-black uppercase tracking-widest"
                  >
                    Ver Detalhes
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-roxou-bg/50 border border-roxou-border/50">
                <div className="space-y-1">
                  <p className="text-[9px] text-roxou-text-muted uppercase font-black tracking-widest">Telefone</p>
                  <p className="text-sm font-bold text-white/90">{driver.phone || "Não informado"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-roxou-text-muted uppercase font-black tracking-widest">Veículo</p>
                  <p className="text-sm font-bold text-white/90">{driver.vehicle_model || "Não informado"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-roxou-text-muted uppercase font-black tracking-widest">Placa</p>
                  <p className="text-sm font-bold text-white/90 uppercase">{driver.vehicle_plate || "N/A"}</p>
                </div>
              </div>

              {driver.admin_review_note && (
                <div className="p-4 rounded-2xl bg-roxou-primary/5 border border-roxou-primary/10 italic text-xs text-roxou-text-muted/80">
                  &quot;{driver.admin_review_note}&quot;
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-grow flex items-center gap-2 px-4 py-2 rounded-2xl bg-roxou-bg border border-roxou-border">
                  <Filter className="w-4 h-4 text-roxou-text-muted" />
                  <input 
                    type="text" 
                    placeholder="Nota de revisão (opcional)..."
                    className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-roxou-text-muted/30"
                    onBlur={(e) => {
                      if (e.target.value !== driver.admin_review_note) {
                        handleUpdateStatus(driver.id, driver.verification_status, e.target.value);
                      }
                    }}
                    defaultValue={driver.admin_review_note}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={actionLoading === driver.id}
                    onClick={() => handleUpdateStatus(driver.id, "approved")}
                    className="flex-1 px-4 py-3 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    {actionLoading === driver.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    Aprovar
                  </button>
                  <button 
                    disabled={actionLoading === driver.id}
                    onClick={() => handleUpdateStatus(driver.id, "in_review")}
                    className="flex-1 px-4 py-3 rounded-2xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 transition-all disabled:opacity-50"
                  >
                    {actionLoading === driver.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                    Análise
                  </button>
                  <button 
                    disabled={actionLoading === driver.id}
                    onClick={() => handleUpdateStatus(driver.id, "rejected")}
                    className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {actionLoading === driver.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                    Rejeitar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 sm:py-20 p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border-2 border-dashed border-roxou-border bg-roxou-surface/20">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-roxou-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-roxou-border">
              {filter === 'pending' ? <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-roxou-text-muted/30" /> : 
               filter === 'approved' ? <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-roxou-text-muted/30" /> :
               <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-roxou-text-muted/30" />}
            </div>
            <h4 className="font-bold text-roxou-text-muted mb-1 text-sm sm:text-base">
              {filter === 'pending' ? 'Nenhum motorista pendente' : 
               filter === 'approved' ? 'Nenhum aprovado' : 
               'Nenhum rejeitado'}
            </h4>
            <p className="text-[10px] sm:text-xs text-roxou-text-muted/60">
              {filter === 'pending' ? 'Quando novos cadastros chegarem, aparecerão aqui.' : 
               'Não encontramos motoristas com este status.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
