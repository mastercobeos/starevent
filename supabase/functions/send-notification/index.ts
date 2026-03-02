import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      reservationId,
      type, // notification type
      channel, // 'email' | 'sms' | 'whatsapp'
      recipient, // email or phone number
      subject, // email subject (optional)
      message, // message body
      templateData, // template merge data
    } = await req.json();

    if (!channel || !recipient || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: channel, recipient, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: { success: boolean; error?: string } = { success: false };

    // --- EMAIL via Resend ---
    if (channel === "email") {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        return new Response(
          JSON.stringify({ error: "Resend not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: Deno.env.get("EMAIL_FROM") || "Star Event Rental <noreply@stareventrentaltx.com>",
          to: [recipient],
          subject: subject || "Star Event Rental — Notification",
          html: message,
        }),
      });

      const emailData = await emailResponse.json();
      result = emailResponse.ok
        ? { success: true }
        : { success: false, error: emailData.message || "Email send failed" };
    }

    // --- SMS via Twilio ---
    if (channel === "sms") {
      const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioFrom = Deno.env.get("TWILIO_PHONE_NUMBER");

      if (!twilioSid || !twilioAuth || !twilioFrom) {
        return new Response(
          JSON.stringify({ error: "Twilio SMS not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const smsResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: twilioFrom,
            To: recipient,
            Body: message,
          }),
        }
      );

      const smsData = await smsResponse.json();
      result = smsResponse.ok
        ? { success: true }
        : { success: false, error: smsData.message || "SMS send failed" };
    }

    // --- WhatsApp via Twilio ---
    if (channel === "whatsapp") {
      const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioWhatsApp = Deno.env.get("TWILIO_WHATSAPP_NUMBER") || "whatsapp:+14155238886"; // Twilio sandbox

      if (!twilioSid || !twilioAuth) {
        return new Response(
          JSON.stringify({ error: "Twilio WhatsApp not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const whatsappResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: twilioWhatsApp,
            To: `whatsapp:${recipient}`,
            Body: message,
          }),
        }
      );

      const whatsappData = await whatsappResponse.json();
      result = whatsappResponse.ok
        ? { success: true }
        : { success: false, error: whatsappData.message || "WhatsApp send failed" };
    }

    // Log notification in DB
    if (reservationId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await supabase.from("notifications").insert({
        reservation_id: reservationId,
        type: type || "general",
        channel,
        recipient,
        status: result.success ? "sent" : "failed",
        payload: { subject, message: message.substring(0, 500), templateData },
        sent_at: result.success ? new Date().toISOString() : null,
        error_message: result.error || null,
      });
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Send notification error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
