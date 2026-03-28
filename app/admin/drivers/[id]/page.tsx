import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { 
  ChevronLeft, 
  ShieldCheck, 
  UserX, 
  AlertCircle, 
  Clock, 
  Mail, 
  Phone, 
  Car, 
  Hash, 
  Calendar,
  User,
  FileText
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DossierActions from "@/components/DossierActions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DriverDossierPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();
  
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) redirect("/login");

  // Check if admin
  const { data: adminProfile } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", adminUser.id)
    .single();

  if (adminProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch driver profile
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  // Fetch driver data
  const { data: driver } = await adminSupabase
    .from("drivers")
    .select("*")
    .eq("user_id", id)
    .single();

  // Fetch moderation logs
  const { data: logs } = await adminSupabase
    .from("moderation_logs")
    .select(`
      *,
      admin:profiles!moderation_logs_admin_id_fkey(full_name)
    `)
    .eq("driver_id", id)
    .order("created_at", { ascending: false });

  if (!profile) {
    return (
      <div className="min-h-screen bg-roxou-bg text-white flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-roxou-primary mb-4" />
        <h1 className="text-2xl font-display font-black mb-2">Motorista não encontrado</h1>
        <p className="text-roxou-text-muted mb-6 text-center">Não foi possível localizar as informações deste perfil.</p>
        <Link href="/admin/dashboard" className="px-6 py-3 bg-roxou-primary rounded-2xl text-xs font-black uppercase tracking-widest">
          Voltar ao Painel
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    in_review: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    pending: "bg-roxou-primary/10 text-roxou-primary border-roxou-primary/20",
  };

  const statusLabels: Record<string, string> = {
    approved: "Aprovado",
    rejected: "Rejeitado",
    in_review: "Em Análise",
    pending: "Pendente",
  };

  const currentStatus = driver?.verification_status || "pending";

  return (
    <main className="min-h-screen bg-roxou-bg text-white pb-20">
      {/* Header Navigation */}
      <div className="sticky top-0 z-50 bg-roxou-bg/80 backdrop-blur-xl border-b border-roxou-border p-4 sm:p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-roxou-text-muted hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-roxou-primary" />
            <span className="text-xs font-black uppercase tracking-widest">Dossiê do Motorista</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 sm:p-10 space-y-10">
        {/* Profile Header Card */}
        <div className="relative rounded-[48px] bg-roxou-surface border border-roxou-border p-8 sm:p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-roxou-primary/10 blur-[100px] -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[40px] bg-roxou-bg border-2 border-roxou-border overflow-hidden violet-glow relative">
                <Image 
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}`} 
                  alt={profile.full_name} 
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className={`absolute -bottom-3 -right-3 px-4 py-2 rounded-2xl border border-roxou-border shadow-2xl text-[10px] font-black uppercase tracking-widest ${statusColors[currentStatus]}`}>
                {statusLabels[currentStatus]}
              </div>
            </div>

            <div className="text-center sm:text-left space-y-4">
              <h1 className="text-3xl sm:text-5xl font-display font-black leading-tight tracking-tight">
                {profile.full_name}
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-roxou-bg/50 border border-roxou-border text-roxou-text-muted">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-medium">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-roxou-bg/50 border border-roxou-border text-roxou-text-muted">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-medium">{driver?.phone || "Sem telefone"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Vehicle Info */}
          <div className="rounded-[40px] bg-roxou-surface border border-roxou-border p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-roxou-primary/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-roxou-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest">Veículo</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-roxou-border/50">
                <span className="text-xs text-roxou-text-muted font-medium">Modelo</span>
                <span className="text-sm font-bold">{driver?.vehicle_model || "Sem informação"}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-roxou-border/50">
                <span className="text-xs text-roxou-text-muted font-medium">Placa</span>
                <span className="text-sm font-bold uppercase tracking-widest">{driver?.vehicle_plate || "Sem informação"}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-roxou-text-muted font-medium">Data de Cadastro</span>
                <span className="text-sm font-bold">
                  {driver?.created_at ? new Date(driver.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : "Sem data"}
                </span>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="rounded-[40px] bg-roxou-surface border border-roxou-border p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-roxou-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-roxou-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest">Informações do Sistema</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-roxou-border/50">
                <span className="text-xs text-roxou-text-muted font-medium">ID do Usuário</span>
                <span className="text-[10px] font-mono text-roxou-text-muted truncate max-w-[150px]">{id}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-roxou-border/50">
                <span className="text-xs text-roxou-text-muted font-medium">Última Atualização</span>
                <span className="text-sm font-bold">
                  {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('pt-BR') : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-roxou-text-muted font-medium">Tipo de Conta</span>
                <span className="text-xs font-black uppercase tracking-widest text-roxou-primary">Motorista</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Notes & Actions */}
        <div className="rounded-[40px] bg-roxou-surface border border-roxou-border p-8 sm:p-12 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-roxou-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-roxou-primary" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest">Moderação e Notas</h3>
          </div>

          <DossierActions 
            driverId={id} 
            adminId={adminUser.id}
            initialStatus={currentStatus} 
            initialNote={driver?.admin_review_note || ""} 
          />
        </div>

        {/* Moderation History */}
        <div className="rounded-[40px] bg-roxou-surface border border-roxou-border p-8 sm:p-12 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-roxou-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-roxou-primary" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest">Histórico de Ações</h3>
          </div>

          <div className="space-y-4">
            {logs && logs.length > 0 ? (
              logs.map((log: any) => (
                <div key={log.id} className="p-6 rounded-3xl bg-roxou-bg border border-roxou-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        log.action === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        log.action === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {statusLabels[log.action] || log.action}
                      </div>
                      <span className="text-[10px] text-roxou-text-muted font-medium">
                        por {log.admin?.full_name || "Admin"}
                      </span>
                    </div>
                    <span className="text-[10px] text-roxou-text-muted">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {log.reason && (
                    <p className="text-xs text-roxou-text-muted leading-relaxed italic">
                      &quot;{log.reason}&quot;
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 rounded-3xl border-2 border-dashed border-roxou-border bg-roxou-surface/20">
                <p className="text-xs text-roxou-text-muted">Nenhum histórico registrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
