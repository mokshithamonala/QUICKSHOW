import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getUserById, toggleUserFavorite } from "../services/dataStore.js";

const router = express.Router();

// GET /api/users/me — current authenticated user profile, role & favorites count
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const userDoc = await getUserById(req.authUser.userId);
    res.json({
      success: true,
      user: {
        ...req.authUser,
        favoritesCount: userDoc?.favorites?.length || 0,
        favoriteIds: (userDoc?.favorites || []).map((f) => Number(f.tmdbId)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/favorites — user's persistent favorite movies
router.get("/favorites", requireAuth, async (req, res, next) => {
  try {
    const userDoc = await getUserById(req.authUser.userId);
    const favorites = (userDoc?.favorites || []).map((f) => ({
      ...f,
      id: Number(f.tmdbId),
      _id: String(f.tmdbId),
    }));
    res.json({
      success: true,
      favorites,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/favorites/toggle — add or remove a TMDB movie from favorites
router.post("/favorites/toggle", requireAuth, async (req, res, next) => {
  try {
    const { movie } = req.body || {};
    if (!movie || !(movie.id || movie.tmdbId)) {
      return res.status(400).json({
        success: false,
        message: "A valid movie object with TMDB id is required.",
      });
    }

    const result = await toggleUserFavorite(req.authUser.userId, movie);
    res.json({
      success: true,
      isFavorite: result.isFavorite,
      favorites: result.favorites.map((f) => ({
        ...f,
        id: Number(f.tmdbId),
        _id: String(f.tmdbId),
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
