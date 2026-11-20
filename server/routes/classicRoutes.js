import express from "express";
import {
  DEFAULT_QUALITY_CRITERIA,
  getClassicMovieById,
  listClassicMovies,
  verifyClassicStreamAuthorization,
} from "../services/classicMovieService.js";

const router = express.Router();

// GET /api/classics — isolated Watch Free Classics listing with dedicated quality, language & genre filters
router.get("/", async (req, res, next) => {
  try {
    const {
      q = "",
      language = "all",
      region = "all",
      genre = "all",
      streamableOnly = "false",
      minRating = DEFAULT_QUALITY_CRITERIA.minRating,
      minVotes = DEFAULT_QUALITY_CRITERIA.minVoteCount,
      includeExceptions = "true",
      sortBy = "curated",
    } = req.query;

    const data = await listClassicMovies({
      q,
      language,
      region,
      genre,
      streamableOnly: streamableOnly === "true" || streamableOnly === "1",
      minRating: Number(minRating),
      minVoteCount: Number(minVotes),
      includeExceptions: includeExceptions !== "false" && includeExceptions !== "0",
      sortBy,
    });

    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/classics/:id/stream — mandatory backend streaming permission & copyright check before playback
router.get("/:id/stream", async (req, res, next) => {
  try {
    const result = await verifyClassicStreamAuthorization(req.params.id);
    if (!result.authorized) {
      return res.status(result.statusCode || 403).json({
        success: false,
        authorized: false,
        message: result.reason,
        rights: result.rights || null,
      });
    }

    res.json({
      success: true,
      authorized: true,
      stream: result.stream,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/classics/:id — full classic details & copyright audit (no unverified stream URLs)
router.get("/:id", async (req, res, next) => {
  try {
    const movie = await getClassicMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Classic movie not found.",
      });
    }

    res.json({
      success: true,
      movie,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
