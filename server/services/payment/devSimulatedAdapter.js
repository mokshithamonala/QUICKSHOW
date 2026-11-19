import crypto from "crypto";

const DEV_HMAC_SECRET =
  process.env.DEV_PAYMENT_SIGNING_SECRET || "quickshow_dev_simulated_only_secret";

const signPayload = (orderId, bookingId, amount) =>
  crypto
    .createHmac("sha256", DEV_HMAC_SECRET)
    .update(`SIMULATED|${orderId}|${bookingId}|${amount}`)
    .digest("hex");

export const devSimulatedAdapter = {
  provider: "simulated",
  mode: "DEVELOPMENT MODE (SIMULATED)",
  isSimulated: true,
  isRealTransaction: false,

  async createOrder({ bookingId, amount, currency = "INR", bookingCode }) {
    // Distinct "sim_order_" prefix guarantees simulated orders are never confused with Razorpay "order_" IDs
    const orderId = `sim_order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const orderToken = signPayload(orderId, bookingId, amount);

    return {
      provider: "simulated",
      mode: "DEVELOPMENT MODE (SIMULATED)",
      isSimulated: true,
      isRealTransaction: false,
      orderId,
      orderToken,
      amount,
      currency,
      bookingCode,
      disclaimer:
        "DEVELOPMENT MODE: Simulated payment transaction only. Not a real Razorpay transaction and no real money is charged.",
    };
  },

  async verifyPayment({
    bookingId,
    amount,
    orderId,
    orderToken,
    outcome = "success",
    failureReason = "",
  }) {
    if (!orderId || !String(orderId).startsWith("sim_order_")) {
      return {
        verified: false,
        isSimulated: true,
        isRealTransaction: false,
        status: "FAILED",
        reason: "Invalid order prefix: simulated adapter only accepts sim_order_ IDs.",
      };
    }

    if (!orderToken) {
      return {
        verified: false,
        isSimulated: true,
        isRealTransaction: false,
        status: "FAILED",
        reason: "Missing simulated order verification token.",
      };
    }

    const expectedToken = signPayload(orderId, bookingId, amount);
    const providedBuf = Buffer.from(String(orderToken));
    const expectedBuf = Buffer.from(expectedToken);

    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      return {
        verified: false,
        isSimulated: true,
        isRealTransaction: false,
        status: "FAILED",
        reason: "Invalid simulated payment signature.",
      };
    }

    if (outcome === "failed" || outcome === "fail") {
      return {
        verified: false,
        isSimulated: true,
        isRealTransaction: false,
        status: "FAILED",
        paymentId: `sim_pay_fail_${crypto.randomBytes(4).toString("hex")}`,
        signature: orderToken,
        reason:
          failureReason ||
          "DEVELOPMENT MODE: Simulated payment declined by test gateway.",
      };
    }

    return {
      verified: true,
      isSimulated: true,
      isRealTransaction: false,
      status: "PAID",
      paymentId: `sim_pay_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      signature: orderToken,
      verifiedAt: new Date(),
    };
  },

  verifyWebhook() {
    return {
      verified: false,
      isSimulated: true,
      isRealTransaction: false,
      provider: "simulated",
      mode: "DEVELOPMENT MODE (SIMULATED)",
      reason:
        "Razorpay webhooks are disabled while PAYMENT_MODE=simulated is active. Simulated payments are never processed as real Razorpay webhooks.",
    };
  },
};
