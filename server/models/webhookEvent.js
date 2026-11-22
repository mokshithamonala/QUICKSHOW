import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      default: "razorpay_test",
    },
    eventType: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      default: "",
      index: true,
    },
    paymentId: {
      type: String,
      default: "",
    },
    bookingId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["PROCESSING", "PROCESSED", "IGNORED", "FAILED"],
      default: "PROCESSING",
    },
    note: {
      type: String,
      default: "",
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const WebhookEvent =
  mongoose.models.WebhookEvent || mongoose.model("WebhookEvent", webhookEventSchema);

export default WebhookEvent;
