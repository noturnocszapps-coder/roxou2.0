import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Zap, Users, ShieldAlert, CheckCircle2, XCircle, Clock, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import AdminDriverManagement from "@/components/AdminDriverManagement";
import RefreshDashboard from "@/components/RefreshDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch admin profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch all drivers for the management component
  const { data: allDrivers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "driver")
    .order("updated_at", { ascending: false });

  // Fetch recent reports
  const { data: reports } = await supabase
    .from("reports")
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(full_name),
      reported:profiles!reports_reported_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  // Stats
  const { count: totalDrivers } = await supabase
    .from("profiles")
    .select("*", { count: 'exact', head: true })
    .eq("role", "driver");

  const { count: totalRequests } = await supabase
    .from("transport_requests")
    .select("*", { count: 'exact', head: true });

  const pendingCount = allDrivers?.filter(d => d.driver_status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-roxou-bg pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-40 py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="text-roxou-primary w-6 h-6 fill-current" />
            <span className="text-xl font-display font-bold tracking-tighter">ROXOU ADMIN</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden md:inline text-[10px] font-black text-roxou-primary uppercase tracking-[0.2em]">Painel de Controle</span>
              <Link 
                href="/profile"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-roxou-surface border border-roxou-border overflow-hidden hover:border-roxou-primary transition-all active:scale-95 shadow-lg"
              >
                <img 
                  src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} 
                  alt="Admin" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </Link>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 space-y-12">
        {/* Page Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-black text-white tracking-tight">Roxou Admin</h1>
          <p className="text-roxou-text-muted font-medium">Gerencie motoristas e acompanhe a atividade da plataforma</p>
        </div>

        {/* Stats Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-roxou-primary">Visão Geral da Plataforma</h2>
            <RefreshDashboard />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Main Metric: Motoristas */}
            <div className="p-8 rounded-[40px] bg-roxou-surface border-2 border-roxou-primary/30 relative overflow-hidden group md:col-span-2 lg:col-span-2 violet-glow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-roxou-primary/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-roxou-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-roxou-primary" />
                </div>
                <p className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-widest">Total Motoristas</p>
              </div>
              <div className="flex flex-col">
                <p className="text-5xl font-display font-black text-white">{totalDrivers || 0}</p>
                {totalDrivers === 0 && (
                  <p className="text-[10px] font-bold text-roxou-text-muted/60 uppercase tracking-widest mt-1">Aguardando atividade</p>
                )}
              </div>
            </div>

            {/* Secondary Metric: Pedidos */}
            <div className="p-8 rounded-[40px] bg-roxou-surface border border-roxou-border relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-roxou-secondary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-widest mb-2">Pedidos Totais</p>
              <p className="text-3xl font-display font-bold text-white/80">{totalRequests || 0}</p>
              {totalRequests === 0 && (
                <p className="text-[10px] font-bold text-roxou-text-muted/40 uppercase tracking-widest mt-1">Nenhum dado ainda</p>
              )}
            </div>

            {/* Alert Metric: Denúncias */}
            <div className="p-8 rounded-[40px] bg-roxou-surface border border-red-500/30 relative overflow-hidden group shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] text-red-500/80 uppercase font-bold tracking-widest mb-2">Denúncias</p>
              <p className="text-3xl font-display font-bold text-red-500">{reports?.length || 0}</p>
              {(!reports || reports.length === 0) && (
                <p className="text-[10px] font-bold text-red-500/40 uppercase tracking-widest mt-1">Tudo limpo</p>
              )}
            </div>

            {/* Pending Metric */}
            <div className="p-8 rounded-[40px] bg-roxou-surface border border-roxou-border relative overflow-hidden group lg:col-span-1 md:col-span-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-widest mb-2">Pendentes</p>
              <p className="text-3xl font-display font-bold text-yellow-500">{pendingCount}</p>
              {pendingCount === 0 && (
                <p className="text-[10px] font-bold text-roxou-text-muted/40 uppercase tracking-widest mt-1">Sem pendências</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Driver Management Section */}
          <div className="lg:col-span-2">
            <AdminDriverManagement initialDrivers={allDrivers || []} />
          </div>

          {/* Recent Reports Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                <ShieldAlert className="w-7 h-7 text-red-500" />
                Alertas
              </h3>
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                Crítico
              </span>
            </div>

            <div className="space-y-4">
              {reports && reports.length > 0 ? (
                reports.map((report: any) => (
                  <div 
                    key={report.id}
                    className="p-6 rounded-[32px] bg-roxou-surface border border-roxou-border space-y-4 hover:border-red-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                        {report.reason}
                      </div>
                      <span className="text-[10px] text-roxou-text-muted font-medium">
                        {new Date(report.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-roxou-text-muted leading-relaxed">
                        <span className="text-white font-bold">{report.reporter.full_name}</span> denunciou <span className="text-white font-bold">{report.reported.full_name}</span>
                      </p>
                      <div className="p-4 rounded-2xl bg-roxou-bg border border-roxou-border italic text-sm text-roxou-text-muted/80 group-hover:border-red-500/20 transition-all">
                        &quot;{report.details}&quot;
                      </div>
                    </div>
                    <button className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95">
                      Analisar Caso
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 p-10 rounded-[40px] border-2 border-dashed border-roxou-border bg-roxou-surface/20">
                  <div className="w-16 h-16 bg-roxou-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-roxou-border">
                    <ShieldAlert className="w-8 h-8 text-roxou-text-muted/30" />
                  </div>
                  <h4 className="font-bold text-roxou-text-muted mb-1">Comunidade Segura</h4>
                  <p className="text-xs text-roxou-text-muted/60">Nenhuma denúncia recente.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
