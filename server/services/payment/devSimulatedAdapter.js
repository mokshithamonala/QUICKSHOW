import crypto from "crypto";

const DEV_HMAC_SECRET =
  process.env.DEV_PAYMENT_SIGNING_SECRET || "quickshow_dev_simulated_only_secret";

const signPayload = (orderId, bookingId, amount) =>
  crypto
    .createHmac("sha256", DEV_HMAC_SECRET)
    .update(`${orderId}|${bookingId}|${amount}`)
    .digest("hex");

export const devSimulatedAdapter = {
  provider: "dev_simulated",
  mode: "DEVELOPMENT MODE",
  isSimulated: true,

  async createOrder({ bookingId, amount, currency = "INR", bookingCode }) {
    const orderId = `dev_order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const orderToken = signPayload(orderId, bookingId, amount);

    return {
      provider: "dev_simulated",
      mode: "DEVELOPMENT MODE",
      isSimulated: true,
      orderId,
      orderToken,
      amount,
      currency,
      bookingCode,
      disclaimer:
        "DEVELOPMENT MODE: Simulated payment adapter active. No real money is charged.",
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
    if (!orderId || !orderToken) {
      return {
        verified: false,
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
        status: "FAILED",
        reason: "Invalid simulated payment signature.",
      };
    }

    if (outcome === "failed" || outcome === "fail") {
      return {
        verified: false,
        status: "FAILED",
        paymentId: `dev_pay_fail_${crypto.randomBytes(4).toString("hex")}`,
        signature: orderToken,
        reason:
          failureReason ||
          "DEVELOPMENT MODE: Simulated payment declined by test gateway.",
      };
    }

    return {
      verified: true,
      status: "PAID",
      paymentId: `dev_pay_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      signature: orderToken,
      verifiedAt: new Date(),
    };
  },

  verifyWebhook() {
    return {
      verified: true,
      provider: "dev_simulated",
      mode: "DEVELOPMENT MODE",
      message: "Development simulated webhook accepted (test mode only).",
    };
  },
};
