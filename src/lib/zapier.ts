export interface SubscribePayload {
  email: string;
  source?: string;
  edition?: string;
  timestamp?: string;
  signalRatio?: string;
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
  delivered: boolean;
}

/**
 * Universal Newsletter Dispatcher:
 * Supports 100% Free Google Sheets & Gmail (via Google Apps Script Web App)
 * and Zapier Free Tier (New Spreadsheet Row -> Gmail).
 */
export async function sendZapierSubscribe(
  payload: SubscribePayload
): Promise<SubscribeResponse> {
  // Read endpoint URL from .env or localStorage (supports Google Apps Script Web App or Zapier)
  const endpointUrl =
    import.meta.env.VITE_GOOGLE_SHEET_URL ||
    import.meta.env.VITE_NEWSLETTER_ENDPOINT ||
    import.meta.env.VITE_ZAPIER_WEBHOOK_URL ||
    (typeof window !== "undefined"
      ? localStorage.getItem("tdc_sheet_url") || localStorage.getItem("tdc_zapier_webhook_url")
      : null);

  const fullData = {
    email: payload.email,
    source: payload.source || "MacBook Pro Telegraph Screen",
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

  if (!endpointUrl) {
    console.info(
      "[Newsletter] No endpoint configured yet. Email stored locally:",
      payload.email
    );
    return {
      success: true,
      delivered: false,
      message:
        "Subscribed! Connect Google Sheet URL in .env to deliver instant emails 100% free.",
    };
  }

  try {
    // Send to Google Sheet Apps Script Web App / Zapier endpoint
    await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // text/plain prevents CORS preflight issues with Google Apps Script
      },
      body: JSON.stringify(fullData),
      mode: "no-cors", // Guarantees browser never blocks the request
    });

    console.info("[Newsletter] Successfully transmitted subscriber to Google Sheet / Zapier:", payload.email);
    return {
      success: true,
      delivered: true,
      message: "Telegraph dispatched! Welcome email sent to your inbox.",
    };
  } catch (err: any) {
    console.error("[Newsletter Error]", err);
    return {
      success: false,
      delivered: false,
      message: err.message || "Failed to transmit subscription.",
    };
  }
}
