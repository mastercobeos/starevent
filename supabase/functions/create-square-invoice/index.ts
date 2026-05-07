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
      // Itemized invoice data (optional — when provided, builds a Square Order
      // so the customer's invoice/receipt shows the full breakdown instead of
      // a lump sum).
      lineItems, // [{ name, quantity, unitPriceCents, rentalDays }]
      deliveryFeeCents,
      deliveryMiles,
      sameDayPickupFeeCents,
      taxAmountCents,
      depositPaidCents,
      rentalDays,
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

    // Step 2 (optional): Build a Square Order with itemized line items so the
    // invoice/receipt shows the full breakdown. Only runs when lineItems were
    // provided — otherwise we fall through to fixed_amount_money below.
    let orderId: string | null = null;
    if (Array.isArray(lineItems) && lineItems.length > 0) {
      const orderLineItems: Record<string, unknown>[] = [];

      for (const li of lineItems) {
        const days = Number(li.rentalDays) || Number(rentalDays) || 1;
        // Bake rental_days into the unit price so quantity stays as the original
        // qty and the receipt is readable (e.g. "Resin Chair x28 @ $5.00" for 2-day).
        const unitPrice = Math.round(Number(li.unitPriceCents) * days);
        orderLineItems.push({
          name: days > 1 ? `${li.name} (${days}-day rental)` : li.name,
          quantity: String(li.quantity),
          base_price_money: { amount: unitPrice, currency: "USD" },
        });
      }

      if (deliveryFeeCents && deliveryFeeCents > 0) {
        orderLineItems.push({
          name: deliveryMiles ? `Delivery (${deliveryMiles} mi)` : "Delivery",
          quantity: "1",
          base_price_money: { amount: Number(deliveryFeeCents), currency: "USD" },
        });
      }

      if (sameDayPickupFeeCents && sameDayPickupFeeCents > 0) {
        orderLineItems.push({
          name: "Same-Day Pickup Fee",
          quantity: "1",
          base_price_money: { amount: Number(sameDayPickupFeeCents), currency: "USD" },
        });
      }

      if (taxAmountCents && taxAmountCents > 0) {
        orderLineItems.push({
          name: "Sales Tax (8.25%)",
          quantity: "1",
          base_price_money: { amount: Number(taxAmountCents), currency: "USD" },
        });
      }

      const discounts: Record<string, unknown>[] = [];
      if (depositPaidCents && depositPaidCents > 0) {
        discounts.push({
          name: "Deposit Paid (40%)",
          amount_money: { amount: Number(depositPaidCents), currency: "USD" },
          scope: "ORDER",
        });
      }

      const orderBody = {
        idempotency_key: `${idempotencyKey}_order`,
        order: {
          location_id: squareLocationId,
          customer_id: customerId,
          line_items: orderLineItems,
          discounts,
        },
      };

      const orderResponse = await fetch(`${squareBaseUrl}/v2/orders`, {
        method: "POST",
        headers: {
          "Square-Version": "2024-01-18",
          "Authorization": `Bearer ${squareAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderBody),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok || orderData.errors) {
        const errorMsg = orderData.errors?.[0]?.detail || "Order creation failed";
        console.error("Square order error:", JSON.stringify(orderData.errors));
        return new Response(
          JSON.stringify({ error: errorMsg }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      orderId = orderData.order?.id ?? null;
    }

    // Step 3: Create invoice — uses order_id when itemized; otherwise falls
    // back to fixed_amount_money (lump sum).
    const invoiceDueDate = dueDate || new Date().toISOString().split("T")[0];

    const paymentRequest: Record<string, unknown> = {
      request_type: "BALANCE",
      due_date: invoiceDueDate,
      automatic_payment_source: "NONE",
      reminders: type === "balance"
        ? [
            { relative_scheduled_days: -3, message: "Reminder: balance (60%) is due at least 48 hours before your event." },
            { relative_scheduled_days: 0, message: "Final reminder: balance (60%) is due today (48 hours before the event)." },
          ]
        : [
            { relative_scheduled_days: -1, message: "Your deposit payment is due tomorrow." },
            { relative_scheduled_days: 0, message: "Your deposit payment is due today." },
          ],
    };

    if (!orderId) {
      paymentRequest.fixed_amount_money = { amount, currency: "USD" };
    }

    const invoiceBody: Record<string, unknown> = {
      idempotency_key: idempotencyKey,
      invoice: {
        location_id: squareLocationId,
        ...(orderId ? { order_id: orderId } : {}),
        primary_recipient: {
          customer_id: customerId,
        },
        payment_requests: [paymentRequest],
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
