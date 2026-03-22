import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response("Missing Supabase env vars", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check all drivers
  const { data: allDrivers, error: driversError } = await supabase
    .from("drivers")
    .select("*");

  // Check all profiles
  const { data: allProfiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*");

  // Check auth users
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  return new Response(JSON.stringify({
    allDrivers,
    allProfiles,
    users: users.map(u => ({ id: u.id, email: u.email, metadata: u.user_metadata })),
    driversError,
    profilesError,
    authError
  }, null, 2), {
    headers: { "Content-Type": "application/json" }
  });
}
