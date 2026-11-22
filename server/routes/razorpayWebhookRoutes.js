import crypto from "crypto";
import express from "express";
import {
  claimWebhookEvent,
  confirmBookingAfterVerifiedPayment,
  finalizeWebhookEvent,
  findBookingByOrderId,
  getBookingById,
  releaseBookingLock,
} from "../services/dataStore.js";
import { razorpayAdapter } from "../services/payment/razorpayAdapter.js";

const router = express.Router();

const SUPPORTED_EVENTS = new Set(["payment.captured", "payment.failed", "order.paid"]);

/**
 * POST /api/razorpay/webhook
 *
 * Mounted BEFORE express.json() so req.body is the exact untouched raw Buffer
 * required for Razorpay HMAC-SHA256 webhook signature verification.
 *
 * Handles:
 * - payment.captured
 * - order.paid
 * - payment.failed
 *
 * Protected by:
 * - X-Razorpay-Signature HMAC-SHA256 verification using RAZORPAY_WEBHOOK_SECRET
 * - X-Razorpay-Event-Id duplicate-event idempotency checks persisted in DB/store
 * - Strict backend amount & currency validation against the stored Booking record
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  async (req, res) => {
    try {
      const signatureHeader = req.headers["x-razorpay-signature"];
      const rawBody = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(
            typeof req.body === "string" ? req.body : JSON.stringify(req.body || {}),
            "utf8"
          );

      // 1. Verify HMAC-SHA256 signature against raw request bytes
      const sigResult = razorpayAdapter.verifyWebhook(rawBody, signatureHeader);
      if (!sigResult.verified) {
        return res.status(sigResult.statusCode || 401).json({
          success: false,
          message: sigResult.reason || "Webhook signature verification failed.",
        });
      }

      // 2. Parse verified raw JSON payload
      let payload;
      try {
        payload = JSON.parse(rawBody.toString("utf8"));
      } catch {
        return res.status(400).json({
          success: false,
          message: "Malformed JSON in verified webhook payload.",
        });
      }

      const eventType = String(payload?.event || "");
      const paymentEntity = payload?.payload?.payment?.entity || null;
      const orderEntity = payload?.payload?.order?.entity || null;

      const orderId = String(paymentEntity?.order_id || orderEntity?.id || "");
      const paymentId = String(paymentEntity?.id || "");
      const notesBookingId = String(
        paymentEntity?.notes?.bookingId || orderEntity?.notes?.bookingId || ""
      );

      // 3. Determine unique event ID (Razorpay sends x-razorpay-event-id header)
      const headerEventId = String(req.headers["x-razorpay-event-id"] || "").trim();
      const eventId =
        headerEventId ||
        `rzp_evt_${crypto
          .createHash("sha256")
          .update(`${eventType}:${orderId}:${paymentId}:${payload?.created_at || ""}`)
          .digest("hex")
          .slice(0, 24)}`;

      // 4. Duplicate-event idempotency check
      const claim = await claimWebhookEvent({
        eventId,
        provider: sigResult.provider || "razorpay_test",
        eventType,
        orderId,
        paymentId,
      });

      if (claim.duplicate) {
        return res.status(200).json({
          success: true,
          duplicate: true,
          eventId,
          event: eventType,
          message: "Duplicate webhook event ignored safely.",
        });
      }

      if (!SUPPORTED_EVENTS.has(eventType)) {
        await finalizeWebhookEvent(eventId, {
          status: "IGNORED",
          note: `Unhandled Razorpay event type: ${eventType}`,
        });
        return res.status(200).json({
          success: true,
          ignored: true,
          eventId,
          event: eventType,
          message: `Event ${eventType} acknowledged (no booking action required).`,
        });
      }

      // 5. Locate matching booking strictly on backend
      let booking = orderId ? await findBookingByOrderId(orderId) : null;
      if (!booking && notesBookingId) {
        booking = await getBookingById(notesBookingId);
      }

      if (!booking) {
        await finalizeWebhookEvent(eventId, {
          status: "IGNORED",
          note: `No booking matched orderId=${orderId || "none"}`,
        });
        return res.status(200).json({
          success: true,
          ignored: true,
          eventId,
          message: "Webhook verified; no matching QuickShow booking found for this order.",
        });
      }

      const expectedAmountPaise = Math.round(Number(booking.totalAmount) * 100);
      const expectedCurrency =
        String(booking.currency || "INR").toUpperCase() === "₹"
          ? "INR"
          : String(booking.currency || "INR").toUpperCase();

      // 6. Process verified event transitions
      if (eventType === "payment.captured" || eventType === "order.paid") {
        const receivedAmountPaise =
          eventType === "order.paid"
            ? Number(orderEntity?.amount_paid ?? orderEntity?.amount ?? paymentEntity?.amount ?? 0)
            : Number(paymentEntity?.amount ?? 0);

        const receivedCurrency = String(
          paymentEntity?.currency || orderEntity?.currency || "INR"
        ).toUpperCase();

        // Strict server-side amount & currency verification
        if (receivedAmountPaise !== expectedAmountPaise) {
          await finalizeWebhookEvent(eventId, {
            status: "FAILED",
            bookingId: String(booking._id),
            note: `Amount mismatch: expected ${expectedAmountPaise} paise, received ${receivedAmountPaise} paise.`,
          });
          return res.status(400).json({
            success: false,
            eventId,
            message: "Webhook payment amount does not match booking total.",
          });
        }

        if (receivedCurrency !== expectedCurrency) {
          await finalizeWebhookEvent(eventId, {
            status: "FAILED",
            bookingId: String(booking._id),
            note: `Currency mismatch: expected ${expectedCurrency}, received ${receivedCurrency}.`,
          });
          return res.status(400).json({
            success: false,
            eventId,
            message: "Webhook payment currency does not match booking currency.",
          });
        }

        const { booking: confirmed, alreadyConfirmed } =
          await confirmBookingAfterVerifiedPayment({
            bookingId: String(booking._id),
            paymentId: paymentId || booking.payment?.paymentId || orderId,
            signature: booking.payment?.signature || "verified_via_webhook",
            verifiedAt: new Date(),
            amountPaise: receivedAmountPaise,
            method: paymentEntity?.method || "",
            webhookEventId: eventId,
            allowWebhookGrace: true,
          });

        await finalizeWebhookEvent(eventId, {
          status: "PROCESSED",
          bookingId: String(confirmed._id),
          note: alreadyConfirmed
            ? `${eventType}: booking was already confirmed.`
            : `${eventType}: booking confirmed and seats occupied.`,
        });

        return res.status(200).json({
          success: true,
          eventId,
          event: eventType,
          alreadyConfirmed,
          bookingId: String(confirmed._id),
          bookingStatus: confirmed.status,
        });
      }

      if (eventType === "payment.failed") {
        const failureReason =
          paymentEntity?.error_description ||
          paymentEntity?.error_reason ||
          paymentEntity?.error_code ||
          "Razorpay reported payment failed.";

        const updated = await releaseBookingLock(
          String(booking._id),
          "FAILED",
          failureReason,
          { paymentId, webhookEventId: eventId }
        );

        await finalizeWebhookEvent(eventId, {
          status: "PROCESSED",
          bookingId: String(booking._id),
          note:
            updated?.status === "CONFIRMED"
              ? "payment.failed ignored because booking is already CONFIRMED."
              : `payment.failed processed: booking marked FAILED and locked seats released.`,
        });

        return res.status(200).json({
          success: true,
          eventId,
          event: eventType,
          bookingId: String(booking._id),
          bookingStatus: updated?.status || booking.status,
        });
      }

      return res.status(200).json({ success: true, eventId });
    } catch (err) {
      console.error("❌ Razorpay webhook processing error:", err.message);
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Webhook processing failed.",
      });
    }
  }
);

export default router;
