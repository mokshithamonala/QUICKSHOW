import mongoose from "mongoose";

const favoriteMovieSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true },
    title: { type: String, required: true },
    poster_path: { type: String, default: "" },
    backdrop_path: { type: String, default: "" },
    release_date: { type: String, default: "" },
    vote_average: { type: Number, default: 0 },
    genres: [{ id: Number, name: String }],
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Clerk User ID
    name: { type: String, default: "QuickShow User" },
    email: { type: String, default: "", index: true },
    image: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    favorites: { type: [favoriteMovieSchema], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;