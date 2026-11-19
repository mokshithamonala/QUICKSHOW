import express from "express";
import {
  discoverMovies,
  getGenres,
  getHomepageTrailers,
  getMaheshBabuUniverse,
  getMovieDetails,
  getMoviesByCategory,
  getMovieTrailer,
  isTmdbConfigured,
  searchMovies,
} from "../services/tmdbService.js";
import { listShows } from "../services/dataStore.js";

const router = express.Router();

// GET /api/movies/genres
router.get("/genres", async (_req, res, next) => {
  try {
    const data = await getGenres();
    res.json({ success: true, tmdbConfigured: isTmdbConfigured(), ...data });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/trailers
router.get("/trailers", async (_req, res, next) => {
  try {
    const trailers = await getHomepageTrailers();
    res.json({
      success: true,
      tmdbConfigured: isTmdbConfigured(),
      trailers,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/search?q=&page=
router.get("/search", async (req, res, next) => {
  try {
    const { q = "", page = 1 } = req.query;
    const data = await searchMovies(String(q), Number(page) || 1);
    res.json({ success: true, tmdbConfigured: isTmdbConfigured(), ...data });
  } catch (err) {
    if (err.code === "TMDB_UNCONFIGURED") {
      return res.json({
        success: true,
        tmdbConfigured: false,
        results: [],
        page: 1,
        total_pages: 1,
        total_results: 0,
        message: "Configure TMDB_ACCESS_TOKEN in .env to enable live movie search.",
      });
    }
    next(err);
  }
});

// GET /api/movies/discover?genre=&language=&sort=&year=&page=
router.get("/discover", async (req, res, next) => {
  try {
    const {
      page = 1,
      genre = "",
      language = "",
      sort = "popularity.desc",
      year = "",
    } = req.query;

    const data = await discoverMovies({
      page: Number(page) || 1,
      genre: String(genre),
      language: String(language),
      sortBy: String(sort),
      year: String(year),
    });

    res.json({ success: true, tmdbConfigured: isTmdbConfigured(), ...data });
  } catch (err) {
    if (err.code === "TMDB_UNCONFIGURED") {
      return res.json({
        success: true,
        tmdbConfigured: false,
        results: [],
        page: 1,
        total_pages: 1,
        total_results: 0,
      });
    }
    next(err);
  }
});

// GET /api/movies/universe/mahesh-babu?search=&genre=&decade=&sort=
router.get("/universe/mahesh-babu", async (req, res, next) => {
  try {
    const data = await getMaheshBabuUniverse();
    const { search = "", genre = "All", decade = "All", sort = "newest" } = req.query;

    let filtered = [...data.movies];

    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.overview?.toLowerCase().includes(q) ||
          m.character?.toLowerCase().includes(q)
      );
    }

    if (genre && genre !== "All") {
      filtered = filtered.filter((m) =>
        m.genres?.some((g) => g.name.toLowerCase() === String(genre).toLowerCase())
      );
    }

    if (decade && decade !== "All") {
      const startYear = Number(String(decade).replace("s", ""));
      if (!Number.isNaN(startYear)) {
        filtered = filtered.filter((m) => {
          const y = Number(m.release_date?.slice(0, 4));
          return y >= startYear && y <= startYear + 9;
        });
      }
    }

    if (sort === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.release_date || "1900-01-01") -
          new Date(b.release_date || "1900-01-01")
      );
    } else if (sort === "rating") {
      filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sort === "popularity") {
      filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    res.json({
      success: true,
      tmdbConfigured: isTmdbConfigured(),
      actor: data.actor,
      stats: data.stats,
      featuredTrailers: data.featuredTrailers,
      allGenres: [
        "All",
        ...new Set(data.movies.flatMap((m) => (m.genres || []).map((g) => g.name))),
      ],
      movies: filtered,
      totalCount: data.movies.length,
    });
  } catch (err) {
    if (err.code === "TMDB_UNCONFIGURED") {
      return res.json({
        success: false,
        tmdbConfigured: false,
        message: "Configure TMDB_ACCESS_TOKEN in .env to load the dynamic Mahesh Babu Movie Universe.",
        movies: [],
      });
    }
    next(err);
  }
});

// GET /api/movies/category/:category?page=
router.get("/category/:category", async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1 } = req.query;
    const allowed = ["trending", "popular", "now_playing", "upcoming", "top_rated"];
    const safeCategory = allowed.includes(category) ? category : "popular";

    const data = await getMoviesByCategory(safeCategory, Number(page) || 1);
    res.json({
      success: true,
      tmdbConfigured: isTmdbConfigured(),
      category: safeCategory,
      ...data,
    });
  } catch (err) {
    if (err.code === "TMDB_UNCONFIGURED") {
      return res.json({
        success: true,
        tmdbConfigured: false,
        results: [],
        page: 1,
        total_pages: 1,
        total_results: 0,
      });
    }
    next(err);
  }
});

// GET /api/movies/:id/trailer
router.get("/:id/trailer", async (req, res, next) => {
  try {
    const tmdbId = Number(req.params.id);
    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid TMDB movie ID" });
    }
    const trailer = await getMovieTrailer(tmdbId);
    res.json({ success: true, trailer });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/:id (Details + Cast/Crew + Trailers + Similar + Active QUICKSHOW Shows)
router.get("/:id", async (req, res, next) => {
  try {
    const tmdbId = Number(req.params.id);
    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid TMDB movie ID" });
    }

    const [movie, shows] = await Promise.all([
      getMovieDetails(tmdbId),
      listShows({ tmdbMovieId: tmdbId, includePast: false }),
    ]);

    res.json({
      success: true,
      tmdbConfigured: isTmdbConfigured(),
      movie,
      shows,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ success: false, message: "Movie not found on TMDB" });
    }
    next(err);
  }
});

export default router;
