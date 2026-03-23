import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DriverOnboardingStatus from "@/components/DriverOnboardingStatus";

export const dynamic = "force-dynamic";

export default async function DriverOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    .select("user_id, verification_status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const driver = drivers && drivers.length > 0 ? drivers[0] : null;

  // RAW TABLE TEST (No Filter) - FIXED
  const { data: testDrivers, error: testError } = await supabase
    .from("drivers")
    .select("*");

  const role = profile?.role;
  const verificationStatus = driver?.verification_status;

  const debugData = {
    authUserId: user.id,
    authEmail: user.email,
    profileId: profile?.id,
    profileRole: role,
    driverUserId: driver?.user_id,
    verificationStatus,
    profileError: profileError?.message,
    driverError: driverError?.message,
    profilesCount: profiles?.length || 0,
    driversCount: drivers?.length || 0,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    timestamp: new Date().toISOString(),
  };

  if (verificationStatus === "approved" && role === "driver") {
    redirect("/driver/dashboard");
  }

  return (
    <div className="min-h-screen bg-roxou-bg">
      <div className="bg-white text-black p-1 text-[10px] font-mono text-center">
        BUILD_MARKER: driver-fix-v2
      </div>

      <div className="bg-black text-green-500 p-6 font-mono text-xs border-b-4 border-roxou-primary overflow-auto">
        <h2 className="text-lg font-bold mb-4 text-white underline">
          HARD RUNTIME DEBUG
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <span className="text-roxou-primary">NEXT_PUBLIC_SUPABASE_URL:</span>{" "}
              {debugData.supabaseUrl}
            </p>
            <p>
              <span className="text-roxou-primary">AUTH_USER_ID:</span>{" "}
              {debugData.authUserId}
            </p>
            <p>
              <span className="text-roxou-primary">AUTH_EMAIL:</span>{" "}
              {debugData.authEmail}
            </p>
            <p>
              <span className="text-roxou-primary">TIMESTAMP:</span>{" "}
              {debugData.timestamp}
            </p>
          </div>

          <div>
            <p>
              <span className="text-roxou-primary">PROFILE_ID:</span>{" "}
              {debugData.profileId || "NULL"}
            </p>
            <p>
              <span className="text-roxou-primary">PROFILE_ROLE:</span>{" "}
              {debugData.profileRole || "NULL"}
            </p>
            <p>
              <span className="text-roxou-primary">PROFILES_COUNT:</span>{" "}
              {debugData.profilesCount}
            </p>
            <p>
              <span className="text-roxou-primary">DRIVER_USER_ID:</span>{" "}
              {debugData.driverUserId || "NULL"}
            </p>
            <p>
              <span className="text-roxou-primary">VERIFICATION_STATUS:</span>{" "}
              {debugData.verificationStatus || "NULL"}
            </p>
            <p>
              <span className="text-roxou-primary">DRIVERS_COUNT:</span>{" "}
              {debugData.driversCount}
            </p>
          </div>
        </div>

        {(debugData.profileError || debugData.driverError) && (
          <div className="mt-4 p-2 bg-red-900/50 border border-red-500 text-red-200">
            <p>
              <strong>ERRORS DETECTED:</strong>
            </p>
            {debugData.profileError && <p>Profile Error: {debugData.profileError}</p>}
            {debugData.driverError && <p>Driver Error: {debugData.driverError}</p>}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-green-900">
          <p className="text-white font-bold underline mb-2">
            RAW TABLE TEST (No Filter)
          </p>
          <p>
            <span className="text-roxou-primary">TEST_QUERY_COUNT:</span>{" "}
            {testDrivers?.length || 0}
          </p>
          <p>
            <span className="text-roxou-primary">TEST_QUERY_ERROR:</span>{" "}
            {JSON.stringify(testError)}
          </p>
          <p className="text-white text-xs mt-2">TEST_QUERY_DATA:</p>
          <pre className="mt-1 text-[10px] text-gray-400 max-h-40 overflow-auto">
            {JSON.stringify(testDrivers, null, 2)}
          </pre>
        </div>

        <div className="mt-4 pt-4 border-t border-green-900">
          <p className="text-white font-bold">
            RAW DRIVERS DATA (Filtered by User ID):
          </p>
          <pre className="mt-2 text-[10px]">
            {JSON.stringify(drivers, null, 2)}
          </pre>
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