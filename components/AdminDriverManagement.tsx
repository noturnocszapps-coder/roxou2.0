"use client";

import { useState } from "react";
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
  Loader2,
  Search,
  Phone,
  Mail,
  Car,
  Hash,
  Calendar,
  MoreVertical,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  UserX,
  UserMinus
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

export default function AdminDriverManagement({ initialDrivers }: { initialDrivers: any[] }) {
  const supabase = createClient();
  const router = useRouter();
  
  // Normalize incoming data
  const drivers = (initialDrivers || []).map((p: any) => ({
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

  const pendingCount = drivers.filter(d => d.verification_status === 'pending').length;
  const inReviewCount = drivers.filter(d => d.verification_status === 'in_review').length;
  const approvedCount = drivers.filter(d => d.verification_status === 'approved').length;
  const rejectedCount = drivers.filter(d => d.verification_status === 'rejected').length;

  const defaultFilter =
    pendingCount > 0 ? "pending" :
    approvedCount > 0 ? "approved" :
    inReviewCount > 0 ? "in_review" :
    "rejected";

  const [filter, setFilter] = useState<string>(defaultFilter);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDrivers = drivers.filter(d => {
    const matchesFilter = d.verification_status === filter;
    const matchesSearch = d.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (d.vehicle_plate && d.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = async (driverId: string, status: string, note?: string) => {
    setActionLoading(driverId);
    // CRITICAL: Using .from("drivers") as requested
    const { error } = await supabase
      .from("drivers")
      .upsert({
        user_id: driverId,
        verification_status: status,
        admin_review_note: note,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (!error) {
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
    // CRITICAL: Using .from("drivers") as requested
    const { error } = await supabase
      .from("drivers")
      .upsert(driversToUpdate.map(id => ({
        user_id: id,
        verification_status: status,
        updated_at: new Date().toISOString()
      })));

    if (!error) {
      router.refresh();
    }
    setActionLoading(null);
  };

  const tabs = [
    { id: "pending", label: "Pendentes", count: pendingCount, icon: Clock, color: "text-roxou-primary", bg: "bg-roxou-primary/10" },
    { id: "in_review", label: "Em Análise", count: inReviewCount, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "approved", label: "Aprovados", count: approvedCount, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "rejected", label: "Rejeitados", count: rejectedCount, icon: UserX, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <section className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-2xl font-display font-black flex items-center gap-3 text-white">
            <Users className="w-8 h-8 text-roxou-primary" />
            Gestão de Motoristas
          </h3>
          
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-roxou-text-muted group-focus-within:text-roxou-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar motorista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none text-sm text-white transition-all placeholder:text-roxou-text-muted/30"
            />
          </div>
        </div>
        
        {/* Professional Tabs */}
        <div className="flex items-center gap-1 p-1.5 rounded-[24px] bg-roxou-surface border border-roxou-border shadow-2xl overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                filter === tab.id 
                  ? 'bg-roxou-bg text-white shadow-xl border border-roxou-border/50 scale-[1.02]' 
                  : 'text-roxou-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${filter === tab.id ? tab.color : 'text-roxou-text-muted'}`} />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-lg text-[9px] ${
                filter === tab.id ? tab.bg + ' ' + tab.color : 'bg-roxou-border text-roxou-text-muted'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredDrivers.length > 0 && filter === "pending" && (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-[32px] bg-roxou-primary/5 border border-roxou-primary/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 flex-grow">
            <div className="w-10 h-10 rounded-full bg-roxou-primary/20 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-roxou-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-roxou-primary uppercase tracking-widest">Ações em Massa</p>
              <p className="text-xs text-roxou-text-muted font-medium">{filteredDrivers.length} motoristas selecionados</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              disabled={actionLoading !== null}
              onClick={() => handleBulkAction("approved")}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {actionLoading === "bulk" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
              Aprovar Todos
            </button>
            <button 
              disabled={actionLoading !== null}
              onClick={() => handleBulkAction("rejected")}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
            >
              {actionLoading === "bulk" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
              Rejeitar Todos
            </button>
          </div>
        </div>
      )}

      {/* Driver List */}
      <div className="space-y-6">
        {filteredDrivers.length > 0 ? (
          filteredDrivers.map((driver) => (
            <div 
              key={driver.id}
              className="group relative rounded-[40px] bg-roxou-surface border border-roxou-border overflow-hidden hover:border-roxou-primary/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(157,78,221,0.1)]"
            >
              {/* Card Content */}
              <div className="p-6 sm:p-10 space-y-8">
                {/* Top Section: Profile Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5 sm:gap-8">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[32px] bg-roxou-bg border border-roxou-border overflow-hidden violet-glow relative z-10">
                        <img 
                          src={driver.avatar_url || `https://ui-avatars.com/api/?name=${driver.full_name}`} 
                          alt={driver.full_name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl border-2 border-roxou-surface z-20 flex items-center justify-center shadow-lg ${
                        driver.verification_status === 'approved' ? 'bg-emerald-500' : 
                        driver.verification_status === 'rejected' ? 'bg-red-500' : 
                        driver.verification_status === 'in_review' ? 'bg-amber-500' :
                        'bg-roxou-primary'
                      }`}>
                        {driver.verification_status === 'approved' ? <ShieldCheck className="w-4 h-4 text-white" /> : 
                         driver.verification_status === 'rejected' ? <UserX className="w-4 h-4 text-white" /> : 
                         driver.verification_status === 'in_review' ? <AlertCircle className="w-4 h-4 text-white" /> :
                         <Clock className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <h4 className="font-display font-black text-2xl sm:text-3xl leading-tight text-white tracking-tight">{driver.full_name}</h4>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-roxou-text-muted">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{driver.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-roxou-text-muted">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{driver.phone || "Não informado"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/admin/drivers/${driver.id}`}
                      className="flex-1 sm:flex-none px-8 py-4 rounded-2xl bg-roxou-bg border border-roxou-border flex items-center justify-center gap-3 hover:bg-roxou-primary hover:text-white transition-all group-hover:scale-105 text-[10px] font-black uppercase tracking-widest shadow-xl"
                    >
                      Dossiê Completo
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Middle Section: Vehicle & Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-3xl bg-roxou-bg/40 border border-roxou-border/50 space-y-3 group/item hover:border-roxou-primary/30 transition-colors">
                    <div className="flex items-center gap-2 text-roxou-text-muted">
                      <Car className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Veículo</span>
                    </div>
                    <p className="text-base font-bold text-white/90">{driver.vehicle_model || "Não informado"}</p>
                  </div>
                  
                  <div className="p-5 rounded-3xl bg-roxou-bg/40 border border-roxou-border/50 space-y-3 group/item hover:border-roxou-primary/30 transition-colors">
                    <div className="flex items-center gap-2 text-roxou-text-muted">
                      <Hash className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Placa</span>
                    </div>
                    <p className="text-base font-bold text-white/90 uppercase tracking-wider">{driver.vehicle_plate || "N/A"}</p>
                  </div>
                  
                  <div className="p-5 rounded-3xl bg-roxou-bg/40 border border-roxou-border/50 space-y-3 group/item hover:border-roxou-primary/30 transition-colors">
                    <div className="flex items-center gap-2 text-roxou-text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Cadastro</span>
                    </div>
                    <p className="text-base font-bold text-white/90">
                      {new Date(driver.created_at || driver.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Bottom Section: Moderation Actions */}
                <div className="pt-6 border-t border-roxou-border/50 space-y-6">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex-grow relative group/input">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-roxou-text-muted group-focus-within/input:text-roxou-primary transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Adicionar nota de revisão interna..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-roxou-bg border border-roxou-border outline-none text-xs text-white placeholder:text-roxou-text-muted/30 focus:border-roxou-primary transition-all"
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
                        className="flex-1 sm:w-32 px-4 py-4 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        {actionLoading === driver.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                        Aprovar
                      </button>
                      
                      <button 
                        disabled={actionLoading === driver.id}
                        onClick={() => handleUpdateStatus(driver.id, "in_review")}
                        className="flex-1 sm:w-32 px-4 py-4 rounded-2xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20 active:scale-95"
                      >
                        {actionLoading === driver.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                        Análise
                      </button>
                      
                      <button 
                        disabled={actionLoading === driver.id}
                        onClick={() => handleUpdateStatus(driver.id, "rejected")}
                        className="flex-1 sm:w-32 px-4 py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20 active:scale-95"
                      >
                        {actionLoading === driver.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 sm:py-32 p-10 rounded-[48px] border-2 border-dashed border-roxou-border bg-roxou-surface/20 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-20 h-20 bg-roxou-surface rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-roxou-border shadow-2xl">
              {filter === 'pending' ? <Clock className="w-10 h-10 text-roxou-text-muted/30" /> : 
               filter === 'approved' ? <ShieldCheck className="w-10 h-10 text-roxou-text-muted/30" /> :
               filter === 'in_review' ? <AlertCircle className="w-10 h-10 text-roxou-text-muted/30" /> :
               <UserX className="w-10 h-10 text-roxou-text-muted/30" />}
            </div>
            <h4 className="font-display font-black text-white text-2xl mb-2 tracking-tight">
              Nenhum motorista com esse status.
            </h4>
            <p className="text-sm text-roxou-text-muted/60 max-w-xs mx-auto font-medium">
              Tente outro filtro ou ajuste sua busca.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
