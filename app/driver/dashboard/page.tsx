import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Zap, MapPin, Clock, MessageSquare, ChevronRight, Star, Users } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DriverDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch driver profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "driver") {
    redirect("/dashboard");
  }

  if (profile?.driver_status !== "approved") {
    redirect("/driver/onboarding");
  }

  // Fetch open transport requests (leads)
  const { data: leads } = await supabase
    .from("transport_requests")
    .select(`
      *,
      passenger:profiles!transport_requests_passenger_id_fkey(full_name, avatar_url)
    `)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  // Fetch active connections
  const { data: connections } = await supabase
    .from("connections")
    .select(`
      *,
      passenger:profiles!connections_passenger_id_fkey(full_name, avatar_url),
      request:transport_requests(origin, departure_time)
    `)
    .eq("driver_id", user.id)
    .eq("status", "active");

  return (
    <div className="min-h-screen bg-roxou-bg pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-40 py-4 px-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="text-roxou-primary w-6 h-6 fill-current" />
            <span className="text-xl font-display font-bold tracking-tighter">ROXOU</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-roxou-primary uppercase tracking-wider">Motorista VIP</p>
              <p className="text-[10px] text-roxou-text-muted">Status: Aprovado</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-roxou-surface border border-roxou-border overflow-hidden">
              <img 
                src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-display font-extrabold mb-2">Olá, {user.user_metadata.full_name?.split(' ')[0] || 'Motorista'}</h1>
          <p className="text-roxou-text-muted">Há novos passageiros aguardando conexão.</p>
        </div>

        {/* Active Connections */}
        {connections && connections.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-roxou-primary" />
              Conversas em Andamento
            </h3>
            <div className="space-y-4">
              {connections.map((conn: any) => (
                <Link 
                  key={conn.id}
                  href={`/chat/${conn.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-roxou-surface border border-roxou-border hover:border-roxou-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-roxou-bg border border-roxou-border overflow-hidden">
                    <img 
                      src={conn.passenger.avatar_url || `https://ui-avatars.com/api/?name=${conn.passenger.full_name}`} 
                      alt={conn.passenger.full_name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold">{conn.passenger.full_name}</h4>
                    <p className="text-xs text-roxou-text-muted truncate max-w-[200px]">
                      Para: {conn.request.origin}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-roxou-text-muted" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Leads Feed */}
        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-roxou-primary" />
            Oportunidades Disponíveis
          </h3>
          <div className="space-y-4">
            {leads && leads.length > 0 ? (
              leads.map((lead: any) => (
                <div 
                  key={lead.id}
                  className="p-6 rounded-[32px] bg-roxou-surface border border-roxou-border hover:border-roxou-primary/20 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-roxou-bg border border-roxou-border overflow-hidden">
                        <img 
                          src={lead.passenger.avatar_url || `https://ui-avatars.com/api/?name=${lead.passenger.full_name}`} 
                          alt={lead.passenger.full_name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold">{lead.passenger.full_name}</h4>
                        <p className="text-[10px] text-roxou-text-muted uppercase tracking-widest">Passageiro Verificado</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-roxou-text-muted uppercase tracking-widest mb-1">Publicado</p>
                      <p className="text-xs font-medium">{new Date(lead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-roxou-bg border border-roxou-border">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3 h-3 text-roxou-primary" />
                        <span className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-tighter">Destino</span>
                      </div>
                      <p className="text-sm font-medium truncate">{lead.origin}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-roxou-bg border border-roxou-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-roxou-primary" />
                        <span className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-tighter">Saída</span>
                      </div>
                      <p className="text-sm font-medium">{lead.departure_time}</p>
                    </div>
                  </div>

                  {lead.notes && (
                    <p className="text-sm text-roxou-text-muted mb-6 line-clamp-2 italic">
                      "{lead.notes}"
                    </p>
                  )}

                  <button 
                    className="w-full py-4 bg-roxou-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Conectar e Negociar
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 p-8 rounded-3xl border border-dashed border-roxou-border">
                <p className="text-roxou-text-muted">Nenhum pedido aberto no momento.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
