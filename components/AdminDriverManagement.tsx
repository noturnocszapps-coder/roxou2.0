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
    <section className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <h3 className="text-2xl font-display font-bold flex items-center gap-3">
          <Users className="w-7 h-7 text-roxou-primary" />
          Gestão de Motoristas
        </h3>
        
        <div className="flex items-center gap-2 bg-roxou-surface p-1.5 rounded-2xl border border-roxou-border shadow-inner">
          <button 
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'pending' ? 'bg-roxou-primary text-white shadow-lg shadow-roxou-primary/40 scale-105' : 'text-roxou-text-muted hover:text-white hover:bg-white/5'}`}
          >
            Pendentes
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${filter === 'pending' ? 'bg-white text-roxou-primary' : 'bg-roxou-border text-roxou-text-muted'}`}>
              {pendingCount}
            </span>
          </button>
          <button 
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'approved' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105' : 'text-roxou-text-muted hover:text-white hover:bg-white/5'}`}
          >
            Aprovados
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${filter === 'approved' ? 'bg-white text-emerald-500' : 'bg-roxou-border text-roxou-text-muted'}`}>
              {approvedCount}
            </span>
          </button>
          <button 
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'rejected' ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 scale-105' : 'text-roxou-text-muted hover:text-white hover:bg-white/5'}`}
          >
            Rejeitados
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${filter === 'rejected' ? 'bg-white text-red-500' : 'bg-roxou-border text-roxou-text-muted'}`}>
              {rejectedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredDrivers.length > 0 && filter === "pending" && (
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-roxou-primary/5 border border-roxou-primary/10 animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-bold text-roxou-primary uppercase tracking-widest flex-grow ml-2">Ações em Massa ({filteredDrivers.length})</p>
          <div className="flex items-center gap-2">
            <button 
              disabled={actionLoading !== null}
              onClick={() => handleBulkAction("approved")}
              className="px-4 py-2 rounded-xl bg-green-500 text-white text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              {actionLoading === "bulk" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckSquare className="w-3 h-3" />}
              Aprovar Todos
            </button>
            <button 
              disabled={actionLoading !== null}
              onClick={() => handleBulkAction("rejected")}
              className="px-4 py-2 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              {actionLoading === "bulk" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XSquare className="w-3 h-3" />}
              Rejeitar Todos
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-roxou-primary animate-spin" />
          </div>
        ) : filteredDrivers.length > 0 ? (
          filteredDrivers.map((driver) => (
            <div 
              key={driver.id}
              className="p-6 rounded-[32px] bg-roxou-surface border border-roxou-border flex items-center justify-between group hover:border-roxou-primary/40 transition-all hover:shadow-2xl hover:shadow-roxou-primary/5"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[24px] bg-roxou-bg border border-roxou-border overflow-hidden violet-glow">
                  <img 
                    src={driver.avatar_url || `https://ui-avatars.com/api/?name=${driver.full_name}`} 
                    alt={driver.full_name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{driver.full_name}</h4>
                  <p className="text-xs text-roxou-text-muted mb-2">{driver.email}</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      driver.driver_status === 'approved' ? 'bg-green-500' : 
                      driver.driver_status === 'rejected' ? 'bg-red-500' : 
                      'bg-yellow-500 animate-pulse'
                    }`} />
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${
                      driver.driver_status === 'approved' ? 'text-green-500' : 
                      driver.driver_status === 'rejected' ? 'text-red-500' : 
                      'text-yellow-500'
                    }`}>
                      {driver.driver_status === 'approved' ? 'Aprovado' : 
                       driver.driver_status === 'rejected' ? 'Rejeitado' : 
                       'Aguardando Revisão'}
                    </span>
                  </div>
                </div>
              </div>
              <Link 
                href={`/admin/drivers/${driver.id}`}
                className="w-12 h-12 rounded-2xl bg-roxou-bg border border-roxou-border flex items-center justify-center hover:bg-roxou-primary hover:text-white transition-all group-hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-20 p-10 rounded-[40px] border-2 border-dashed border-roxou-border bg-roxou-surface/20">
            <div className="w-16 h-16 bg-roxou-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-roxou-border">
              {filter === 'pending' ? <Clock className="w-8 h-8 text-roxou-text-muted/30" /> : 
               filter === 'approved' ? <CheckCircle2 className="w-8 h-8 text-roxou-text-muted/30" /> :
               <XCircle className="w-8 h-8 text-roxou-text-muted/30" />}
            </div>
            <h4 className="font-bold text-roxou-text-muted mb-1">
              {filter === 'pending' ? 'Nenhum motorista pendente' : 
               filter === 'approved' ? 'Nenhum aprovado' : 
               'Nenhum rejeitado'}
            </h4>
            <p className="text-xs text-roxou-text-muted/60">
              {filter === 'pending' ? 'Quando novos cadastros chegarem, aparecerão aqui.' : 
               'Não encontramos motoristas com este status.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
