import mongoose from "mongoose";

const bookedSeatDetailSchema = new mongoose.Schema(
  {
    seatId: { type: String, required: true },
    category: { type: String, default: "Standard" },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true }, // Clerk User ID
    userSnapshot: {
      name: { type: String, default: "QuickShow User" },
      email: { type: String, default: "" },
    },
    showId: { type: String, required: true, index: true },
    movieSnapshot: {
      id: Number,
      title: String,
      poster_path: String,
      backdrop_path: String,
      runtime: Number,
      release_date: String,
      original_language: String,
    },
    theatreSnapshot: {
      _id: String,
      name: String,
      city: String,
      address: String,
    },
    screenName: { type: String, required: true },
    showDateTime: { type: Date, required: true },
    seats: { type: [bookedSeatDetailSchema], required: true },
    bookedSeats: { type: [String], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "CONFIRMED", "FAILED", "EXPIRED", "CANCELLED"],
      default: "PENDING_PAYMENT",
      index: true,
    },
    isPaid: { type: Boolean, default: false },
    lockId: { type: String, required: true },
    lockExpiresAt: { type: Date, required: true },
    payment: {
      provider: { type: String, default: "razorpay_test" },
      mode: { type: String, default: "RAZORPAY TEST MODE" },
      isSimulated: { type: Boolean, default: false },
      isTestMode: { type: Boolean, default: true },
      isRealTransaction: { type: Boolean, default: false },
      orderId: { type: String, default: "", index: true, sparse: true },
      paymentId: { type: String, default: "", index: true, sparse: true },
      signature: { type: String, default: "" },
      amountPaise: { type: Number, default: 0 },
      method: { type: String, default: "" },
      status: {
        type: String,
        enum: ["CREATED", "PAID", "FAILED", "CANCELLED"],
        default: "CREATED",
      },
      failureReason: { type: String, default: "" },
      verifiedAt: { type: Date, default: null },
      webhookEvents: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
