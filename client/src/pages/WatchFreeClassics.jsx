import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  ShieldCheck,
  ShieldAlert,
  Star,
  Search,
  SlidersHorizontal,
  Film,
  Globe,
  Award,
  Clock,
  Info,
  X,
  ExternalLink,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { apiRequest } from "../lib/api";
import Loading from "../components/Loading";
import ClassicVideoPlayer from "../components/ClassicVideoPlayer";

const QUALITY_TIER_META = {
  MASTERPIECE: {
    label: "Masterpiece",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/35",
  },
  HISTORICAL_LANDMARK: {
    label: "Historical Landmark",
    badge: "bg-red-600/20 text-red-300 border-red-600/40",
  },
  CRITICALLY_ACCLAIMED: {
    label: "Critically Acclaimed",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/35",
  },
};

const WatchFreeClassics = () => {
  const navigate = useNavigate();

  // Dedicated Watch Free Classics state (completely isolated from /movies)
  const [movies, setMovies] = useState([]);
  const [stats, setStats] = useState({
    totalCurated: 0,
    streamableCount: 0,
    indianCount: 0,
    internationalCount: 0,
    languageCount: 0,
    filteredCount: 0,
  });
  const [facets, setFacets] = useState({ languages: [], genres: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Independent Filters & Configurable Quality Criteria (Classics section ONLY)
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [regionTab, setRegionTab] = useState("all"); // all | streamable | indian | international
  const [language, setLanguage] = useState("all");
  const [genre, setGenre] = useState("all");
  const [sortBy, setSortBy] = useState("curated");

  // Configurable quality filter panel (defaults: 7.0 rating, 100 votes, reviewed exceptions ON)
  const [showCriteriaPanel, setShowCriteriaPanel] = useState(false);
  const [minRating, setMinRating] = useState(7.0);
  const [minVotes, setMinVotes] = useState(100);
  const [includeExceptions, setIncludeExceptions] = useState(true);

  // Modals
  const [activePlayerMovie, setActivePlayerMovie] = useState(null);
  const [inspectMovie, setInspectMovie] = useState(null);

  const fetchClassics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (activeSearch.trim()) params.set("q", activeSearch.trim());
      if (regionTab === "streamable") {
        params.set("streamableOnly", "true");
      } else if (regionTab === "indian" || regionTab === "international") {
        params.set("region", regionTab);
      }
      if (language !== "all") params.set("language", language);
      if (genre !== "all") params.set("genre", genre);
      params.set("sortBy", sortBy);
      params.set("minRating", String(minRating));
      params.set("minVotes", String(minVotes));
      params.set("includeExceptions", String(includeExceptions));

      const data = await apiRequest(`/api/classics?${params.toString()}`);
      setMovies(data.movies || []);
      if (data.stats) setStats(data.stats);
      if (data.facets) setFacets(data.facets);
    } catch (err) {
      setError(err.message || "Could not load Watch Free Classics catalogue.");
    } finally {
      setLoading(false);
    }
  }, [
    activeSearch,
    regionTab,
    language,
    genre,
    sortBy,
    minRating,
    minVotes,
    includeExceptions,
  ]);

  useEffect(() => {
    fetchClassics();
  }, [fetchClassics]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const resetAllFilters = () => {
    setSearchInput("");
    setActiveSearch("");
    setRegionTab("all");
    setLanguage("all");
    setGenre("all");
    setSortBy("curated");
    setMinRating(7.0);
    setMinVotes(100);
    setIncludeExceptions(true);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-24 px-6 md:px-16 lg:px-24 xl:px-32">
      {/* Cinematic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-red-600/30 bg-gradient-to-br from-red-950/45 via-zinc-950 to-black p-7 md:p-10 mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-[0.25em] mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Curated World &amp; Indian Cinema Archive</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
              Watch Free <span className="text-red-500">Classics</span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base mt-3 leading-relaxed">
              A separate, quality-curated collection of acclaimed timeless films across Indian
              and world cinema. Direct full-length playback is enabled{" "}
              <span className="text-emerald-400 font-semibold">exclusively</span> for classics
              with backend-verified public-domain or open-license streaming rights.
            </p>
          </div>

          {/* Curated Stats */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-black text-white">{stats.totalCurated}</p>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 mt-0.5">
                Curated
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-black text-emerald-400">
                {stats.streamableCount}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-emerald-300/90 mt-0.5">
                Watch Now
              </p>
            </div>
            <div className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-black text-red-400">{stats.languageCount}</p>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 mt-0.5">
                Languages
              </p>
            </div>
          </div>
        </div>

        {/* Legal & Separation Assurance Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-400">
          <span className="flex items-center gap-1.5 text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Server-verified Public Domain / Open License streams only
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            Default Quality Gate: TMDB ≥ {minRating.toFixed(1)}★ &amp; ≥ {minVotes} votes (plus reviewed heritage classics)
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-red-400 shrink-0" />
            Indian (Telugu, Tamil, Hindi, Malayalam, Kannada, Bengali, Marathi) &amp; World Cinema
          </span>
        </div>
      </div>

      {/* Dedicated Search, Tabs & Filter Bar */}
      <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 mb-8 space-y-5">
        {/* Top Row: Region/Mode Tabs + Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: `All Classics (${stats.totalCurated})` },
              {
                id: "streamable",
                label: `Watch Now · Verified Free (${stats.streamableCount})`,
              },
              { id: "indian", label: `Indian Cinema (${stats.indianCount})` },
              {
                id: "international",
                label: `International (${stats.internationalCount})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRegionTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  regionTab === tab.id
                    ? tab.id === "streamable"
                      ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    : "bg-zinc-900 text-gray-300 border border-white/10 hover:text-white hover:border-white/25"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full lg:w-96">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search title, director, language, year..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Second Row: Language, Genre, Sort, Configurable Quality Criteria */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Filter classics by language"
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white outline-none cursor-pointer"
          >
            <option value="all">All Languages ({facets.languages.length})</option>
            {facets.languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label} ({lang.count})
              </option>
            ))}
          </select>

          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            aria-label="Filter classics by genre"
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white outline-none cursor-pointer"
          >
            <option value="all">All Genres</option>
            {facets.genres.map((g) => (
              <option key={g.name} value={g.name}>
                {g.name} ({g.count})
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort classics"
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white outline-none cursor-pointer"
          >
            <option value="curated">Sort: Curated Featured</option>
            <option value="rating">Sort: Highest TMDB Rating</option>
            <option value="year_asc">Sort: Oldest First</option>
            <option value="year_desc">Sort: Newest First</option>
          </select>

          <button
            type="button"
            onClick={() => setShowCriteriaPanel((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              showCriteriaPanel
                ? "bg-red-600/20 border-red-500 text-red-300"
                : "bg-zinc-900 border-zinc-800 text-gray-300 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Quality Criteria ({minRating.toFixed(1)}★+)</span>
          </button>

          {(activeSearch ||
            regionTab !== "all" ||
            language !== "all" ||
            genre !== "all" ||
            minRating !== 7.0 ||
            minVotes !== 100 ||
            !includeExceptions) && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-red-400 hover:text-red-300 underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Configurable Quality Criteria Panel (Watch Free Classics ONLY) */}
        {showCriteriaPanel && (
          <div className="p-4 rounded-xl bg-black/70 border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div>
              <div className="flex justify-between text-gray-300 mb-1.5">
                <span>Minimum TMDB Rating</span>
                <span className="font-bold text-amber-400">{minRating.toFixed(1)} ★</span>
              </div>
              <input
                type="range"
                min={6.0}
                max={8.5}
                step={0.1}
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1.5">
                <span>Minimum Vote Count</span>
                <span className="font-bold text-white">{minVotes} votes</span>
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                step={25}
                value={minVotes}
                onChange={(e) => setMinVotes(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between gap-3 bg-zinc-900/70 rounded-lg px-3.5 py-2.5 border border-white/10">
              <div>
                <p className="text-white font-semibold">Reviewed Classic Exceptions</p>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Include National Award &amp; heritage Indian landmarks with lower TMDB vote counts
                </p>
              </div>
              <input
                type="checkbox"
                checked={includeExceptions}
                onChange={(e) => setIncludeExceptions(e.target.checked)}
                className="w-4 h-4 accent-red-600 cursor-pointer shrink-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Area */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="bg-zinc-950 border border-red-600/30 rounded-2xl p-10 text-center">
          <p className="text-red-400 font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchClassics}
            className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : movies.length === 0 ? (
        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-12 text-center">
          <Film className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Classics Match Your Filters</h3>
          <p className="text-sm text-gray-400 mt-1">
            Try widening your language, genre, or quality criteria filters.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="mt-5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold cursor-pointer"
          >
            Reset Classics Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map((movie) => {
            const tier =
              QUALITY_TIER_META[movie.qualityTier] || QUALITY_TIER_META.CRITICALLY_ACCLAIMED;
            const canStream = Boolean(movie.rights?.playbackEnabled);

            return (
              <div
                key={movie._id}
                className="group bg-zinc-950 border border-white/10 hover:border-red-600/50 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 shadow-lg"
              >
                {/* Poster & Top Badges */}
                <div className="relative h-72 bg-zinc-900 overflow-hidden">
                  {movie.posterPath ? (
                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                      <Film className="w-10 h-10" />
                      <span className="text-xs">{movie.title}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/25 to-transparent" />

                  {/* Top-Left Rights Verification Badge */}
                  <div className="absolute top-3 left-3">
                    {canStream ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                        <ShieldCheck className="w-3 h-3" />
                        Free Full Movie
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-white/15 text-gray-300 text-[10px] font-semibold uppercase tracking-wider">
                        <Lock className="w-3 h-3 text-amber-400" />
                        Info Only
                      </span>
                    )}
                  </div>

                  {/* Top-Right TMDB Rating */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 text-xs font-bold text-yellow-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    <span>{movie.tmdbRating.toFixed(1)}</span>
                  </div>

                  {/* Bottom Poster Overlay: Year + Language */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-black/75 border border-white/15 text-gray-200 font-semibold">
                      {movie.releaseYear} · {movie.languageLabel}
                    </span>
                    {movie.runtime > 0 && (
                      <span className="inline-flex items-center gap-1 text-gray-300 bg-black/70 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-red-400" />
                        {movie.runtime}m
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${tier.badge}`}
                    >
                      {tier.label}
                    </span>
                    {movie.editorialException && (
                      <span className="px-2 py-0.5 rounded border border-purple-500/35 bg-purple-500/15 text-purple-300 text-[10px] font-semibold">
                        Heritage Pick
                      </span>
                    )}
                  </div>

                  <h3 className="text-white font-bold text-lg leading-snug line-clamp-1">
                    {movie.title}
                  </h3>
                  {movie.director && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Dir. <span className="text-gray-300">{movie.director}</span> ·{" "}
                      {movie.country}
                    </p>
                  )}

                  <p className="text-xs text-gray-300 mt-2.5 line-clamp-3 leading-relaxed flex-1">
                    {movie.editorialHighlight}
                  </p>

                  {/* Genres */}
                  {movie.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {movie.genres.slice(0, 3).map((g) => (
                        <span
                          key={g.name}
                          className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-[10px] text-gray-400"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Rights & Action Buttons */}
                  <div className="mt-4 pt-3.5 border-t border-white/10 space-y-2">
                    {canStream ? (
                      <button
                        type="button"
                        onClick={() => setActivePlayerMovie(movie)}
                        className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.35)]"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Watch Now (Free)
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title="Direct playback is disabled because legal free streaming rights have not been verified."
                        className="w-full py-2.5 px-4 bg-zinc-900 border border-zinc-800 text-gray-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-500/80" />
                        Playback Unavailable (Rights Protected)
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setInspectMovie(movie)}
                      className="w-full py-2 px-3 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Quality &amp; Copyright Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Classic Details, Quality Evaluation & Copyright Audit Modal */}
      {inspectMovie && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setInspectMovie(null)}
        >
          <div
            className="w-full max-w-2xl bg-zinc-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">{inspectMovie.title}</h2>
                <p className="text-xs text-gray-400">
                  {inspectMovie.releaseYear} · {inspectMovie.languageLabel} ·{" "}
                  {inspectMovie.country}
                  {inspectMovie.director ? ` · Dir. ${inspectMovie.director}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectMovie(null)}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm">
              <div className="flex flex-col sm:flex-row gap-5">
                {inspectMovie.posterPath && (
                  <img
                    src={inspectMovie.posterPath}
                    alt={inspectMovie.title}
                    className="w-32 h-48 object-cover rounded-xl border border-white/10 shrink-0"
                  />
                )}
                <div className="space-y-3">
                  <p className="text-gray-200 leading-relaxed">{inspectMovie.overview}</p>
                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-white/10 text-xs text-gray-300">
                    <p className="text-amber-300 font-semibold mb-1">
                      Why This Classic Was Selected
                    </p>
                    <p>{inspectMovie.editorialHighlight}</p>
                  </div>
                  {inspectMovie.awards?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {inspectMovie.awards.map((award) => (
                        <span
                          key={award}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px]"
                        >
                          <Award className="w-3 h-3 shrink-0" />
                          {award}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quality Gate Audit */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 text-xs space-y-1.5">
                <p className="text-white font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Watch Free Classics Quality Evaluation
                </p>
                <p className="text-gray-300">{inspectMovie.qualityEvaluation?.summary}</p>
                {inspectMovie.editorialException && inspectMovie.exceptionReason && (
                  <p className="text-purple-300 pt-1">{inspectMovie.exceptionReason}</p>
                )}
              </div>

              {/* Copyright & Legal Streaming Verification Audit */}
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  inspectMovie.rights?.playbackEnabled
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-amber-500/10 border-amber-500/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    {inspectMovie.rights?.playbackEnabled ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                    )}
                    Copyright &amp; Legal Streaming Status
                  </p>
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-black/50 text-gray-200">
                    {inspectMovie.rights?.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
                  <div>
                    <span className="text-gray-400">License: </span>
                    <span className="text-white">{inspectMovie.rights?.licenseName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Region: </span>
                    <span className="text-white">
                      {inspectMovie.rights?.regionAvailability}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400">Authorized Source: </span>
                    <span className="text-white">
                      {inspectMovie.rights?.authorizedSource}
                    </span>
                  </div>
                </div>

                <p className="text-gray-200 leading-relaxed pt-1">
                  {inspectMovie.rights?.rightsBasis}
                </p>
                <p className="text-gray-400 italic">{inspectMovie.rights?.attribution}</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/10 bg-black/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const id = inspectMovie.tmdbId;
                    setInspectMovie(null);
                    navigate(`/movies/${id}`);
                  }}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Open TMDB Movie Page
                </button>
                {inspectMovie.rights?.sourcePageUrl && (
                  <a
                    href={inspectMovie.rights.sourcePageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 border border-white/10 hover:border-white/25 text-gray-300 rounded-lg text-xs"
                  >
                    <span>Source Record</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {inspectMovie.rights?.playbackEnabled ? (
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectMovie;
                    setInspectMovie(null);
                    setActivePlayerMovie(target);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Watch Full Movie Now
                </button>
              ) : (
                <span className="text-xs text-amber-300 font-medium">
                  Direct streaming disabled (no verified free license)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Responsive Verified Classic Video Player Modal */}
      {activePlayerMovie && (
        <ClassicVideoPlayer
          classic={activePlayerMovie}
          onClose={() => setActivePlayerMovie(null)}
        />
      )}
    </div>
  );
};

export default WatchFreeClassics;
