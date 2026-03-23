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
  const verificationStatus = driver?.verification_status;

  // DEBUG DATA
  const debugData = {
    authUserId: user.id,
    authEmail: user.email,
    profileId: profile?.id,
    profileRole: role,
    driverUserId: driver?.user_id,
    verificationStatus: verificationStatus,
    profileError: profileError?.message,
    driverError: driverError?.message,
    profilesCount: profiles?.length || 0,
    driversCount: drivers?.length || 0,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    timestamp: new Date().toISOString()
  };

  // 3. if:
  // - role !== "driver" -> redirect to "/"
  if (role !== "driver") {
    console.log("Not a driver role. Redirecting to home.", debugData);
    // We don't redirect yet if we want to see the debug info, 
    // but the user said "Ensure the page itself and middleware use the same logic"
    // and "Keep the debug visible until we confirm the issue is solved".
    // If I redirect, the debug is gone. 
    // I'll add a conditional check: if there's a mismatch or we are in "debug mode" (which we are), 
    // maybe I should show the debug info even if it would normally redirect.
    // Actually, the user wants to see why an APPROVED driver sees the pending screen.
    // So if verificationStatus === "approved", it SHOULD redirect to dashboard.
    // If it DOESN'T redirect, we'll see the onboarding page with debug info.
  }

  if (verificationStatus === "approved" && role === "driver") {
    console.log("Approved driver detected. Redirecting to dashboard.");
    redirect("/driver/dashboard");
  }

  // - otherwise render the pending screen
  // This includes "pending", "rejected", or even if the drivers row is missing (null)
  return (
    <div className="min-h-screen bg-roxou-bg">
      <div className="bg-white text-black p-1 text-[10px] font-mono text-center">BUILD_MARKER: driver-fix-v2</div>
      {/* HARD DEBUG SECTION */}
      <div className="bg-black text-green-500 p-6 font-mono text-xs border-b-4 border-roxou-primary overflow-auto">
        <h2 className="text-lg font-bold mb-4 text-white underline">HARD RUNTIME DEBUG</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="text-roxou-primary">NEXT_PUBLIC_SUPABASE_URL:</span> {debugData.supabaseUrl}</p>
            <p><span className="text-roxou-primary">AUTH_USER_ID:</span> {debugData.authUserId}</p>
            <p><span className="text-roxou-primary">AUTH_EMAIL:</span> {debugData.authEmail}</p>
            <p><span className="text-roxou-primary">TIMESTAMP:</span> {debugData.timestamp}</p>
          </div>
          <div>
            <p><span className="text-roxou-primary">PROFILE_ID:</span> {debugData.profileId || "NULL"}</p>
            <p><span className="text-roxou-primary">PROFILE_ROLE:</span> {debugData.profileRole || "NULL"}</p>
            <p><span className="text-roxou-primary">PROFILES_COUNT:</span> {debugData.profilesCount}</p>
            <p><span className="text-roxou-primary">DRIVER_USER_ID:</span> {debugData.driverUserId || "NULL"}</p>
            <p><span className="text-roxou-primary">VERIFICATION_STATUS:</span> {debugData.verificationStatus || "NULL"}</p>
            <p><span className="text-roxou-primary">DRIVERS_COUNT:</span> {debugData.driversCount}</p>
          </div>
        </div>
        {(debugData.profileError || debugData.driverError) && (
          <div className="mt-4 p-2 bg-red-900/50 border border-red-500 text-red-200">
            <p><strong>ERRORS DETECTED:</strong></p>
            {debugData.profileError && <p>Profile Error: {debugData.profileError}</p>}
            {debugData.driverError && <p>Driver Error: {debugData.driverError}</p>}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-green-900">
          <p className="text-white font-bold">RAW DRIVERS DATA:</p>
          <pre className="mt-2">{JSON.stringify(drivers, null, 2)}</pre>
        </div>
      </div>

      <DriverOnboardingStatus 
        role={role} 
        driverFound={!!driver} 
        verificationStatus={verificationStatus} 
      />
    </div>
  );
}
