import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Zap, MapPin, Clock, MessageSquare, ChevronRight, Star, Users, Navigation, DollarSign, AlertCircle, Activity } from "lucide-react";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import LiveIndicators from "@/components/LiveIndicators";
import TimeAgo from "@/components/TimeAgo";

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

  const isNew = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    return diffInMinutes < 15;
  };

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
            <Link 
              href="/profile"
              className="w-10 h-10 rounded-full bg-roxou-surface border border-roxou-border overflow-hidden hover:border-roxou-primary transition-all active:scale-95"
            >
              <img 
                src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-8">
        {/* Welcome */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-display font-extrabold mb-2 text-white">Salve, {user.user_metadata.full_name?.split(' ')[0] || 'Motorista'}!</h1>
            <p className="text-roxou-text-muted">A noite está agitada. Confira quem precisa de transporte agora.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-roxou-primary/10 border border-roxou-primary/20 text-roxou-primary text-[10px] font-black uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-roxou-primary animate-pulse" />
            Ativo
          </div>
        </div>

        {/* Live Stats */}
        <LiveIndicators initialDrivers={15} initialRequests={leads?.length || 0} />

        {/* Active Connections */}
        {connections && connections.length > 0 && (
          <section>
            <h3 className="text-[10px] text-roxou-primary uppercase font-bold tracking-[0.2em] mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Negociações Ativas
            </h3>
            <div className="space-y-4">
              {connections.map((conn: any) => (
                <Link 
                  key={conn.id}
                  href={`/chat/${conn.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-roxou-surface border border-roxou-border hover:border-roxou-primary/30 transition-all active:scale-[0.98] group"
                >
                  <div className="w-12 h-12 rounded-full bg-roxou-bg border border-roxou-border overflow-hidden relative">
                    <img 
                      src={conn.passenger.avatar_url || `https://ui-avatars.com/api/?name=${conn.passenger.full_name}`} 
                      alt={conn.passenger.full_name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-roxou-surface rounded-full" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-white">{conn.passenger.full_name}</h4>
                    <p className="text-xs text-roxou-text-muted truncate max-w-[200px]">
                      Para: {conn.request.origin}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-roxou-primary animate-pulse" />
                    <ChevronRight className="w-5 h-5 text-roxou-text-muted group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Leads Feed */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-roxou-primary" />
              Oportunidades
            </h3>
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-roxou-primary animate-pulse" />
              <span className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-widest">
                {leads?.length || 0} disponíveis
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {leads && leads.length > 0 ? (
              leads.map((lead: any) => (
                <div 
                  key={lead.id}
                  className={`relative p-6 rounded-[32px] bg-roxou-surface border border-roxou-border hover:border-roxou-primary/40 transition-all group overflow-hidden ${isNew(lead.created_at) ? 'shadow-2xl shadow-roxou-primary/5' : ''}`}
                >
                  {isNew(lead.created_at) && (
                    <div className="absolute top-0 right-0 bg-roxou-primary text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-tighter animate-pulse z-10">
                      Novo Pedido
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-roxou-bg border border-roxou-border overflow-hidden shadow-inner relative">
                        <img 
                          src={lead.passenger.avatar_url || `https://ui-avatars.com/api/?name=${lead.passenger.full_name}`} 
                          alt={lead.passenger.full_name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-roxou-surface rounded-full" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white">{lead.passenger.full_name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-[10px] text-roxou-text-muted font-bold">4.9 • Passageiro VIP</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-roxou-text-muted uppercase tracking-widest mb-1">Há quanto tempo</p>
                      <TimeAgo 
                        date={lead.created_at} 
                        prefix="" 
                        className="text-xs font-bold text-roxou-primary" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-roxou-bg/50 border border-roxou-border">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3 h-3 text-roxou-primary" />
                        <span className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-tighter">Destino</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{lead.origin}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-roxou-bg/50 border border-roxou-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-roxou-primary" />
                        <span className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-tighter">Saída</span>
                      </div>
                      <p className="text-sm font-bold text-white">{lead.departure_time}</p>
                    </div>
                  </div>

                  {/* Opportunity Details */}
                  <div className="flex gap-3 mb-6">
                    <div className="flex-1 p-3 rounded-xl bg-roxou-primary/5 border border-roxou-primary/10 flex items-center gap-3">
                      <Navigation className="w-4 h-4 text-roxou-primary" />
                      <div>
                        <p className="text-[9px] text-roxou-text-muted uppercase font-bold">Distância</p>
                        <p className="text-xs font-bold text-white">~4.2 km</p>
                      </div>
                    </div>
                    <div className="flex-1 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-[9px] text-roxou-text-muted uppercase font-bold">Estimativa</p>
                        <p className="text-xs font-bold text-emerald-500">R$ 25 - 35</p>
                      </div>
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="mb-6 p-4 rounded-2xl bg-roxou-bg/30 border border-dashed border-roxou-border">
                      <p className="text-xs text-roxou-text-muted italic leading-relaxed">
                        &quot;{lead.notes}&quot;
                      </p>
                    </div>
                  )}

                  <button 
                    className="w-full py-5 bg-roxou-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-roxou-primary/90 active:scale-95 transition-all shadow-lg shadow-roxou-primary/20 group"
                  >
                    <Zap className="w-5 h-5 fill-current group-hover:animate-bounce" />
                    Aceitar e Iniciar Chat
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 px-8 rounded-[40px] border border-dashed border-roxou-border bg-roxou-surface/20">
                <div className="w-20 h-20 bg-roxou-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-roxou-border">
                  <AlertCircle className="w-10 h-10 text-roxou-text-muted" />
                </div>
                <h4 className="text-xl font-display font-bold mb-2 text-white">Nenhum rolê agora...</h4>
                <p className="text-roxou-text-muted max-w-[200px] mx-auto">Mas fica ligado 👀, as melhores oportunidades surgem num piscar de olhos.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
