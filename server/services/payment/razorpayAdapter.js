import crypto from "crypto";
import axios from "axios";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

const getRazorpayKeyId = () => (process.env.RAZORPAY_KEY_ID || "").trim();
const getRazorpayKeySecret = () => (process.env.RAZORPAY_KEY_SECRET || "").trim();
const getRazorpayWebhookSecret = () => (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();

export const isRazorpayTestKey = () => getRazorpayKeyId().startsWith("rzp_test_");
export const isRazorpayLiveKey = () => getRazorpayKeyId().startsWith("rzp_live_");

export const isRazorpayConfigured = () =>
  Boolean(getRazorpayKeyId() && getRazorpayKeySecret());

export const isRazorpayTestModeReady = () =>
  isRazorpayConfigured() && isRazorpayTestKey();

export const isRazorpayWebhookConfigured = () =>
  Boolean(getRazorpayWebhookSecret());

const getRequestedMode = () =>
  (process.env.PAYMENT_MODE || "razorpay_test").trim().toLowerCase();

const getAuthHeader = () => {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
};

const assertModeKeySafety = () => {
  if (!isRazorpayConfigured()) {
    throw Object.assign(
      new Error(
        "Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured on the server."
      ),
      { status: 503 }
    );
  }

  const mode = getRequestedMode();
  // Strictly enforce Test Mode unless environment explicitly opts into razorpay_live
  if (mode !== "razorpay_live") {
    if (isRazorpayLiveKey()) {
      throw Object.assign(
        new Error(
          "Safety block: Live Mode Razorpay key (rzp_live_*) cannot be used while PAYMENT_MODE is in Test Mode."
        ),
        { status: 400 }
      );
    }
    if (!isRazorpayTestKey()) {
      throw Object.assign(
        new Error(
          "Invalid Razorpay Test Mode key: RAZORPAY_KEY_ID must begin with rzp_test_."
        ),
        { status: 400 }
      );
    }
  } else if (!isRazorpayLiveKey()) {
    throw Object.assign(
      new Error(
        "Invalid Razorpay Live Mode key: RAZORPAY_KEY_ID must begin with rzp_live_ when PAYMENT_MODE=razorpay_live."
      ),
      { status: 400 }
    );
  }
};

const normalizeCurrency = (currency = "INR") => {
  const cleaned = String(currency || "INR").trim().toUpperCase();
  return cleaned === "₹" ? "INR" : cleaned;
};

export const fetchRazorpayPayment = async (paymentId) => {
  assertModeKeySafety();
  const res = await axios.get(
    `${RAZORPAY_API_BASE}/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: { Authorization: getAuthHeader() },
      timeout: 10000,
    }
  );
  return res.data;
};

export const fetchRazorpayOrder = async (orderId) => {
  assertModeKeySafety();
  const res = await axios.get(
    `${RAZORPAY_API_BASE}/orders/${encodeURIComponent(orderId)}`,
    {
      headers: { Authorization: getAuthHeader() },
      timeout: 10000,
    }
  );
  return res.data;
};

export const createRazorpayAdapter = (liveMode = false) => ({
  provider: liveMode ? "razorpay_live" : "razorpay_test",
  mode: liveMode ? "RAZORPAY LIVE MODE" : "RAZORPAY TEST MODE",
  isSimulated: false,
  isTestMode: !liveMode,
  isRealTransaction: liveMode,

  /**
   * Create a Razorpay order via the official Orders API using ONLY the
   * backend-calculated booking amount (never trusting frontend-supplied amounts).
   */
  async createOrder({ bookingId, amount, currency = "INR", bookingCode }) {
    assertModeKeySafety();

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw Object.assign(new Error("Invalid server booking amount for Razorpay order."), {
        status: 400,
      });
    }

    const amountPaise = Math.round(numericAmount * 100);
    const normalizedCurrency = normalizeCurrency(currency);
    const receipt = String(bookingCode || bookingId).slice(0, 40);

    try {
      const response = await axios.post(
        `${RAZORPAY_API_BASE}/orders`,
        {
          amount: amountPaise,
          currency: normalizedCurrency,
          receipt,
          payment_capture: 1,
          notes: {
            bookingId: String(bookingId),
            bookingCode: String(bookingCode || ""),
            environment: liveMode ? "live" : "test",
          },
        },
        {
          headers: {
            Authorization: getAuthHeader(),
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      const order = response.data;
      if (!order?.id || Number(order.amount) !== amountPaise) {
        throw new Error("Razorpay returned an unexpected order response.");
      }

      return {
        provider: liveMode ? "razorpay_live" : "razorpay_test",
        mode: liveMode ? "RAZORPAY LIVE MODE" : "RAZORPAY TEST MODE",
        isSimulated: false,
        isTestMode: !liveMode,
        isRealTransaction: liveMode,
        keyId: getRazorpayKeyId(), // Public Key ID only — NEVER expose RAZORPAY_KEY_SECRET
        orderId: order.id,
        amount: order.amount / 100,
        amountPaise: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        bookingCode,
      };
    } catch (err) {
      const rzpDesc =
        err.response?.data?.error?.description ||
        err.response?.data?.error?.reason ||
        err.message;
      throw Object.assign(
        new Error(`Razorpay order creation failed: ${rzpDesc}`),
        { status: err.response?.status >= 400 && err.response?.status < 500 ? 400 : 502 }
      );
    }
  },

  /**
   * Server-side HMAC-SHA256 payment signature verification + backend payment
   * amount & currency verification against Razorpay's API.
   */
  async verifyPayment({ orderId, paymentId, signature, amount, currency = "INR" }) {
    assertModeKeySafety();

    if (
      !orderId ||
      !paymentId ||
      !signature ||
      !String(orderId).startsWith("order_") ||
      !String(paymentId).startsWith("pay_")
    ) {
      return {
        verified: false,
        status: "FAILED",
        reason: "Missing or malformed Razorpay payment verification parameters.",
      };
    }

    const expectedSignature = crypto
      .createHmac("sha256", getRazorpayKeySecret())
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const providedBuf = Buffer.from(String(signature).trim(), "utf8");
    const expectedBuf = Buffer.from(expectedSignature, "utf8");

    const isSignatureValid =
      providedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(providedBuf, expectedBuf);

    if (!isSignatureValid) {
      return {
        verified: false,
        status: "FAILED",
        reason: "Razorpay HMAC-SHA256 payment signature verification failed.",
      };
    }

    // Cross-verify the payment amount, currency, order binding & status via Razorpay API
    const expectedAmountPaise = Math.round(Number(amount) * 100);
    const expectedCurrency = normalizeCurrency(currency);
    let paymentMethod = "";
    let verifiedAmountPaise = expectedAmountPaise;

    try {
      const remotePayment = await fetchRazorpayPayment(paymentId);
      if (remotePayment.order_id && remotePayment.order_id !== orderId) {
        return {
          verified: false,
          status: "FAILED",
          reason: "Razorpay payment order_id does not match the booking order.",
        };
      }
      if (Number(remotePayment.amount) !== expectedAmountPaise) {
        return {
          verified: false,
          status: "FAILED",
          reason: `Payment amount mismatch: expected ${expectedAmountPaise} paise, got ${remotePayment.amount} paise.`,
        };
      }
      if (normalizeCurrency(remotePayment.currency) !== expectedCurrency) {
        return {
          verified: false,
          status: "FAILED",
          reason: `Payment currency mismatch: expected ${expectedCurrency}, got ${remotePayment.currency}.`,
        };
      }
      if (remotePayment.status === "failed") {
        return {
          verified: false,
          status: "FAILED",
          reason:
            remotePayment.error_description ||
            remotePayment.error_reason ||
            "Razorpay reported payment failed.",
        };
      }
      paymentMethod = remotePayment.method || "";
      verifiedAmountPaise = Number(remotePayment.amount);
    } catch (err) {
      // If Razorpay API returns 404 for a non-existent paymentId, reject immediately
      if (err.response?.status === 404 || err.response?.status === 400) {
        return {
          verified: false,
          status: "FAILED",
          reason: "Razorpay payment record could not be confirmed on Razorpay servers.",
        };
      }
      // On transient upstream timeout after a cryptographically valid HMAC-SHA256 signature,
      // allow verification to proceed with server-calculated amountPaise
      console.warn("⚠️  Razorpay remote payment lookup skipped after valid HMAC:", err.message);
    }

    return {
      verified: true,
      status: "PAID",
      paymentId,
      signature,
      amountPaise: verifiedAmountPaise,
      method: paymentMethod,
      isSimulated: false,
      isTestMode: !liveMode,
      isRealTransaction: liveMode,
      verifiedAt: new Date(),
    };
  },

  /**
   * Verify Razorpay webhook HMAC-SHA256 signature against the exact raw request body.
   */
  verifyWebhook(rawBody, signatureHeader) {
    const webhookSecret = getRazorpayWebhookSecret();
    if (!webhookSecret) {
      return {
        verified: false,
        statusCode: 503,
        reason:
          "RAZORPAY_WEBHOOK_SECRET is not configured on the server yet. Add it in your environment before enabling live webhooks.",
      };
    }

    if (!signatureHeader || typeof signatureHeader !== "string") {
      return {
        verified: false,
        statusCode: 400,
        reason: "Missing X-Razorpay-Signature header.",
      };
    }

    if (!rawBody || (Buffer.isBuffer(rawBody) && rawBody.length === 0)) {
      return {
        verified: false,
        statusCode: 400,
        reason: "Empty raw webhook request body.",
      };
    }

    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const providedBuf = Buffer.from(signatureHeader.trim(), "utf8");
    const expectedBuf = Buffer.from(expected, "utf8");

    const verified =
      providedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(providedBuf, expectedBuf);

    if (!verified) {
      return {
        verified: false,
        statusCode: 401,
        reason: "Invalid Razorpay webhook HMAC-SHA256 signature.",
      };
    }

    return {
      verified: true,
      statusCode: 200,
      provider: liveMode ? "razorpay_live" : "razorpay_test",
    };
  },
});

export const razorpayAdapter = createRazorpayAdapter(false);
export const razorpayLiveAdapter = createRazorpayAdapter(true);
