import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DiagnosePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not logged in</div>;
  }

  // Check profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Check drivers for this user
  const { data: driverRows } = await supabase
    .from("drivers")
    .select("*")
    .eq("user_id", user.id);

  // Check all drivers to see if there's any row with the user's email or something
  const { data: allDrivers } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      drivers:drivers(*)
    `)
    .eq("role", "driver");

  return (
    <div className="p-10 bg-roxou-bg text-white font-mono text-xs space-y-4">
      <h1 className="text-xl font-bold">Diagnostic Info</h1>
      
      <section>
        <h2 className="text-roxou-primary">Current User (Auth)</h2>
        <pre>{JSON.stringify({ id: user.id, email: user.email, metadata: user.user_metadata }, null, 2)}</pre>
      </section>

      <section>
        <h2 className="text-roxou-primary">Profile Row</h2>
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      </section>

      <section>
        <h2 className="text-roxou-primary">Driver Rows (for this user_id: {user.id})</h2>
        <pre>{JSON.stringify(driverRows, null, 2)}</pre>
      </section>

      <section>
        <h2 className="text-roxou-primary">Profile by Email (motorista@roxou.com.br)</h2>
        <pre>{JSON.stringify(profileByEmail, null, 2)}</pre>
      </section>

      <section>
        <h2 className="text-roxou-primary">All Profiles with Role "driver"</h2>
        <pre>{JSON.stringify(allDrivers, null, 2)}</pre>
      </section>

      <div className="pt-10 space-y-4">
        <h2 className="text-xl font-bold text-roxou-primary">Test Actions</h2>
        <p className="text-roxou-text-muted">Use these to verify if the flow works for a new driver.</p>
        
        <form action="/api/test/create-driver" method="POST">
          <button type="submit" className="px-6 py-3 bg-roxou-primary text-white rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-all">
            Forçar Criação de Registro de Motorista (Pendente)
          </button>
        </form>
      </div>
    </div>
  );
}
