import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sourceId, amount, reservationId } = await req.json();

    if (!sourceId || !amount || !reservationId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: sourceId, amount, reservationId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const squareAccessToken = Deno.env.get("SQUARE_ACCESS_TOKEN");
    const squareLocationId = Deno.env.get("SQUARE_LOCATION_ID");
    const squareEnv = Deno.env.get("SQUARE_ENVIRONMENT") || "sandbox";

    if (!squareAccessToken || !squareLocationId) {
      return new Response(
        JSON.stringify({ error: "Square not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const squareBaseUrl = squareEnv === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

    // Create payment with Square
    const paymentResponse = await fetch(`${squareBaseUrl}/v2/payments`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: crypto.randomUUID(),
        amount_money: {
          amount, // already in cents from frontend
          currency: "USD",
        },
        location_id: squareLocationId,
      }),
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok || paymentData.errors) {
      const errorMsg = paymentData.errors?.[0]?.detail || "Payment failed";
      console.error("Square payment error:", JSON.stringify(paymentData.errors));
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Payment successful — update reservation status in Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase
      .from("reservations")
      .update({
        status: "paid",
        payment_id: paymentData.payment.id,
      })
      .eq("id", reservationId);

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: paymentData.payment.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Process payment error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
