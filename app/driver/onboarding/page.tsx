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
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  // 2. read driver record from drivers by user_id
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("user_id, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = profile?.role;
  const verificationStatus = driver?.verification_status;

  // 3. if:
  // - role !== "driver" -> redirect to "/"
  if (role !== "driver") {
    console.log("Not a driver role. Redirecting to home.");
    redirect("/");
  }

  // - role === "driver" AND verification_status === "approved" -> redirect to "/driver/dashboard"
  if (verificationStatus === "approved") {
    console.log("Approved driver detected. Redirecting to dashboard.");
    redirect("/driver/dashboard");
  }

  // - otherwise render the pending screen
  // This includes "pending", "rejected", or even if the drivers row is missing (null)
  return (
    <div className="min-h-screen bg-roxou-bg">
      <DriverOnboardingStatus 
        role={role} 
        driverFound={!!driver} 
        verificationStatus={verificationStatus} 
      />
    </div>
  );
}
