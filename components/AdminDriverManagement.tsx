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
  driver_status: string;
  updated_at: string;
}

export default function AdminDriverManagement({ initialDrivers }: { initialDrivers: Driver[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredDrivers = drivers.filter(d => d.driver_status === filter);

  const fetchDrivers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "driver")
      .order("updated_at", { ascending: false });
    
    if (!error && data) {
      setDrivers(data);
    }
    setLoading(false);
  };

  const handleBulkAction = async (status: "approved" | "rejected") => {
    const driversToUpdate = filteredDrivers.map(d => d.id);
    if (driversToUpdate.length === 0) return;

    if (!confirm(`Tem certeza que deseja ${status === 'approved' ? 'APROVAR' : 'REJEITAR'} todos os ${driversToUpdate.length} motoristas filtrados?`)) {
      return;
    }

    setActionLoading("bulk");
    const { error } = await supabase
      .from("profiles")
      .update({ driver_status: status })
      .in("id", driversToUpdate);

    if (!error) {
      await fetchDrivers();
      router.refresh();
    }
    setActionLoading(null);
  };

  const pendingCount = drivers.filter(d => d.driver_status === 'pending').length;
  const approvedCount = drivers.filter(d => d.driver_status === 'approved').length;
  const rejectedCount = drivers.filter(d => d.driver_status === 'rejected').length;

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
              className="p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] bg-roxou-surface border border-roxou-border flex items-center justify-between group hover:border-roxou-primary/40 transition-all hover:shadow-2xl hover:shadow-roxou-primary/5"
            >
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[24px] bg-roxou-bg border border-roxou-border overflow-hidden violet-glow">
                  <img 
                    src={driver.avatar_url || `https://ui-avatars.com/api/?name=${driver.full_name}`} 
                    alt={driver.full_name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-base sm:text-lg leading-tight">{driver.full_name}</h4>
                  <p className="text-[10px] sm:text-xs text-roxou-text-muted mb-1 sm:mb-2 truncate max-w-[150px] sm:max-w-none">{driver.email}</p>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      driver.driver_status === 'approved' ? 'bg-green-500' : 
                      driver.driver_status === 'rejected' ? 'bg-red-500' : 
                      'bg-yellow-500 animate-pulse'
                    }`} />
                    <span className={`text-[8px] sm:text-[10px] uppercase font-bold tracking-widest ${
                      driver.driver_status === 'approved' ? 'text-green-500' : 
                      driver.driver_status === 'rejected' ? 'text-red-500' : 
                      'text-yellow-500'
                    }`}>
                      {driver.driver_status === 'approved' ? 'Aprovado' : 
                       driver.driver_status === 'rejected' ? 'Rejeitado' : 
                       'Aguardando'}
                    </span>
                  </div>
                </div>
              </div>
              <Link 
                href={`/admin/drivers/${driver.id}`}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-roxou-bg border border-roxou-border flex items-center justify-center hover:bg-roxou-primary hover:text-white transition-all group-hover:scale-110"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
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
