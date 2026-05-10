const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const json = (body, status = 200, origin = "*") =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
    },
  });

const clean = (value) => String(value || "").trim();

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN || "https://vindem.tech";
    const requestOrigin = request.headers.get("Origin") || "";
    const responseOrigin = requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(responseOrigin),
      });
    }

    if (request.method !== "POST") {
      return json({ success: false, message: "Method not allowed." }, 405, responseOrigin);
    }

    let input;

    try {
      input = await request.json();
    } catch {
      return json({ success: false, message: "Invalid request body." }, 400, responseOrigin);
    }

    if (clean(input.botcheck)) {
      return json({ success: true }, 200, responseOrigin);
    }

    const name = clean(input.name);
    const company = clean(input.company);
    const email = clean(input.email);
    const interest = clean(input.interest);
    const message = clean(input.message);

    if (!name || !email || !interest || !message) {
      return json({ success: false, message: "Please complete the required fields." }, 400, responseOrigin);
    }

    if (!env.RESEND_API_KEY) {
      return json({ success: false, message: "Contact delivery is not configured." }, 500, responseOrigin);
    }

    const to = env.CONTACT_TO_EMAIL || "info@vindem.tech";
    const from = env.CONTACT_FROM_EMAIL || "Vindem Labs <contact@vindem.tech>";
    const replyTo = email;
    const text = [
      "New inquiry from vindem.tech",
      "",
      `Name: ${name}`,
      `Company: ${company || "Not provided"}`,
      `Email: ${email}`,
      `Area of interest: ${interest}`,
      "",
      "Project details:",
      message,
    ].join("\n");

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: replyTo,
        subject: "New inquiry from vindem.tech",
        text,
      }),
    });

    if (!resendResponse.ok) {
      return json({ success: false, message: "Unable to send message right now." }, 502, responseOrigin);
    }

    return json({ success: true }, 200, responseOrigin);
  },
};
