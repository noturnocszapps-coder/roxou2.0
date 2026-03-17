import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Zap, Users, ShieldAlert, CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

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

  // Fetch pending drivers
  const { data: pendingDrivers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "driver")
    .eq("driver_status", "pending")
    .order("updated_at", { ascending: true });

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

  return (
    <div className="min-h-screen bg-roxou-bg pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-40 py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="text-roxou-primary w-6 h-6 fill-current" />
            <span className="text-xl font-display font-bold tracking-tighter">ROXOU ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-roxou-primary uppercase tracking-widest">Painel de Controle</span>
            <div className="w-10 h-10 rounded-full bg-roxou-surface border border-roxou-border overflow-hidden">
              <img 
                src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} 
                alt="Admin" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-roxou-surface border border-roxou-border">
            <p className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-widest mb-2">Motoristas</p>
            <p className="text-3xl font-display font-bold">{totalDrivers || 0}</p>
          </div>
          <div className="p-6 rounded-3xl bg-roxou-surface border border-roxou-border">
            <p className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-widest mb-2">Pedidos</p>
            <p className="text-3xl font-display font-bold">{totalRequests || 0}</p>
          </div>
          <div className="p-6 rounded-3xl bg-roxou-surface border border-roxou-border">
            <p className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-widest mb-2">Pendentes</p>
            <p className="text-3xl font-display font-bold text-roxou-primary">{pendingDrivers?.length || 0}</p>
          </div>
          <div className="p-6 rounded-3xl bg-roxou-surface border border-roxou-border">
            <p className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-widest mb-2">Denúncias</p>
            <p className="text-3xl font-display font-bold text-red-500">{reports?.length || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Pending Drivers List */}
          <section>
            <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-roxou-primary" />
              Motoristas Aguardando Aprovação
            </h3>
            <div className="space-y-4">
              {pendingDrivers && pendingDrivers.length > 0 ? (
                pendingDrivers.map((driver: any) => (
                  <div 
                    key={driver.id}
                    className="p-5 rounded-2xl bg-roxou-surface border border-roxou-border flex items-center justify-between group hover:border-roxou-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-roxou-bg border border-roxou-border overflow-hidden">
                        <img 
                          src={driver.avatar_url || `https://ui-avatars.com/api/?name=${driver.full_name}`} 
                          alt={driver.full_name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold">{driver.full_name}</h4>
                        <p className="text-xs text-roxou-text-muted">{driver.email}</p>
                      </div>
                    </div>
                    <Link 
                      href={`/admin/drivers/${driver.id}`}
                      className="p-2 rounded-full bg-roxou-bg border border-roxou-border hover:bg-roxou-primary hover:text-white transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 p-8 rounded-3xl border border-dashed border-roxou-border">
                  <p className="text-roxou-text-muted">Nenhum motorista pendente.</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Reports */}
          <section>
            <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              Denúncias Recentes
            </h3>
            <div className="space-y-4">
              {reports && reports.length > 0 ? (
                reports.map((report: any) => (
                  <div 
                    key={report.id}
                    className="p-5 rounded-2xl bg-roxou-surface border border-roxou-border space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                        {report.reason}
                      </div>
                      <span className="text-[10px] text-roxou-text-muted">
                        {new Date(report.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-xs text-roxou-text-muted">
                      <span className="text-white font-medium">{report.reporter.full_name}</span> denunciou <span className="text-white font-medium">{report.reported.full_name}</span>
                    </p>
                    <p className="text-sm italic text-roxou-text-muted line-clamp-2">
                      "{report.details}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 p-8 rounded-3xl border border-dashed border-roxou-border">
                  <p className="text-roxou-text-muted">Nenhuma denúncia registrada.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
