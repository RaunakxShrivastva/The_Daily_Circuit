export interface ZapierSubscribePayload {
  email: string;
  source?: string;
  edition?: string;
  timestamp?: string;
  signalRatio?: string;
}

export interface ZapierResponse {
  success: boolean;
  message: string;
  deliveredToZapier: boolean;
}

export async function sendZapierSubscribe(
  payload: ZapierSubscribePayload
): Promise<ZapierResponse> {
  const webhookUrl =
    import.meta.env.VITE_ZAPIER_WEBHOOK_URL ||
    (typeof window !== "undefined"
      ? localStorage.getItem("tdc_zapier_webhook_url")
      : null);

  const fullData = {
    email: payload.email,
    source: payload.source || "The Daily Circuit MacBook Deck",
    edition: payload.edition || "Issue #142 (Vol. XXIV)",
    timestamp: payload.timestamp || new Date().toISOString(),
    signalRatio: payload.signalRatio || "96.8%",
    subject: "Welcome to The Daily Circuit — Physical & Digital AI Intelligence",
    message:
      "Thank you for subscribing to The Daily Circuit. Your morning intelligence edition arrives daily at 06:00 IST.",
  };

  try {
    localStorage.setItem("tdc_subscribed_email", payload.email);
  } catch (_) {}

  if (!webhookUrl) {
    console.info(
      "[Zapier AI] No webhook URL configured yet. Stored email locally:",
      payload.email
    );
    return {
      success: true,
      deliveredToZapier: false,
      message:
        "Subscribed! (Connect your Zapier Webhook URL in .env to deliver live emails instantly)",
    };
  }

  try {
    // Send to Zapier Webhook Catch Hook endpoint
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fullData),
      mode: "no-cors", // Ensures client-side calls to hooks.zapier.com never get blocked by browser CORS
    });

    console.info("[Zapier AI] Successfully transmitted subscriber to Zapier:", payload.email);
    return {
      success: true,
      deliveredToZapier: true,
      message: "Telegraph dispatched! Welcome email sent via Zapier AI.",
    };
  } catch (err: any) {
    console.error("[Zapier AI Error]", err);
    return {
      success: false,
      deliveredToZapier: false,
      message: err.message || "Failed to transmit to Zapier.",
    };
  }
}
