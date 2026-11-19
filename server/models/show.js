import mongoose from "mongoose";

const seatCategoryPriceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rows: { type: [String], required: true },
    price: { type: Number, required: true, min: 50 },
  },
  { _id: false }
);

const seatLockSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    lockId: { type: String, required: true },
    bookingId: { type: String, default: "" },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    tmdbMovieId: { type: Number, required: true, index: true },
    movie: {
      id: { type: Number, required: true },
      title: { type: String, required: true },
      poster_path: { type: String, default: "" },
      backdrop_path: { type: String, default: "" },
      overview: { type: String, default: "" },
      release_date: { type: String, default: "" },
      runtime: { type: Number, default: 150 },
      vote_average: { type: Number, default: 0 },
      vote_count: { type: Number, default: 0 },
      genres: [{ id: Number, name: String }],
      original_language: { type: String, default: "te" },
    },
    theatreId: { type: String, required: true, index: true },
    theatreSnapshot: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, default: "" },
    },
    screenName: { type: String, required: true },
    rows: {
      type: [String],
      default: ["A", "B", "C", "D", "E", "F", "G", "H"],
    },
    seatsPerRow: { type: Number, default: 12 },
    showDateTime: { type: Date, required: true, index: true },
    showPrice: { type: Number, required: true, min: 50 },
    seatCategories: {
      type: [seatCategoryPriceSchema],
      default: [
        { name: "Silver", rows: ["A", "B", "C"], price: 180 },
        { name: "Gold", rows: ["D", "E", "F"], price: 250 },
        { name: "Recliner", rows: ["G", "H"], price: 400 },
      ],
    },
    occupiedSeats: {
      type: Map,
      of: String, // seatId -> bookingId
      default: {},
    },
    seatLocks: {
      type: Map,
      of: seatLockSchema, // seatId -> { userId, lockId, bookingId, expiresAt }
      default: {},
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

showSchema.index({ tmdbMovieId: 1, showDateTime: 1 });
showSchema.index({ theatreId: 1, showDateTime: 1 });

const Show = mongoose.models.Show || mongoose.model("Show", showSchema);

export default Show;
