import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cron job: runs every 5 minutes to expire stale stock holds
// Schedule via Supabase Dashboard: cron or pg_cron

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Call the database function that handles expiration atomically
    const { data, error } = await supabase.rpc("expire_stale_holds");

    if (error) {
      console.error("Error expiring holds:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const expiredCount = data || 0;

    if (expiredCount > 0) {
      console.log(`Expired ${expiredCount} reservation hold(s)`);

      // TODO: Send notifications to clients whose holds expired
      // Fetch expired reservations and send emails
    }

    return new Response(
      JSON.stringify({ expired: expiredCount }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Expire stock holds error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
