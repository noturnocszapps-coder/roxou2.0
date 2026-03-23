import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Zap, MapPin, Clock, MessageSquare, ChevronRight, Star, Users, Navigation, DollarSign, AlertCircle, Activity } from "lucide-react";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import LiveIndicators from "@/components/LiveIndicators";
import TimeAgo from "@/components/TimeAgo";
import AcceptRequestButton from "@/components/AcceptRequestButton";
import DriverRequestList from "@/components/DriverRequestList";

export const dynamic = "force-dynamic";

export default async function DriverDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch driver profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  // Fetch driver record for verification status - this is the ONLY source of truth for approval
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("user_id, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = profile?.role;
  const verificationStatus = driver?.verification_status;

  // 1. if not driver -> redirect("/")
  if (role !== "driver") {
    console.log("Not a driver role on dashboard. Redirecting to home.");
    redirect("/");
  }

  // 2. if not approved -> redirect("/driver/onboarding")
  if (verificationStatus !== "approved") {
    console.log("Non-approved driver detected on dashboard. Forcing redirect to onboarding.");
    redirect("/driver/onboarding");
  }

  // 3. if approved -> render dashboard
  // Fetch all relevant transport requests
  // 1. Leads (open/pending and no driver assigned)
  const { data: leads } = await supabase
    .from("transport_requests")
    .select(`
      *,
      passenger:profiles!transport_requests_passenger_id_fkey(full_name, avatar_url)
    `)
    .in("status", ["open", "pending"])
    .is("driver_id", null)
    .order("created_at", { ascending: false });

  // 2. Active Rides (accepted/in_progress assigned to this driver)
  const { data: activeRides } = await supabase
    .from("transport_requests")
    .select(`
      *,
      passenger:profiles!transport_requests_passenger_id_fkey(full_name, avatar_url)
    `)
    .in("status", ["accepted", "en_route", "arrived", "in_progress"])
    .eq("driver_id", user.id)
    .order("updated_at", { ascending: false });

  // 3. History (completed/cancelled assigned to this driver)
  const { data: history } = await supabase
    .from("transport_requests")
    .select(`
      *,
      passenger:profiles!transport_requests_passenger_id_fkey(full_name, avatar_url)
    `)
    .in("status", ["completed", "cancelled"])
    .eq("driver_id", user.id)
    .order("updated_at", { ascending: false });

  // Fetch active connections for quick chat access
  const { data: connections } = await supabase
    .from("connections")
    .select(`
      *,
      passenger:profiles!connections_passenger_id_fkey(full_name, avatar_url),
      request:transport_requests(id, origin, departure_time, status)
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
            <span className="text-xl font-display font-bold tracking-tighter text-white">ROXOU</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
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
            <p className="text-roxou-text-muted">Confira quem precisa de transporte agora na rede.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-roxou-primary/10 border border-roxou-primary/20 text-roxou-primary text-[10px] font-black uppercase tracking-widest">
            Painel Ativo
          </div>
        </div>

        {/* Live Stats */}
        <LiveIndicators initialDrivers={15} initialRequests={leads?.length || 0} />

        {/* Active Connections (Quick Chat) */}
        {connections && connections.length > 0 && (
          <section>
            <h3 className="text-[10px] text-roxou-primary uppercase font-bold tracking-[0.2em] mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chats em Aberto
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {connections.map((conn: any) => (
                <Link 
                  key={conn.id}
                  href={`/chat/${conn.id}`}
                  className="flex-shrink-0 w-16 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-roxou-surface border border-roxou-border overflow-hidden relative group-hover:border-roxou-primary transition-all">
                    <img 
                      src={conn.passenger.avatar_url || `https://ui-avatars.com/api/?name=${conn.passenger.full_name}`} 
                      alt={conn.passenger.full_name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[10px] text-roxou-text-muted text-center mt-2 font-bold truncate">{conn.passenger.full_name.split(' ')[0]}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Unified Request List with Tabs */}
        <DriverRequestList 
          initialLeads={leads || []} 
          initialActiveRides={activeRides || []} 
          initialHistory={history || []}
          userId={user.id} 
        />
      </main>
    </div>
  );
}
