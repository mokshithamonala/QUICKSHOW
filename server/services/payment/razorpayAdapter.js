import crypto from "crypto";
import axios from "axios";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export const isRazorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

export const razorpayAdapter = {
  provider: "razorpay_test",
  mode: "RAZORPAY TEST MODE",
  isSimulated: false,

  async createOrder({ bookingId, amount, currency = "INR", bookingCode }) {
    if (!isRazorpayConfigured()) {
      throw new Error(
        "Razorpay Test Mode credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured."
      );
    }

    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      `${RAZORPAY_API_BASE}/orders`,
      {
        amount: Math.round(Number(amount) * 100), // paise
        currency: currency === "₹" ? "INR" : currency,
        receipt: bookingCode || bookingId,
        notes: { bookingId, bookingCode },
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return {
      provider: "razorpay_test",
      mode: "RAZORPAY TEST MODE",
      isSimulated: false,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: response.data.id,
      amount: response.data.amount / 100,
      currency: response.data.currency,
      bookingCode,
    };
  },

  async verifyPayment({ orderId, paymentId, signature }) {
    if (!isRazorpayConfigured()) {
      return {
        verified: false,
        status: "FAILED",
        reason: "Razorpay credentials not configured on server.",
      };
    }

    if (!orderId || !paymentId || !signature) {
      return {
        verified: false,
        status: "FAILED",
        reason: "Missing Razorpay payment verification parameters.",
      };
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const providedBuf = Buffer.from(String(signature));
    const expectedBuf = Buffer.from(expectedSignature);

    const isValid =
      providedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(providedBuf, expectedBuf);

    if (!isValid) {
      return {
        verified: false,
        status: "FAILED",
        reason: "Razorpay signature verification failed.",
      };
    }

    return {
      verified: true,
      status: "PAID",
      paymentId,
      signature,
      verifiedAt: new Date(),
    };
  },

  verifyWebhook(rawBody, signatureHeader) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret || !signatureHeader) {
      return { verified: false, reason: "Missing webhook secret or signature" };
    }

    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const providedBuf = Buffer.from(String(signatureHeader));
    const expectedBuf = Buffer.from(expected);

    const verified =
      providedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(providedBuf, expectedBuf);

    return { verified, provider: "razorpay_test" };
  },
};
