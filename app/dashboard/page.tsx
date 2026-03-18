import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Clock, MapPin, MessageSquare, ChevronRight, Zap, Activity } from "lucide-react";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import LiveIndicators from "@/components/LiveIndicators";
import RealTimeNotification from "@/components/RealTimeNotification";
import TimeAgo from "@/components/TimeAgo";
import PassengerCancelButton from "@/components/PassengerCancelButton";

export const dynamic = "force-dynamic";

export default async function PassengerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch transport requests
  const { data: requests } = await supabase
    .from("transport_requests")
    .select(`
      *,
      driver:profiles!transport_requests_driver_id_fkey(full_name, avatar_url)
    `)
    .eq("passenger_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch active connections
  const { data: connections } = await supabase
    .from("connections")
    .select(`
      *,
      driver:profiles!connections_driver_id_fkey(full_name, avatar_url),
      request:transport_requests(origin, departure_time, status)
    `)
    .eq("passenger_id", user.id)
    .eq("status", "active");

  return (
    <div className="min-h-screen bg-roxou-bg pb-20">
      <RealTimeNotification />
      
      {/* Header */}
      <header className="glass sticky top-0 z-40 py-4 px-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="text-roxou-primary w-6 h-6 fill-current" />
            <span className="text-xl font-display font-bold tracking-tighter">ROXOU</span>
          </div>
          <div className="flex items-center gap-3">
            <LogoutButton />
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
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-8">
        {/* Welcome */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-display font-extrabold mb-2">Salve, {user.user_metadata.full_name?.split(' ')[0] || 'Passageiro'}!</h1>
            <p className="text-roxou-text-muted">Pronto para o próximo rolê?</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </div>
        </div>

        {/* Live Stats */}
        <LiveIndicators />

        {/* Action Card */}
        <Link 
          href="/request/new"
          className="block p-8 rounded-[40px] bg-gradient-to-br from-roxou-primary to-roxou-secondary violet-glow transition-transform active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-3xl font-display font-extrabold mb-2">Pedir Carona</h2>
              <p className="text-white/80 text-sm font-medium">Publique sua rota e encontre motoristas agora.</p>
            </div>
            <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="text-white w-10 h-10" />
            </div>
          </div>
        </Link>

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
                  className="flex items-center gap-4 p-4 rounded-2xl bg-roxou-surface border border-roxou-border hover:border-roxou-primary/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-roxou-bg border border-roxou-border overflow-hidden relative">
                    <img 
                      src={conn.driver.avatar_url || `https://ui-avatars.com/api/?name=${conn.driver.full_name}`} 
                      alt={conn.driver.full_name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-roxou-surface rounded-full" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{conn.driver.full_name}</h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                        conn.request.status === 'accepted' ? 'bg-roxou-primary/20 text-roxou-primary border border-roxou-primary/30' :
                        conn.request.status === 'in_progress' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                        'bg-roxou-text-muted/20 text-roxou-text-muted border border-roxou-text-muted/30'
                      }`}>
                        {conn.request.status === 'accepted' ? 'Aceito' : 
                         conn.request.status === 'in_progress' ? 'Em Andamento' : 
                         conn.request.status === 'completed' ? 'Finalizado' : conn.request.status}
                      </span>
                    </div>
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

        {/* Recent Requests */}
        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-roxou-primary" />
            Meus Pedidos
          </h3>
          <div className="space-y-4">
            {requests && requests.length > 0 ? (
              requests.map((req: any) => (
                <div 
                  key={req.id}
                  className="p-5 rounded-2xl bg-roxou-surface border border-roxou-border hover:border-roxou-primary/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'open' ? 'bg-roxou-primary/10 border-roxou-primary/20 text-roxou-primary' : 
                      req.status === 'accepted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      req.status === 'in_progress' ? 'bg-roxou-secondary/10 border-roxou-secondary/20 text-roxou-secondary' :
                      req.status === 'completed' ? 'bg-roxou-text-muted/10 border-roxou-text-muted/20 text-roxou-text-muted' : 
                      'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                      {req.status === 'open' ? 'Aberto' : 
                       req.status === 'accepted' ? 'Aceito' :
                       req.status === 'in_progress' ? 'Em Andamento' :
                       req.status === 'completed' ? 'Finalizado' : 'Cancelado'}
                    </div>
                    <TimeAgo 
                      date={req.created_at} 
                      className="text-[10px] text-roxou-text-muted font-bold uppercase tracking-widest" 
                    />
                  </div>
                  
                  {(req.status === 'accepted' || req.status === 'in_progress' || req.status === 'completed') && req.driver && (
                    <div className={`mb-4 p-3 rounded-xl border flex items-center gap-3 ${
                      req.status === 'in_progress' ? 'bg-roxou-secondary/5 border-roxou-secondary/10' : 'bg-emerald-500/5 border-emerald-500/10'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-roxou-bg border border-roxou-border overflow-hidden">
                        <img 
                          src={req.driver.avatar_url || `https://ui-avatars.com/api/?name=${req.driver.full_name}`} 
                          alt={req.driver.full_name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className={`text-[10px] uppercase font-black tracking-widest ${
                          req.status === 'in_progress' ? 'text-roxou-secondary' : 'text-emerald-500'
                        }`}>
                          {req.status === 'in_progress' ? 'Corrida em andamento' : 
                           req.status === 'completed' ? 'Corrida finalizada' : 'Motorista a caminho'}
                        </p>
                        <p className="text-xs font-bold text-white">
                          {req.status === 'completed' ? `Você viajou com ${req.driver.full_name}` : `${req.driver.full_name} ${req.status === 'in_progress' ? 'está levando você' : 'aceitou seu pedido!'}`}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-roxou-primary mt-1" />
                      <div>
                        <p className="text-xs text-roxou-text-muted uppercase font-bold tracking-tighter">Origem</p>
                        <p className="text-sm font-medium">{req.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-roxou-primary mt-1" />
                      <div>
                        <p className="text-xs text-roxou-text-muted uppercase font-bold tracking-tighter">Saída</p>
                        <p className="text-sm font-medium">{req.departure_time}</p>
                      </div>
                    </div>
                  </div>

                  <PassengerCancelButton requestId={req.id} currentStatus={req.status} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 p-8 rounded-3xl border border-dashed border-roxou-border">
                <p className="text-roxou-text-muted">Você ainda não fez nenhum pedido.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
