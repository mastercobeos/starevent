import "@supabase/functions-js/edge-runtime.d.ts";

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
      type, // 'deposit' | 'balance'
      amount, // in cents
      customerEmail,
      customerName,
      description,
      dueDate, // optional, ISO date string for balance invoices
      idempotencyKey,
    } = await req.json();

    if (!reservationId || !type || !amount || !customerEmail || !idempotencyKey) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
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

    // Step 1: Search for or create Square customer
    let customerId: string | null = null;

    // Search by email
    const searchResponse = await fetch(`${squareBaseUrl}/v2/customers/search`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          filter: {
            email_address: { exact: customerEmail },
          },
        },
      }),
    });

    const searchData = await searchResponse.json();
    if (searchData.customers && searchData.customers.length > 0) {
      customerId = searchData.customers[0].id;
    } else {
      // Create customer
      const nameParts = customerName.split(" ");
      const createResponse = await fetch(`${squareBaseUrl}/v2/customers`, {
        method: "POST",
        headers: {
          "Square-Version": "2024-01-18",
          "Authorization": `Bearer ${squareAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idempotency_key: `customer_${customerEmail}`,
          given_name: nameParts[0] || "",
          family_name: nameParts.slice(1).join(" ") || "",
          email_address: customerEmail,
        }),
      });

      const createData = await createResponse.json();
      if (createData.customer) {
        customerId = createData.customer.id;
      } else {
        console.error("Failed to create customer:", createData);
        return new Response(
          JSON.stringify({ error: "Failed to create Square customer" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Step 2: Create invoice
    const invoiceDueDate = dueDate || new Date().toISOString().split("T")[0];

    const invoiceBody: Record<string, unknown> = {
      idempotency_key: idempotencyKey,
      invoice: {
        location_id: squareLocationId,
        primary_recipient: {
          customer_id: customerId,
        },
        payment_requests: [
          {
            request_type: "BALANCE",
            due_date: invoiceDueDate,
            automatic_payment_source: "NONE",
            reminders: type === "balance"
              ? [
                  { relative_scheduled_days: 0, message: "Payment is due today before setup begins." },
                ]
              : [
                  { relative_scheduled_days: -1, message: "Your deposit payment is due tomorrow." },
                  { relative_scheduled_days: 0, message: "Your deposit payment is due today." },
                ],
          },
        ],
        delivery_method: "EMAIL",
        invoice_number: `RES-${reservationId.slice(0, 8).toUpperCase()}-${type.toUpperCase()}`,
        title: `Star Event Rental — ${type === "deposit" ? "Deposit (40%)" : "Balance (60%)"}`,
        description: description || "",
        accepted_payment_methods: {
          card: true,
          square_gift_card: false,
          bank_account: false,
          buy_now_pay_later: false,
          cash_app_pay: false,
        },
      },
    };

    const invoiceResponse = await fetch(`${squareBaseUrl}/v2/invoices`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceBody),
    });

    const invoiceData = await invoiceResponse.json();

    if (!invoiceResponse.ok || invoiceData.errors) {
      const errorMsg = invoiceData.errors?.[0]?.detail || "Invoice creation failed";
      console.error("Square invoice error:", JSON.stringify(invoiceData.errors));
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const invoiceId = invoiceData.invoice.id;
    const invoiceVersion = invoiceData.invoice.version;

    // Step 3: Publish the invoice (makes it visible and sends email)
    const publishResponse = await fetch(
      `${squareBaseUrl}/v2/invoices/${invoiceId}/publish`,
      {
        method: "POST",
        headers: {
          "Square-Version": "2024-01-18",
          "Authorization": `Bearer ${squareAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idempotency_key: `${idempotencyKey}_publish`,
          version: invoiceVersion,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (!publishResponse.ok || publishData.errors) {
      console.error("Invoice publish error:", JSON.stringify(publishData.errors));
      // Invoice created but not published — return invoice ID anyway
    }

    // Extract public URL for the invoice
    const invoiceUrl = publishData.invoice?.public_url ||
      `https://${squareEnv === "production" ? "squareup" : "squareupsandbox"}.com/pay-invoice/${invoiceId}`;

    return new Response(
      JSON.stringify({
        success: true,
        invoiceId,
        invoiceUrl,
        customerId,
        status: publishData.invoice?.status || "UNPAID",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Create Square invoice error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
