import mongoose from "mongoose";

const seatCategoryConfigSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., Recliner, Gold, Silver
    rows: { type: [String], required: true }, // e.g., ['A', 'B']
    defaultPrice: { type: Number, required: true, min: 50 },
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., Screen 1 - IMAX
    rows: {
      type: [String],
      default: ["A", "B", "C", "D", "E", "F", "G", "H"],
    },
    seatsPerRow: { type: Number, default: 12, min: 4, max: 20 },
    categories: {
      type: [seatCategoryConfigSchema],
      default: [
        { name: "Silver", rows: ["A", "B", "C"], defaultPrice: 180 },
        { name: "Gold", rows: ["D", "E", "F"], defaultPrice: 250 },
        { name: "Recliner", rows: ["G", "H"], defaultPrice: 400 },
      ],
    },
  },
  { _id: false }
);

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    amenities: {
      type: [String],
      default: ["Dolby Atmos", "4K Laser", "Recliners", "Food Court"],
    },
    screens: { type: [screenSchema], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Theatre = mongoose.models.Theatre || mongoose.model("Theatre", theatreSchema);

export default Theatre;
