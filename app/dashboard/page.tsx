import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Clock, MapPin, MessageSquare, ChevronRight, Zap } from "lucide-react";
import { redirect } from "next/navigation";

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
    .select("*")
    .eq("passenger_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch active connections
  const { data: connections } = await supabase
    .from("connections")
    .select(`
      *,
      driver:profiles!connections_driver_id_fkey(full_name, avatar_url),
      request:transport_requests(origin, departure_time)
    `)
    .eq("passenger_id", user.id)
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
          <div className="w-10 h-10 rounded-full bg-roxou-surface border border-roxou-border overflow-hidden">
            <img 
              src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-display font-extrabold mb-2">Olá, {user.user_metadata.full_name?.split(' ')[0] || 'Passageiro'}</h1>
          <p className="text-roxou-text-muted">Para onde vamos hoje?</p>
        </div>

        {/* Action Card */}
        <Link 
          href="/request/new"
          className="block p-8 rounded-[32px] bg-gradient-to-br from-roxou-primary to-roxou-secondary violet-glow transition-transform active:scale-95"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Novo Pedido</h2>
              <p className="text-white/80 text-sm">Publique sua rota e encontre motoristas disponíveis.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="text-white w-8 h-8" />
            </div>
          </div>
        </Link>

        {/* Active Connections */}
        {connections && connections.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-roxou-primary" />
              Conversas Ativas
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
                      src={conn.driver.avatar_url || `https://ui-avatars.com/api/?name=${conn.driver.full_name}`} 
                      alt={conn.driver.full_name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold">{conn.driver.full_name}</h4>
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
                  className="p-5 rounded-2xl bg-roxou-surface border border-roxou-border"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-roxou-primary/10 border border-roxou-primary/20 text-roxou-primary text-[10px] font-bold uppercase tracking-wider">
                      {req.status === 'open' ? 'Aberto' : req.status === 'filled' ? 'Finalizado' : 'Cancelado'}
                    </div>
                    <span className="text-xs text-roxou-text-muted">
                      {new Date(req.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="space-y-3">
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
