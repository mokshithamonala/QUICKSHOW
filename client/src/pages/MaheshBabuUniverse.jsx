import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  Calendar,
  MapPin,
  Film,
  Play,
  Sparkles,
  Award,
} from "lucide-react";
import { apiRequest } from "../lib/api";
import BlurCircle from "../components/blurcircle";
import TrailerModal from "../components/TrailerModal";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const DECADES = ["All", "2020s", "2010s", "2000s", "1990s", "1980s"];

const MaheshBabuUniverse = () => {
  const navigate = useNavigate();
  const [actor, setActor] = useState(null);
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [allGenres, setAllGenres] = useState(["All"]);
  const [featuredTrailers, setFeaturedTrailers] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedDecade, setSelectedDecade] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [trailerOpen, setTrailerOpen] = useState(false);
  const [activeTrailer, setActiveTrailer] = useState(null);
  const [activeTrailerTitle, setActiveTrailerTitle] = useState("");

  useEffect(() => {
    let active = true;
    const fetchUniverse = async () => {
      setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams({
          search,
          genre: selectedGenre,
          decade: selectedDecade,
          sort: sortBy,
        });
        const res = await apiRequest(`/api/movies/universe/mahesh-babu?${qs.toString()}`);
        if (!active) return;

        if (!res.success) {
          setError(res.message || "Unable to load Mahesh Babu Movie Universe.");
        } else {
          setActor(res.actor);
          setStats(res.stats);
          setMovies(res.movies || []);
          setAllGenres(res.allGenres || ["All"]);
          setFeaturedTrailers(res.featuredTrailers || []);
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to connect to TMDB.");
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchUniverse, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, selectedGenre, selectedDecade, sortBy]);

  const handleOpenMovieTrailer = async (movie, e) => {
    e.stopPropagation();
    setActiveTrailerTitle(movie.title);
    try {
      const res = await apiRequest(`/api/movies/${movie.id}/trailer`);
      if (res.trailer) {
        setActiveTrailer(res.trailer);
        setTrailerOpen(true);
      } else {
        toast.error(`No YouTube trailer available on TMDB for ${movie.title}`);
      }
    } catch {
      toast.error("Could not load trailer right now.");
    }
  };

  if (loading && !actor) {
    return (
      <div className="min-h-screen bg-black pt-28 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white pt-28 pb-24 overflow-hidden">
      <BlurCircle top="40px" right="-80px" />
      <BlurCircle top="500px" left="-100px" />

      <div className="relative z-10 px-6 md:px-16 lg:px-36">
        {/* BoB Multiverse Identity Banner */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-[0.35em] mb-2">
            <Sparkles className="w-4 h-4" />
            <span>BoB Multiverse • Live TMDB Collection</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
            Mahesh Babu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
              Movie Universe
            </span>
          </h1>
          <div className="h-1 w-28 bg-red-600 mt-3 shadow-[0_0_12px_#ff0000]" />
        </div>

        {error && (
          <div className="mb-10 p-5 rounded-xl bg-red-600/10 border border-red-600/30 text-red-300">
            {error}
          </div>
        )}

        {/* Dynamic Actor Profile Card */}
        {actor && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-zinc-950/90 border border-red-600/25 rounded-2xl p-6 md:p-8 mb-12 shadow-2xl">
            <div className="lg:col-span-3 flex justify-center lg:justify-start">
              {actor.profile_path ? (
                <img
                  src={actor.profile_path}
                  alt={actor.name}
                  className="w-56 lg:w-full max-w-[240px] aspect-[2/3] object-cover rounded-xl border border-red-600/30 shadow-[0_0_30px_rgba(220,38,38,0.2)]"
                />
              ) : (
                <div className="w-56 aspect-[2/3] bg-zinc-900 rounded-xl flex items-center justify-center">
                  <Film className="w-12 h-12 text-zinc-700" />
                </div>
              )}
            </div>

            <div className="lg:col-span-9 flex flex-col justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="text-2xl md:text-3xl font-bold">{actor.name}</h2>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-600/40">
                    Superstar • {actor.known_for_department}
                  </span>
                </div>

                <div className="flex flex-wrap gap-5 text-sm text-gray-300 mb-4">
                  {actor.birthday && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-red-500" />
                      Born {new Date(actor.birthday).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {actor.place_of_birth && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-500" />
                      {actor.place_of_birth}
                    </span>
                  )}
                </div>

                <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-5">
                  {actor.biography}
                </p>
              </div>

              {/* Career KPI Stats */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      TMDB Credits
                    </p>
                    <p className="text-2xl font-black text-white mt-1">
                      {stats.totalMovies}
                    </p>
                  </div>
                  <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Avg Rating
                    </p>
                    <p className="text-2xl font-black text-yellow-400 mt-1 flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400" />
                      {stats.averageRating}
                    </p>
                  </div>
                  <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Career Span
                    </p>
                    <p className="text-2xl font-black text-white mt-1">
                      {stats.firstReleaseYear}–{stats.latestReleaseYear}
                    </p>
                  </div>
                  <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      TMDB Person ID
                    </p>
                    <p className="text-2xl font-black text-red-500 mt-1 flex items-center gap-1">
                      <Award className="w-5 h-5" />#{actor.id}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Featured Mahesh Babu Trailers Strip */}
        {featuredTrailers.length > 0 && (
          <div className="mb-14">
            <h2 className="text-xl font-bold mb-4">Official Trailers & Highlights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredTrailers.slice(0, 4).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setActiveTrailer({ embedUrl: t.videoUrl, name: t.title });
                    setActiveTrailerTitle(t.title);
                    setTrailerOpen(true);
                  }}
                  className="relative group rounded-xl overflow-hidden border border-white/10 hover:border-red-600 transition-all text-left cursor-pointer"
                >
                  <img
                    src={t.image}
                    alt={t.title}
                    className="w-full aspect-video object-cover brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-3 rounded-full bg-red-600/90 text-white shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-3">
                    <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                    {t.releaseYear && (
                      <p className="text-xs text-gray-300">{t.releaseYear}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated Mahesh Babu Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-8 p-4 rounded-xl bg-zinc-950 border border-white/10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Mahesh Babu movies by title, role, or story..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 rounded-full py-2.5 pl-12 pr-4 text-sm text-white outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-600"
            >
              {allGenres.map((g) => (
                <option key={g} value={g}>
                  {g === "All" ? "All Genres" : g}
                </option>
              ))}
            </select>

            <select
              value={selectedDecade}
              onChange={(e) => setSelectedDecade(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-600"
            >
              {DECADES.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Eras" : d}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-600"
            >
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Dynamic Filmography Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Complete Filmography{" "}
            <span className="text-red-500 text-lg font-semibold">
              ({movies.length})
            </span>
          </h2>
        </div>

        {movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate(`/movies/${movie.id}`);
                }}
                className="group bg-zinc-950 border border-white/10 hover:border-red-600/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
              >
                <div className="relative aspect-[2/3] bg-zinc-900 overflow-hidden">
                  {movie.poster_path ? (
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                      <Film className="w-10 h-10 mb-2 text-zinc-700" />
                      <span className="text-sm font-medium">{movie.title}</span>
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/80 px-2.5 py-1 rounded-md text-xs font-bold">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
                  </div>

                  {/* Year Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-red-600/90 px-2.5 py-0.5 rounded text-xs font-bold text-white">
                    {movie.release_date ? movie.release_date.slice(0, 4) : "TBA"}
                  </div>

                  {/* Quick Trailer Button */}
                  <button
                    type="button"
                    onClick={(e) => handleOpenMovieTrailer(movie, e)}
                    className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/80 border border-white/20 hover:bg-red-600 hover:border-red-600 text-white transition-colors"
                    title="Watch Trailer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1">
                    {movie.title}
                  </h3>

                  {movie.character && (
                    <p className="text-xs text-red-400 mt-0.5 line-clamp-1">
                      as {movie.character}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(movie.genres || []).slice(0, 3).map((g) => (
                      <span
                        key={g.id}
                        className="px-2 py-0.5 text-[11px] rounded bg-zinc-900 border border-white/10 text-gray-300"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 mt-3 line-clamp-3 leading-relaxed">
                    {movie.overview}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between text-xs font-semibold text-red-400">
                    <span>View Details & Shows</span>
                    <span>TMDB #{movie.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            No Mahesh Babu movies matched your current search or filter.
          </div>
        )}
      </div>

      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailer={activeTrailer}
        title={activeTrailerTitle}
      />
    </div>
  );
};

export default MaheshBabuUniverse;
