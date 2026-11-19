import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  createShowsBatch,
  createTheatre,
  deleteShow,
  deleteTheatre,
  ensureInitialSeed,
  getAdminDashboardStats,
  listAllBookings,
  listShows,
  listTheatres,
} from "../services/dataStore.js";
import { getMovieDetails } from "../services/tmdbService.js";

const router = express.Router();

// Every route in this router requires verified Admin RBAC authorization
router.use(requireAdmin);

// GET /api/admin/me — verify admin access
router.get("/me", (req, res) => {
  res.json({
    success: true,
    isAdmin: true,
    user: req.authUser,
  });
});

// GET /api/admin/dashboard — live statistics and active shows
router.get("/dashboard", async (_req, res, next) => {
  try {
    await ensureInitialSeed();
    const stats = await getAdminDashboardStats();
    res.json({
      success: true,
      dashboard: stats,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/theaters
router.get("/theaters", async (_req, res, next) => {
  try {
    await ensureInitialSeed();
    const theaters = await listTheatres();
    res.json({ success: true, theaters });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/theaters — add a new theatre with screens & seat pricing defaults
router.post("/theaters", async (req, res, next) => {
  try {
    const { name, city, address, amenities, screens } = req.body || {};
    if (!name?.trim() || !city?.trim() || !address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Theatre name, city, and address are required.",
      });
    }

    const theatre = await createTheatre({
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      amenities,
      screens,
    });

    res.status(201).json({
      success: true,
      message: "Theatre created successfully.",
      theatre,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/theaters/:id
router.delete("/theaters/:id", async (req, res, next) => {
  try {
    const deleted = await deleteTheatre(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Theatre not found" });
    }
    res.json({ success: true, message: "Theatre removed.", theatre: deleted });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/shows
router.get("/shows", async (_req, res, next) => {
  try {
    await ensureInitialSeed();
    const shows = await listShows({ includePast: true });
    res.json({ success: true, shows });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/shows — schedule one or more showtimes for a real TMDB movie
router.post("/shows", async (req, res, next) => {
  try {
    const {
      tmdbMovieId,
      movie: moviePayload,
      theatreId,
      screenName,
      showPrice,
      seatCategories,
      dateTimes,
    } = req.body || {};

    const resolvedMovieId = Number(tmdbMovieId || moviePayload?.id);
    if (!resolvedMovieId || !theatreId || !Array.isArray(dateTimes) || dateTimes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "TMDB movie, theatre, and at least one show date & time are required.",
      });
    }

    let movieData = moviePayload;
    try {
      // Hydrate authoritative details from TMDB whenever available
      const fullDetails = await getMovieDetails(resolvedMovieId);
      if (fullDetails) movieData = fullDetails;
    } catch {
      if (!movieData?.title) {
        return res.status(400).json({
          success: false,
          message: "Could not verify TMDB movie details.",
        });
      }
    }

    const createdShows = await createShowsBatch({
      movie: movieData,
      theatreId,
      screenName,
      showPrice: Number(showPrice || 250),
      seatCategories,
      dateTimes,
    });

    res.status(201).json({
      success: true,
      message: `Scheduled ${createdShows.length} show(s) for ${movieData.title}.`,
      shows: createdShows,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/shows/:id
router.delete("/shows/:id", async (req, res, next) => {
  try {
    const removed = await deleteShow(req.params.id);
    if (!removed) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }
    res.json({ success: true, message: "Show cancelled.", show: removed });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/bookings?status=&search=
router.get("/bookings", async (req, res, next) => {
  try {
    const { status = "ALL", search = "" } = req.query;
    const bookings = await listAllBookings({
      status: String(status),
      search: String(search),
    });
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
});

export default router;
