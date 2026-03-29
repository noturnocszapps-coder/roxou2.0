import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

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
      driver:profiles!transport_requests_driver_id_fkey(
        full_name, 
        avatar_url,
        drivers:drivers(verification_status, vehicle_model, vehicle_plate)
      )
    `)
    .eq("passenger_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch connections for these requests
  const { data: connections } = await supabase
    .from("connections")
    .select(`
      *,
      request:transport_requests(*),
      driver:profiles!connections_driver_id_fkey(
        full_name, 
        avatar_url,
        drivers:drivers(verification_status, vehicle_model, vehicle_plate)
      )
    `)
    .eq("passenger_id", user.id);

  return (
    <DashboardClient 
      user={user} 
      requests={requests || []} 
      connections={connections || []} 
    />
  );
}
