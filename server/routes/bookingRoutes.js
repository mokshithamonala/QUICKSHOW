import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  confirmBookingAfterVerifiedPayment,
  getBookingById,
  listBookingsForUser,
  lockSeatsAndCreateBooking,
  releaseBookingLock,
  updateBookingOrder,
} from "../services/dataStore.js";
import {
  getPaymentAdapter,
  getPaymentStatusInfo,
} from "../services/payment/paymentService.js";

const router = express.Router();

// GET /api/payments/config — tells frontend which payment adapter is active (no secrets!)
router.get("/payments/config", (_req, res) => {
  res.json({
    success: true,
    ...getPaymentStatusInfo(),
  });
});

// POST /api/bookings/lock — atomically lock selected seats and create PENDING_PAYMENT booking
router.post("/bookings/lock", requireAuth, async (req, res, next) => {
  try {
    const { showId, seats } = req.body || {};
    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid showId and at least one seat.",
      });
    }

    const booking = await lockSeatsAndCreateBooking({
      showId,
      seatIds: seats,
      userId: req.authUser.userId,
      userSnapshot: {
        name: req.authUser.name,
        email: req.authUser.email,
      },
    });

    res.status(201).json({
      success: true,
      message: "Seats locked for 7 minutes. Complete payment to confirm your tickets.",
      booking,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings/:bookingId/release — cancel pending booking and release locked seats
router.post("/bookings/:bookingId/release", requireAuth, async (req, res, next) => {
  try {
    const booking = await getBookingById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.userId !== req.authUser.userId && !req.authUser.isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updated = await releaseBookingLock(
      req.params.bookingId,
      "CANCELLED",
      "Cancelled by user before payment completion."
    );

    res.json({
      success: true,
      message: "Seat lock released.",
      booking: updated,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/create-order — creates a server-side payment order for a locked booking
router.post("/payments/create-order", requireAuth, async (req, res, next) => {
  try {
    const { bookingId } = req.body || {};
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "bookingId is required" });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.userId !== req.authUser.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (booking.status === "CONFIRMED" && booking.isPaid) {
      return res.status(409).json({
        success: false,
        message: "This booking is already paid and confirmed.",
        booking,
      });
    }
    if (booking.status !== "PENDING_PAYMENT") {
      return res.status(409).json({
        success: false,
        message: `Cannot create payment order for booking in status ${booking.status}.`,
      });
    }
    if (new Date(booking.lockExpiresAt).getTime() <= Date.now()) {
      await releaseBookingLock(
        bookingId,
        "EXPIRED",
        "Seat reservation lock expired before payment started."
      );
      return res.status(410).json({
        success: false,
        message: "Your seat lock has expired. Please select seats again.",
      });
    }

    const adapter = getPaymentAdapter();
    const order = await adapter.createOrder({
      bookingId: String(booking._id),
      amount: booking.totalAmount,
      currency: booking.currency || "INR",
      bookingCode: booking.bookingCode,
    });

    await updateBookingOrder(String(booking._id), order);

    res.json({
      success: true,
      order,
      bookingId: String(booking._id),
      lockExpiresAt: booking.lockExpiresAt,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/verify — server-side verification BEFORE confirming any booking
router.post("/payments/verify", requireAuth, async (req, res, next) => {
  try {
    const {
      bookingId,
      orderId,
      orderToken,
      paymentId,
      signature,
      outcome = "success",
      failureReason = "",
    } = req.body || {};

    if (!bookingId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "bookingId and orderId are required for payment verification.",
      });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.userId !== req.authUser.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Duplicate payment protection
    if (booking.status === "CONFIRMED" && booking.isPaid) {
      return res.json({
        success: true,
        alreadyConfirmed: true,
        message: "Booking is already confirmed.",
        booking,
      });
    }

    if (booking.payment?.orderId && booking.payment.orderId !== orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID mismatch for this booking.",
      });
    }

    const adapter = getPaymentAdapter();
    const verification = await adapter.verifyPayment({
      bookingId: String(booking._id),
      amount: booking.totalAmount,
      orderId,
      orderToken,
      paymentId,
      signature,
      outcome,
      failureReason,
    });

    if (!verification.verified) {
      const failedBooking = await releaseBookingLock(
        String(booking._id),
        "FAILED",
        verification.reason || "Payment verification failed."
      );
      return res.status(402).json({
        success: false,
        message: verification.reason || "Payment failed. Locked seats have been released.",
        booking: failedBooking,
      });
    }

    const { booking: confirmedBooking, alreadyConfirmed } =
      await confirmBookingAfterVerifiedPayment({
        bookingId: String(booking._id),
        paymentId: verification.paymentId,
        signature: verification.signature,
        verifiedAt: verification.verifiedAt,
      });

    res.json({
      success: true,
      alreadyConfirmed,
      message: adapter.isSimulated
        ? "DEVELOPMENT MODE: Simulated payment verified and digital ticket generated!"
        : "Payment verified and booking confirmed!",
      booking: confirmedBooking,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/webhook — modular webhook endpoint ready for Razorpay signature verification
router.post("/payments/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const adapter = getPaymentAdapter();
  const signatureHeader = req.headers["x-razorpay-signature"] || "";
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body.toString("utf8")
    : JSON.stringify(req.body || {});
  const result = adapter.verifyWebhook(rawBody, signatureHeader);

  if (!result.verified) {
    return res.status(400).json({ success: false, message: result.reason || "Invalid webhook" });
  }
  return res.json({ success: true, ...result });
});

// GET /api/bookings/my — authenticated user's persistent booking history
router.get("/bookings/my", requireAuth, async (req, res, next) => {
  try {
    const bookings = await listBookingsForUser(req.authUser.userId);
    res.json({
      success: true,
      bookings,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:bookingId — booking + digital ticket details
router.get("/bookings/:bookingId", requireAuth, async (req, res, next) => {
  try {
    const booking = await getBookingById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.userId !== req.authUser.userId && !req.authUser.isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    res.json({
      success: true,
      booking,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
