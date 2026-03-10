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

      // Reminder #1: at 9:00 AM Houston time
      if (chicagoHour === 9 && chicagoMinute < 15 && !sentTypes.includes("balance_reminder_1")) {
        const clientName = `${res.first_name} ${res.last_name}`.trim();
        const plainMessage = `Hola ${clientName},\n\nTu evento es hoy (${res.event_date}). El pago del 60% restante ($${res.balance_amount}) se debe realizar al momento de la entrega del mobiliario, antes de iniciar el set-up.\n\n${invoiceUrl ? `Paga aquí: ${invoiceUrl}` : "Contacta a Star Event Rental para coordinar el pago."}`;

        const htmlMessage = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
            <div style="text-align:center;padding:20px 0;border-bottom:3px solid #C9A84C;">
              <h1 style="color:#1a1a1a;margin:0;font-size:22px;">Star Event Rental TX</h1>
              <p style="color:#e67e22;margin:4px 0 0;font-size:14px;">Recordatorio de Pago — Balance Pendiente (60%)</p>
            </div>
            <div style="padding:20px 0;">
              <p style="color:#333;font-size:15px;">Hola <strong>${clientName}</strong>,</p>
              <p style="color:#555;font-size:14px;line-height:1.6;">
                Tu evento es hoy <strong>(${res.event_date})</strong>. El pago del 60% restante se debe realizar
                <strong>al momento de la entrega del mobiliario</strong>, antes de iniciar el set-up.
              </p>
            </div>
            <div style="background:#fff3e0;border:1px solid #ffcc02;border-radius:8px;padding:16px;margin-bottom:16px;">
              <table style="width:100%;font-size:14px;">
                <tr>
                  <td style="padding:4px 0;color:#e67e22;font-weight:bold;">Balance pendiente (60%):</td>
                  <td style="padding:4px 0;color:#e67e22;font-weight:bold;text-align:right;font-size:18px;">$${res.balance_amount}</td>
                </tr>
              </table>
            </div>
            ${invoiceUrl ? `
            <div style="text-align:center;margin:20px 0;">
              <a href="${invoiceUrl}" style="display:inline-block;background:#C9A84C;color:#fff;font-weight:bold;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;">
                Pagar ahora
              </a>
            </div>` : ""}
            <div style="background:#fffbe6;border:1px solid #f0e68c;border-radius:8px;padding:12px;margin-bottom:16px;">
              <p style="color:#856404;font-size:13px;margin:0;line-height:1.5;">
                <strong>Importante:</strong> El pago debe completarse al momento de la entrega del mobiliario para poder iniciar el set-up de su evento.
              </p>
            </div>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
            <p style="color:#999;font-size:11px;text-align:center;">
              Star Event Rental TX &bull; Houston, TX &bull; info@stareventrentaltx.com
            </p>
          </div>`;

        // Send email
        if (res.client_email) {
          await sendNotification(supabase, {
            reservationId: res.id,
            type: "balance_reminder_1",
            channel: "email",
            recipient: res.client_email,
            subject: `Recordatorio de pago (60%) — Evento hoy ${res.event_date}`,
            message: htmlMessage,
          });
        }

        // Send WhatsApp to client
        if (res.phone_1) {
          await sendNotification(supabase, {
            reservationId: res.id,
            type: "balance_reminder_1",
            channel: "whatsapp",
            recipient: res.phone_1,
            message: plainMessage,
          });
        }

        sentCount++;
      }

      // Reminder #2: 2 hours before event_start_time, or at 12:00 PM if no start time
      let reminder2Hour = 12;
      if (res.event_start_time) {
        const startHour = parseInt(res.event_start_time.split(":")[0]);
        reminder2Hour = Math.max(startHour - 2, 10); // At least 10 AM (after 9 AM reminder)
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
