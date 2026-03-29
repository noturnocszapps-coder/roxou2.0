import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DriverOnboardingStatus from "@/components/DriverOnboardingStatus";

export const dynamic = "force-dynamic";

export default async function DriverOnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. read profile role from profiles by id
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id);

  const profile = profiles && profiles.length > 0 ? profiles[0] : null;

  // 2. read driver record from drivers by user_id
  const { data: drivers, error: driverError } = await supabase
    .from("drivers")
    .select("user_id, verification_status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const driver = drivers && drivers.length > 0 ? drivers[0] : null;

  const role = profile?.role;
  const verification_status = driver?.verification_status;

  // Debug log for validation
  console.log('DRIVER STATUS:', verification_status);

  // 3. if:
  // - role !== "driver" -> redirect to "/"
  if (role !== "driver") {
    redirect("/");
  }

  if (verification_status === "approved") {
    redirect("/driver/dashboard");
  }

  // - otherwise render the pending screen
  // This includes "pending", "rejected", or even if the drivers row is missing (null)
  return (
    <div className="min-h-screen bg-roxou-bg">
      <DriverOnboardingStatus 
        role={role} 
        driverFound={!!driver} 
        verification_status={verification_status} 
      />
    </div>
  );
}
