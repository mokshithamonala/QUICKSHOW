import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { apiRequest } from "../lib/api";

const CATEGORIES = [
  { id: "trending", label: "Trending" },
  { id: "now_playing", label: "Now Playing" },
  { id: "popular", label: "Popular" },
  { id: "top_rated", label: "Top Rated" },
  { id: "upcoming", label: "Upcoming" },
];

const LANGUAGES = [
  { code: "all", label: "All Languages" },
  { code: "te", label: "Telugu" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "ml", label: "Malayalam" },
  { code: "kn", label: "Kannada" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
];

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get("tab") || "trending";
  const initialSearch = searchParams.get("search") || "";

  const [category, setCategory] = useState(
    CATEGORIES.some((c) => c.id === initialTab) ? initialTab : "trending"
  );
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [page, setPage] = useState(1);

  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync URL ?search= or ?tab= changes (e.g., from Navbar search)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlTab = searchParams.get("tab");
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
      setDebouncedSearch(urlSearch);
      setPage(1);
    }
    if (urlTab && CATEGORIES.some((c) => c.id === urlTab)) {
      setCategory(urlTab);
    }
  }, [searchParams]);

  // Debounce typing in search bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load TMDB genres once
  useEffect(() => {
    apiRequest("/api/movies/genres")
      .then((res) => setGenres(res.genres || []))
      .catch(() => setGenres([]));
  }, []);

  // Fetch live TMDB movies whenever filters/search/page change
  useEffect(() => {
    let active = true;
    const fetchMovies = async () => {
      setLoading(true);
      setError("");
      try {
        let endpoint = "";
        if (debouncedSearch) {
          endpoint = `/api/movies/search?q=${encodeURIComponent(debouncedSearch)}&page=${page}`;
        } else if (selectedGenre !== "all" || selectedLanguage !== "all") {
          const qs = new URLSearchParams({
            page: String(page),
            genre: selectedGenre,
            language: selectedLanguage,
            sort: category === "top_rated" ? "vote_average.desc" : "popularity.desc",
          });
          endpoint = `/api/movies/discover?${qs.toString()}`;
        } else {
          endpoint = `/api/movies/category/${category}?page=${page}`;
        }

        const data = await apiRequest(endpoint);
        if (!active) return;

        let list = data.results || [];
        // Apply client refinement if user combined text search with genre/language filters
        if (debouncedSearch) {
          if (selectedGenre !== "all") {
            list = list.filter((m) =>
              m.genres?.some((g) => String(g.id) === String(selectedGenre))
            );
          }
          if (selectedLanguage !== "all") {
            list = list.filter((m) => m.original_language === selectedLanguage);
          }
        }

        setMovies(list);
        setTotalPages(Math.min(data.total_pages || 1, 50));
        setTotalResults(data.total_results || list.length);
      } catch (err) {
        if (active) setError(err.message || "Failed to load movies from TMDB");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMovies();
    return () => {
      active = false;
    };
  }, [category, debouncedSearch, selectedGenre, selectedLanguage, page]);

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedGenre("all");
    setSelectedLanguage("all");
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) || selectedGenre !== "all" || selectedLanguage !== "all";

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6 md:px-16 lg:px-36 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {debouncedSearch ? `Search: "${debouncedSearch}"` : "Explore Movies"}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Live TMDB catalogue • {totalResults.toLocaleString()} titles available
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search movies by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 outline-none rounded-full py-3 pl-12 pr-10 text-white placeholder-gray-500 transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setDebouncedSearch("");
                setSearchParams({});
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 mb-6">
        {CATEGORIES.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setCategory(tab.id);
              setSelectedGenre("all");
              setSelectedLanguage("all");
              setSearchTerm("");
              setDebouncedSearch("");
              setPage(1);
              setSearchParams({ tab: tab.id });
            }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              !hasActiveFilters && category === tab.id
                ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.35)]"
                : "bg-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Genre & Language Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-10 p-4 rounded-xl bg-zinc-950 border border-white/10">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 font-semibold">
          <SlidersHorizontal className="w-4 h-4 text-red-500" />
          <span>Filters:</span>
        </div>

        <select
          value={selectedGenre}
          onChange={(e) => {
            setSelectedGenre(e.target.value);
            setPage(1);
          }}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white outline-none focus:border-red-600"
        >
          <option value="all">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={selectedLanguage}
          onChange={(e) => {
            setSelectedLanguage(e.target.value);
            setPage(1);
          }}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white outline-none focus:border-red-600"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto text-xs text-red-400 hover:text-red-300 font-semibold uppercase tracking-wider cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-600/10 border border-red-600/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-zinc-900 rounded-lg" />
              <div className="h-4 bg-zinc-900 rounded mt-3 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-14">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  page <= 1
                    ? "border-zinc-800 text-zinc-600 cursor-not-allowed"
                    : "border-zinc-700 text-white hover:border-red-600 cursor-pointer"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-sm text-gray-400">
                Page <span className="text-white font-semibold">{page}</span> of{" "}
                <span className="text-white font-semibold">{totalPages}</span>
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  page >= totalPages
                    ? "border-zinc-800 text-zinc-600 cursor-not-allowed"
                    : "border-zinc-700 text-white hover:border-red-600 cursor-pointer"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium text-white mb-2">No movies found</p>
          <p className="text-sm">Try adjusting your search query or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Movies;