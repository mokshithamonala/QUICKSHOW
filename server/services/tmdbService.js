import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMG_POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const IMG_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";
const IMG_PROFILE_BASE = "https://image.tmdb.org/t/p/w300";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCached = (key, data, ttlMs = CACHE_TTL_MS) => {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
};

export const isTmdbConfigured = () =>
  Boolean(process.env.TMDB_ACCESS_TOKEN || process.env.TMDB_API_KEY);

const toPosterUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${IMG_POSTER_BASE}${path}`;
};

const toBackdropUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${IMG_BACKDROP_BASE}${path}`;
};

const toProfileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${IMG_PROFILE_BASE}${path}`;
};

// Static genre fallback map used to enrich list items that only include genre_ids
let genreMapCache = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const tmdbRequest = async (endpoint, params = {}) => {
  const token = process.env.TMDB_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  if (!token && !apiKey) {
    const err = new Error("TMDB credentials are not configured");
    err.code = "TMDB_UNCONFIGURED";
    throw err;
  }

  const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
  const hit = getCached(cacheKey);
  if (hit) return hit;

  const headers = { Accept: "application/json" };
  const queryParams = { language: "en-US", ...params };

  // Prefer v4 Bearer token if provided; fall back to v3 api_key on 401
  const tryWithBearer = async () => {
    const res = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
      params: queryParams,
      timeout: 10000,
    });
    return res.data;
  };

  const tryWithApiKey = async () => {
    const res = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      headers,
      params: { ...queryParams, api_key: apiKey },
      timeout: 10000,
    });
    return res.data;
  };

  let data;
  if (token) {
    try {
      data = await tryWithBearer();
    } catch (err) {
      if (apiKey && (err.response?.status === 401 || err.response?.status === 403)) {
        data = await tryWithApiKey();
      } else {
        throw err;
      }
    }
  } else {
    data = await tryWithApiKey();
  }

  setCached(cacheKey, data);
  return data;
};

export const normalizeMovie = (raw) => {
  if (!raw) return null;
  const genres = Array.isArray(raw.genres)
    ? raw.genres
    : Array.isArray(raw.genre_ids)
    ? raw.genre_ids
        .map((id) => ({ id, name: genreMapCache[id] || "Other" }))
        .filter((g) => g.name !== "Other")
    : [];

  return {
    id: Number(raw.id),
    _id: String(raw.id),
    title: raw.title || raw.original_title || "Untitled",
    original_title: raw.original_title || raw.title || "",
    overview: raw.overview || "No synopsis available yet.",
    poster_path: toPosterUrl(raw.poster_path),
    backdrop_path: toBackdropUrl(raw.backdrop_path || raw.poster_path),
    release_date: raw.release_date || "",
    original_language: raw.original_language || "en",
    vote_average: Number(raw.vote_average || 0),
    vote_count: Number(raw.vote_count || 0),
    popularity: Number(raw.popularity || 0),
    runtime: raw.runtime || 0,
    tagline: raw.tagline || "",
    status: raw.status || "",
    genres,
    character: raw.character || "",
  };
};

export const getGenres = async () => {
  try {
    const data = await tmdbRequest("/genre/movie/list");
    const genres = data.genres || [];
    genres.forEach((g) => {
      genreMapCache[g.id] = g.name;
    });
    return { genres, source: "tmdb" };
  } catch {
    return {
      genres: Object.entries(genreMapCache).map(([id, name]) => ({
        id: Number(id),
        name,
      })),
      source: "fallback",
    };
  }
};

export const getMoviesByCategory = async (category = "popular", page = 1) => {
  const endpointMap = {
    trending: "/trending/movie/week",
    popular: "/movie/popular",
    now_playing: "/movie/now_playing",
    upcoming: "/movie/upcoming",
    top_rated: "/movie/top_rated",
  };
  const endpoint = endpointMap[category] || "/movie/popular";

  const data = await tmdbRequest(endpoint, { page: Number(page) || 1 });
  return {
    results: (data.results || []).map(normalizeMovie),
    page: data.page || 1,
    total_pages: Math.min(data.total_pages || 1, 500),
    total_results: data.total_results || 0,
    source: "tmdb",
  };
};

export const discoverMovies = async ({
  page = 1,
  genre = "",
  language = "",
  sortBy = "popularity.desc",
  year = "",
} = {}) => {
  const params = {
    page: Number(page) || 1,
    sort_by: sortBy || "popularity.desc",
    include_adult: false,
  };
  if (genre && genre !== "all") params.with_genres = genre;
  if (language && language !== "all") params.with_original_language = language;
  if (year) params.primary_release_year = year;

  const data = await tmdbRequest("/discover/movie", params);
  return {
    results: (data.results || []).map(normalizeMovie),
    page: data.page || 1,
    total_pages: Math.min(data.total_pages || 1, 500),
    total_results: data.total_results || 0,
    source: "tmdb",
  };
};

export const searchMovies = async (query, page = 1) => {
  if (!query || !query.trim()) {
    return { results: [], page: 1, total_pages: 1, total_results: 0, source: "tmdb" };
  }
  const data = await tmdbRequest("/search/movie", {
    query: query.trim(),
    page: Number(page) || 1,
    include_adult: false,
  });
  return {
    results: (data.results || []).map(normalizeMovie),
    page: data.page || 1,
    total_pages: Math.min(data.total_pages || 1, 500),
    total_results: data.total_results || 0,
    source: "tmdb",
  };
};

const pickBestTrailer = (videos = []) => {
  const yt = videos.filter((v) => v.site === "YouTube" && v.key);
  if (yt.length === 0) return null;
  const preferred =
    yt.find((v) => v.type === "Trailer" && v.official) ||
    yt.find((v) => v.type === "Trailer") ||
    yt.find((v) => v.type === "Teaser") ||
    yt[0];
  return {
    id: preferred.id,
    name: preferred.name,
    key: preferred.key,
    type: preferred.type,
    embedUrl: `https://www.youtube.com/embed/${preferred.key}`,
    watchUrl: `https://www.youtube.com/watch?v=${preferred.key}`,
    thumbnail: `https://img.youtube.com/vi/${preferred.key}/hqdefault.jpg`,
  };
};

export const getMovieDetails = async (tmdbId) => {
  const data = await tmdbRequest(`/movie/${tmdbId}`, {
    append_to_response: "credits,videos,similar",
  });

  const normalized = normalizeMovie(data);
  const cast = (data.credits?.cast || []).slice(0, 18).map((person) => ({
    id: person.id,
    name: person.name,
    character: person.character || "",
    profile_path: toProfileUrl(person.profile_path),
  }));

  const crew = (data.credits?.crew || [])
    .filter((c) => ["Director", "Producer", "Screenplay", "Writer", "Original Music Composer"].includes(c.job))
    .slice(0, 8)
    .map((person) => ({
      id: person.id,
      name: person.name,
      job: person.job,
      profile_path: toProfileUrl(person.profile_path),
    }));

  const videos = (data.videos?.results || [])
    .filter((v) => v.site === "YouTube" && v.key)
    .slice(0, 6)
    .map((v) => ({
      id: v.id,
      name: v.name,
      key: v.key,
      type: v.type,
      official: Boolean(v.official),
      embedUrl: `https://www.youtube.com/embed/${v.key}`,
      thumbnail: `https://img.youtube.com/vi/${v.key}/hqdefault.jpg`,
    }));

  const trailer = pickBestTrailer(data.videos?.results || []);
  const similar = (data.similar?.results || []).slice(0, 10).map(normalizeMovie);

  return {
    ...normalized,
    cast,
    crew,
    trailer,
    videos,
    similar,
    source: "tmdb",
  };
};

export const getMovieTrailer = async (tmdbId) => {
  const data = await tmdbRequest(`/movie/${tmdbId}/videos`);
  return pickBestTrailer(data.results || []);
};

export const getMaheshBabuUniverse = async () => {
  const cacheKey = "universe:mahesh-babu:full";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Dynamically search TMDB for Mahesh Babu (never hardcoded filmography!)
  const searchRes = await tmdbRequest("/search/person", {
    query: "Mahesh Babu",
    include_adult: false,
  });

  const candidates = searchRes.results || [];
  const personMatch =
    candidates.find(
      (p) =>
        p.name?.toLowerCase() === "mahesh babu" &&
        p.known_for_department === "Acting"
    ) ||
    candidates.find((p) => p.name?.toLowerCase().includes("mahesh babu")) ||
    candidates[0];

  if (!personMatch) {
    throw new Error("Could not locate Mahesh Babu profile on TMDB");
  }

  const [personDetails, creditsData] = await Promise.all([
    tmdbRequest(`/person/${personMatch.id}`),
    tmdbRequest(`/person/${personMatch.id}/movie_credits`),
  ]);

  // Deduplicate cast credits and sort newest first
  const seen = new Set();
  const movies = (creditsData.cast || [])
    .filter((m) => {
      if (!m.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return Boolean(m.title);
    })
    .map(normalizeMovie)
    .sort((a, b) => {
      const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
      const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
      return dateB - dateA;
    });

  // Fetch trailers for top 6 most popular/recent films in parallel (best-effort)
  const topForTrailers = [...movies]
    .filter((m) => m.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6);

  const trailerResults = await Promise.allSettled(
    topForTrailers.map(async (m) => {
      const trailer = await getMovieTrailer(m.id);
      return trailer
        ? {
            movieId: m.id,
            title: m.title,
            releaseYear: m.release_date?.slice(0, 4) || "",
            image: trailer.thumbnail,
            videoUrl: trailer.embedUrl,
            key: trailer.key,
          }
        : null;
    })
  );

  const featuredTrailers = trailerResults
    .filter((r) => r.status === "fulfilled" && r.value)
    .map((r) => r.value);

  const ratedMovies = movies.filter((m) => m.vote_average > 0);
  const avgRating =
    ratedMovies.length > 0
      ? Number(
          (
            ratedMovies.reduce((acc, m) => acc + m.vote_average, 0) /
            ratedMovies.length
          ).toFixed(1)
        )
      : 0;

  const payload = {
    actor: {
      id: personDetails.id,
      name: personDetails.name,
      biography:
        personDetails.biography ||
        "Superstar Mahesh Babu is one of Indian cinema's most celebrated Telugu actors, known for landmark blockbusters across action, drama, and family cinema.",
      birthday: personDetails.birthday || "",
      place_of_birth: personDetails.place_of_birth || "Chennai, Tamil Nadu, India",
      known_for_department: personDetails.known_for_department || "Acting",
      popularity: personDetails.popularity || 0,
      profile_path: toPosterUrl(personDetails.profile_path),
      also_known_as: personDetails.also_known_as || [],
    },
    stats: {
      totalMovies: movies.length,
      averageRating: avgRating,
      firstReleaseYear:
        movies
          .map((m) => Number(m.release_date?.slice(0, 4)))
          .filter(Boolean)
          .sort((a, b) => a - b)[0] || 1979,
      latestReleaseYear:
        movies
          .map((m) => Number(m.release_date?.slice(0, 4)))
          .filter(Boolean)
          .sort((a, b) => b - a)[0] || new Date().getFullYear(),
    },
    movies,
    featuredTrailers,
    source: "tmdb",
  };

  setCached(cacheKey, payload, 15 * 60 * 1000); // 15 min cache
  return payload;
};

export const getHomepageTrailers = async () => {
  const cacheKey = "homepage:trailers";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const [mbUniverse, trending] = await Promise.allSettled([
      getMaheshBabuUniverse(),
      getMoviesByCategory("trending", 1),
    ]);

    const trailers = [];
    if (mbUniverse.status === "fulfilled" && mbUniverse.value.featuredTrailers?.length) {
      trailers.push(...mbUniverse.value.featuredTrailers.slice(0, 4));
    }

    if (trailers.length < 6 && trending.status === "fulfilled") {
      const candidates = (trending.value.results || []).slice(0, 6);
      const extra = await Promise.allSettled(
        candidates.map(async (m) => {
          const t = await getMovieTrailer(m.id);
          return t
            ? {
                movieId: m.id,
                title: m.title,
                releaseYear: m.release_date?.slice(0, 4) || "",
                image: t.thumbnail,
                videoUrl: t.embedUrl,
                key: t.key,
              }
            : null;
        })
      );
      extra.forEach((r) => {
        if (
          r.status === "fulfilled" &&
          r.value &&
          !trailers.some((existing) => existing.key === r.value.key)
        ) {
          trailers.push(r.value);
        }
      });
    }

    const result = trailers.slice(0, 6);
    if (result.length > 0) {
      setCached(cacheKey, result, 15 * 60 * 1000);
    }
    return result;
  } catch {
    return [];
  }
};
