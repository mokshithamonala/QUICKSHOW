import mongoose from "mongoose";

const classicMovieSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    originalTitle: { type: String, default: "" },
    releaseYear: { type: Number, required: true, index: true },
    releaseDate: { type: String, default: "" },
    originalLanguage: { type: String, required: true, index: true },
    languageLabel: { type: String, required: true },
    country: { type: String, required: true },
    cinemaRegion: {
      type: String,
      enum: ["indian", "international"],
      required: true,
      index: true,
    },
    genres: [
      {
        id: Number,
        name: String,
      },
    ],
    overview: { type: String, default: "" },
    posterPath: { type: String, default: "" },
    backdropPath: { type: String, default: "" },
    runtime: { type: Number, default: 0 },
    director: { type: String, default: "" },
    cast: [{ type: String }],
    tagline: { type: String, default: "" },

    // TMDB audience metrics (kept isolated to Watch Free Classics quality evaluation)
    tmdbRating: { type: Number, default: 0 },
    tmdbVoteCount: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },

    // Curated quality & historical importance metadata
    qualityTier: {
      type: String,
      enum: ["MASTERPIECE", "CRITICALLY_ACCLAIMED", "HISTORICAL_LANDMARK"],
      default: "CRITICALLY_ACCLAIMED",
    },
    editorialHighlight: { type: String, required: true },
    awards: [{ type: String }],
    editorialException: { type: Boolean, default: false },
    exceptionReason: { type: String, default: "" },

    // Strict Copyright & Legal Streaming Verification fields
    rightsStatus: {
      type: String,
      enum: [
        "VERIFIED_PUBLIC_DOMAIN",
        "VERIFIED_OPEN_LICENSE",
        "RIGHTS_UNVERIFIED",
        "COPYRIGHT_PROTECTED",
      ],
      default: "RIGHTS_UNVERIFIED",
      index: true,
    },
    playbackEnabled: { type: Boolean, default: false, index: true },
    licenseName: { type: String, required: true },
    licenseUrl: { type: String, default: "" },
    rightsBasis: { type: String, required: true },
    regionAvailability: { type: String, required: true },
    authorizedSource: { type: String, required: true },
    sourcePageUrl: { type: String, default: "" },
    attribution: { type: String, required: true },
    verifiedAt: { type: Date, default: null },

    // Only populated for verified legal streams — NEVER fake or placeholder URLs
    streamUrl: { type: String, default: "" },
    streamFormat: { type: String, default: "" },
    archiveIdentifier: { type: String, default: "" },
    curatedRank: { type: Number, default: 100 },
  },
  { timestamps: true }
);

classicMovieSchema.index({ title: "text", originalTitle: "text", director: "text", editorialHighlight: "text" });

const ClassicMovie =
  mongoose.models.ClassicMovie || mongoose.model("ClassicMovie", classicMovieSchema);

export default ClassicMovie;
