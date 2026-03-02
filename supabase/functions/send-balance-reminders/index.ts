import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cron job: runs every 15 minutes to send balance reminders on event day
// Timezone: America/Chicago (Houston, TX)

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get current date/time in Houston timezone
    const now = new Date();
    const chicagoFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = chicagoFormatter.formatToParts(now);
    const chicagoDate = `${parts.find(p => p.type === "year")!.value}-${parts.find(p => p.type === "month")!.value}-${parts.find(p => p.type === "day")!.value}`;
    const chicagoHour = parseInt(parts.find(p => p.type === "hour")!.value);
    const chicagoMinute = parseInt(parts.find(p => p.type === "minute")!.value);

    // Find reservations with balance_due status and event_date = today
    const { data: reservations, error } = await supabase
      .from("reservations")
      .select(`
        id, first_name, last_name, client_email, phone_1, event_date,
        event_start_time, balance_amount,
        payments (id, type, status, square_invoice_url)
      `)
      .eq("status", "balance_due")
      .eq("event_date", chicagoDate);

    if (error) {
      console.error("Error fetching reminders:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!reservations || reservations.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No reminders needed" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;

    for (const res of reservations) {
      // Get the balance invoice URL
      const balancePayment = (res.payments || []).find(
        (p: { type: string; status: string }) => p.type === "balance" && p.status === "pending"
      );
      const invoiceUrl = balancePayment?.square_invoice_url || "";

      // Check if we already sent reminders today
      const { data: sentNotifications } = await supabase
        .from("notifications")
        .select("id, type")
        .eq("reservation_id", res.id)
        .in("type", ["balance_reminder_1", "balance_reminder_2"])
        .eq("status", "sent");

      const sentTypes = (sentNotifications || []).map((n: { type: string }) => n.type);

      // Reminder #1: at 8:00 AM Chicago time
      if (chicagoHour === 8 && chicagoMinute < 15 && !sentTypes.includes("balance_reminder_1")) {
        const message = `Pago pendiente (60%) — Evento hoy ${res.event_date}\n\nA la llegada del mobiliario se debe realizar el 2do pago (60%) antes del set-up.\n\nMonto: $${res.balance_amount}\n${invoiceUrl ? `Paga aquí: ${invoiceUrl}` : "Contacta a Star Event Rental para el pago."}`;

        // Send email
        if (res.client_email) {
          await sendNotification(supabase, {
            reservationId: res.id,
            type: "balance_reminder_1",
            channel: "email",
            recipient: res.client_email,
            subject: `Pago pendiente (60%) — Evento hoy ${res.event_date}`,
            message: `<p>${message.replace(/\n/g, "<br>")}</p>`,
          });
        }

        // Send WhatsApp to client
        if (res.phone_1) {
          await sendNotification(supabase, {
            reservationId: res.id,
            type: "balance_reminder_1",
            channel: "whatsapp",
            recipient: res.phone_1,
            message,
          });
        }

        sentCount++;
      }

      // Reminder #2: 2 hours before event_start_time, or at 12:00 PM if no start time
      let reminder2Hour = 12;
      if (res.event_start_time) {
        const startHour = parseInt(res.event_start_time.split(":")[0]);
        reminder2Hour = Math.max(startHour - 2, 9); // At least 9 AM
      }

      if (chicagoHour === reminder2Hour && chicagoMinute < 15 && !sentTypes.includes("balance_reminder_2")) {
        const message = `Recordatorio final: para iniciar set-up necesitamos el 2do pago (60%).\n\nMonto: $${res.balance_amount}\n${invoiceUrl ? `Paga aquí: ${invoiceUrl}` : "Contacta a Star Event Rental."}`;

        if (res.client_email) {
          await sendNotification(supabase, {
            reservationId: res.id,
            type: "balance_reminder_2",
            channel: "email",
            recipient: res.client_email,
            subject: `Recordatorio final — Pago 60% antes del set-up`,
            message: `<p>${message.replace(/\n/g, "<br>")}</p>`,
          });
        }

        if (res.phone_1) {
          await sendNotification(supabase, {
            reservationId: res.id,
            type: "balance_reminder_2",
            channel: "whatsapp",
            recipient: res.phone_1,
            message,
          });
        }

        sentCount++;
      }
    }

    return new Response(
      JSON.stringify({ sent: sentCount, checked: reservations.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Balance reminders error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Helper: call send-notification Edge Function
async function sendNotification(
  supabase: ReturnType<typeof createClient>,
  params: {
    reservationId: string;
    type: string;
    channel: string;
    recipient: string;
    subject?: string;
    message: string;
  }
) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify(params),
    });
  } catch (err) {
    console.error(`Failed to send ${params.channel} notification:`, err);
  }
}
