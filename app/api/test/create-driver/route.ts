import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Not logged in", { status: 401 });
  }

  // Ensure profile is driver
  await supabase
    .from("profiles")
    .update({ role: "driver" })
    .eq("id", user.id);

  // Upsert driver record
  const { error } = await supabase
    .from("drivers")
    .upsert({
      user_id: user.id,
      verification_status: "pending",
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) {
    console.error("Error creating driver record:", error);
    return new Response(JSON.stringify(error), { status: 500 });
  }

  redirect("/driver/onboarding");
}
