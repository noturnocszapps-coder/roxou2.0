import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function PassengerDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return (
      <div style={{ minHeight: "100vh", background: "#09090b", color: "white", padding: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Erro ao carregar usuário
        </h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {userError.message}
        </pre>
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  const { data: requests, error: requestsError } = await supabase
    .from("transport_requests")
    .select(`
      *,
      driver:profiles!transport_requests_driver_id_fkey(
        full_name,
        avatar_url,
        drivers:drivers(verification_status)
      )
    `)
    .eq("passenger_id", user.id)
    .order("created_at", { ascending: false });

  const { data: connections, error: connectionsError } = await supabase
    .from("connections")
    .select(`
      *,
      driver:profiles!connections_driver_id_fkey(
        full_name,
        avatar_url,
        drivers:drivers(verification_status)
      ),
      request:transport_requests(origin, departure_time, status)
    `)
    .eq("passenger_id", user.id)
    .eq("status", "active");

  if (requestsError || connectionsError) {
    return (
      <div style={{ minHeight: "100vh", background: "#09090b", color: "white", padding: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Erro ao carregar dashboard
        </h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(
            {
              requestsError: requestsError?.message || null,
              connectionsError: connectionsError?.message || null,
            },
            null,
            2
          )}
        </pre>
      </div>
    );
  }

  // MODO TESTE:
  // Se quiser isolar o problema do DashboardClient,
  // descomente este bloco e comente o return final.
  /*
  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "white", padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        DASHBOARD SERVER OK
      </h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(
          {
            userId: user.id,
            requestsCount: requests?.length || 0,
            connectionsCount: connections?.length || 0,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
  */

  return (
    <DashboardClient
      user={user}
      requests={requests || []}
      connections={connections || []}
    />
  );
}