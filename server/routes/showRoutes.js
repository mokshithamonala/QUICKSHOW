import express from "express";
import {
  ensureInitialSeed,
  getShowById,
  listShows,
  listTheatres,
} from "../services/dataStore.js";

const router = express.Router();

// GET /api/theaters — list all active theatres with their upcoming shows
router.get("/theaters", async (req, res, next) => {
  try {
    await ensureInitialSeed();
    const { city } = req.query;
    const [theatres, shows] = await Promise.all([
      listTheatres(),
      listShows({ includePast: false }),
    ]);

    let filtered = theatres;
    if (city && city !== "All") {
      filtered = theatres.filter(
        (t) => t.city?.toLowerCase() === String(city).toLowerCase()
      );
    }

    const enriched = filtered.map((theatre) => {
      const theatreShows = shows.filter(
        (s) => String(s.theatreId) === String(theatre._id)
      );
      const uniqueMoviesMap = new Map();
      for (const s of theatreShows) {
        if (s.movie && !uniqueMoviesMap.has(s.tmdbMovieId)) {
          uniqueMoviesMap.set(s.tmdbMovieId, s.movie);
        }
      }
      return {
        ...theatre,
        activeShowCount: theatreShows.length,
        nowShowingMovies: Array.from(uniqueMoviesMap.values()),
        upcomingShows: theatreShows.slice(0, 12),
      };
    });

    const cities = ["All", ...new Set(theatres.map((t) => t.city).filter(Boolean))];

    res.json({
      success: true,
      theaters: enriched,
      cities,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/shows?tmdbMovieId=&theatreId=
router.get("/shows", async (req, res, next) => {
  try {
    await ensureInitialSeed();
    const { tmdbMovieId, theatreId } = req.query;
    const shows = await listShows({
      tmdbMovieId: tmdbMovieId ? Number(tmdbMovieId) : undefined,
      theatreId: theatreId ? String(theatreId) : undefined,
      includePast: false,
    });

    res.json({
      success: true,
      shows,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/shows/:showId — live seat layout, occupied seats & active locks
router.get("/shows/:showId", async (req, res, next) => {
  try {
    await ensureInitialSeed();
    const show = await getShowById(req.params.showId);
    if (!show || show.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Show not found or no longer active.",
      });
    }

    res.json({
      success: true,
      show,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
