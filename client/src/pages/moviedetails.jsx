import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  Star,
  Clock,
  Calendar,
  ArrowLeft,
  Heart,
  MapPin,
  Users,
  Ticket,
  Film,
} from "lucide-react";
import MovieCard from "../components/MovieCard";
import TrailerModal from "../components/TrailerModal";
import Loading from "../components/Loading";
import { apiRequest, formatCurrency } from "../lib/api";
import { useAuthSession, useAuthUser } from "../lib/auth";
import toast from "react-hot-toast";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const { getToken } = useAuthSession();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShowId, setSelectedShowId] = useState("");

  const [isFavorite, setIsFavorite] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load real TMDB details + active QUICKSHOW shows for this TMDB ID
  useEffect(() => {
    let active = true;
    const loadMovie = async () => {
      setLoading(true);
      setError("");
      setSelectedShowId("");
      setSelectedTheatreId("ALL");
      try {
        const res = await apiRequest(`/api/movies/${id}`);
        if (!active) return;
        setMovie(res.movie);
        const activeShows = res.shows || [];
        setShows(activeShows);

        if (activeShows.length > 0) {
          const firstDate = new Date(activeShows[0].showDateTime)
            .toISOString()
            .slice(0, 10);
          setSelectedDate(firstDate);
        } else {
          setSelectedDate("");
        }
      } catch (err) {
        if (active) setError(err.message || "Could not load movie details.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMovie();
    return () => {
      active = false;
    };
  }, [id]);

  // Check if this movie is in the authenticated user's persistent favorites
  useEffect(() => {
    if (!user || !movie?.id) {
      setIsFavorite(false);
      return;
    }

    apiRequest("/api/users/me", { getToken })
      .then((res) => {
        const ids = res?.user?.favoriteIds || [];
        setIsFavorite(ids.includes(Number(movie.id)));
      })
      .catch(() => {});
  }, [user, movie?.id, getToken]);

  const theatres = useMemo(() => {
    const map = new Map();
    for (const s of shows) {
      if (s.theatreSnapshot?._id) {
        map.set(s.theatreSnapshot._id, s.theatreSnapshot);
      }
    }
    return Array.from(map.values());
  }, [shows]);

  const filteredByTheatre = useMemo(() => {
    if (selectedTheatreId === "ALL") return shows;
    return shows.filter((s) => String(s.theatreId) === String(selectedTheatreId));
  }, [shows, selectedTheatreId]);

  const availableDates = useMemo(() => {
    const set = new Set(
      filteredByTheatre.map((s) => new Date(s.showDateTime).toISOString().slice(0, 10))
    );
    return Array.from(set).sort();
  }, [filteredByTheatre]);

  useEffect(() => {
    if (availableDates.length > 0 && !availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[0]);
      setSelectedShowId("");
    }
  }, [availableDates, selectedDate]);

  const showsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return filteredByTheatre.filter(
      (s) => new Date(s.showDateTime).toISOString().slice(0, 10) === selectedDate
    );
  }, [filteredByTheatre, selectedDate]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Please sign in to save favorite movies.");
      return;
    }
    if (!movie || favBusy) return;
    setFavBusy(true);
    try {
      const res = await apiRequest("/api/users/favorites/toggle", {
        method: "POST",
        getToken,
        body: { movie },
      });
      setIsFavorite(Boolean(res.isFavorite));
      toast.success(
        res.isFavorite
          ? `Added "${movie.title}" to Favorites`
          : `Removed "${movie.title}" from Favorites`
      );
    } catch (err) {
      toast.error(err.message || "Could not update favorites");
    } finally {
      setFavBusy(false);
    }
  };

  const handleBookTickets = () => {
    if (!selectedShowId) {
      toast.error("Please select a showtime first.");
      return;
    }
    navigate(`/seat-layout/${selectedShowId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <Loading />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center pt-20">
        <Film className="w-14 h-14 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Movie Not Available</h1>
        <p className="text-gray-400 mb-6">{error || "Could not find this movie."}</p>
        <button
          onClick={() => navigate("/movies")}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-24 left-6 md:left-16 z-40 p-3 bg-black/60 border border-white/15 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Hero Section */}
      <div className="relative min-h-[72vh] flex items-end pt-32 pb-12">
        {movie.backdrop_path && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${movie.backdrop_path})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/30" />

        <div className="relative z-10 w-full px-6 md:px-16 lg:px-36">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {movie.poster_path && (
              <div className="w-44 md:w-56 shrink-0">
                <img
                  src={movie.poster_path}
                  alt={movie.title}
                  className="w-full rounded-xl shadow-2xl border border-white/15"
                />
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                <span className="flex items-center gap-1 text-yellow-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                </span>

                {movie.runtime > 0 && (
                  <>
                    <span className="text-gray-500">|</span>
                    <span className="flex items-center gap-1 text-gray-300">
                      <Clock className="w-4 h-4" />
                      {movie.runtime} min
                    </span>
                  </>
                )}

                {movie.release_date && (
                  <>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-300">{movie.release_date}</span>
                  </>
                )}

                {movie.original_language && (
                  <>
                    <span className="text-gray-500">|</span>
                    <span className="uppercase text-gray-300 font-semibold">
                      {movie.original_language}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-black mb-2">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-red-400 italic text-sm md:text-base mb-4">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3.5 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded-full text-xs font-semibold"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 text-base md:text-lg max-w-3xl leading-relaxed mb-6">
                {movie.overview}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (movie.trailer) {
                      setTrailerOpen(true);
                    } else {
                      toast.error("No official YouTube trailer available on TMDB for this movie.");
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Trailer
                </button>

                <button
                  type="button"
                  disabled={favBusy}
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg border transition-colors cursor-pointer ${
                    isFavorite
                      ? "bg-red-600 border-red-600 text-white"
                      : "border-gray-600 text-gray-300 hover:border-red-600 hover:text-red-400"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                  <span className="text-sm font-semibold">
                    {isFavorite ? "Saved in Favorites" : "Add to Favorites"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-16 lg:px-36 py-12 space-y-16">
        {/* Showtimes Booking Section */}
        <section className="bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Ticket className="w-6 h-6 text-red-500" />
                Select Theater, Date & Showtime
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Live availability synced directly from QuickShow backend.
              </p>
            </div>
          </div>

          {shows.length === 0 ? (
            <div className="text-center py-10 bg-black/40 rounded-xl border border-white/5">
              <p className="text-gray-300 font-medium mb-2">
                No cinema shows are currently scheduled for &ldquo;{movie.title}&rdquo;.
              </p>
              <p className="text-gray-500 text-sm mb-5">
                Admins can schedule this TMDB movie anytime from the Admin Dashboard, or browse active theaters below.
              </p>
              <button
                onClick={() => navigate("/theaters")}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold cursor-pointer"
              >
                Browse Active Theaters & Shows
              </button>
            </div>
          ) : (
            <>
              {/* Theatre Filter */}
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">
                  1. Choose Theater
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTheatreId("ALL");
                      setSelectedShowId("");
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      selectedTheatreId === "ALL"
                        ? "bg-red-600 text-white"
                        : "bg-zinc-900 text-gray-300 hover:bg-zinc-800"
                    }`}
                  >
                    All Theaters ({theatres.length})
                  </button>
                  {theatres.map((th) => (
                    <button
                      key={th._id}
                      type="button"
                      onClick={() => {
                        setSelectedTheatreId(th._id);
                        setSelectedShowId("");
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        selectedTheatreId === th._id
                          ? "bg-red-600 text-white"
                          : "bg-zinc-900 text-gray-300 hover:bg-zinc-800"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {th.name} ({th.city})
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">
                  2. Choose Date
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {availableDates.map((dateStr) => {
                    const d = new Date(`${dateStr}T00:00:00`);
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedShowId("");
                        }}
                        className={`flex flex-col items-center px-5 py-3.5 rounded-xl min-w-[84px] transition-all cursor-pointer ${
                          selectedDate === dateStr
                            ? "bg-red-600 text-white"
                            : "bg-zinc-900 text-gray-400 hover:bg-zinc-800"
                        }`}
                      >
                        <Calendar className="w-4 h-4 mb-1.5" />
                        <span className="text-xs uppercase font-bold">
                          {d.toLocaleDateString("en-IN", { weekday: "short" })}
                        </span>
                        <span className="text-base font-bold">
                          {d.getDate()}{" "}
                          {d.toLocaleDateString("en-IN", { month: "short" })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Showtime Selection */}
              <div className="mb-8">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">
                  3. Choose Showtime
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {showsForSelectedDate.map((show) => {
                    const dt = new Date(show.showDateTime);
                    const isSelected = selectedShowId === show._id;
                    const minPrice = Math.min(
                      ...(show.seatCategories?.map((c) => c.price) || [show.showPrice || 200])
                    );
                    return (
                      <button
                        key={show._id}
                        type="button"
                        onClick={() => setSelectedShowId(show._id)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-red-600/20 border-red-600 text-white"
                            : "bg-zinc-900 border-white/10 text-gray-300 hover:border-red-500/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-white">
                            {dt.toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                          <span className="text-xs font-semibold text-emerald-400">
                            from {formatCurrency(minPrice)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1 font-medium truncate">
                          {show.theatreSnapshot?.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {show.screenName} • {show.theatreSnapshot?.city}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookTickets}
                disabled={!selectedShowId}
                className={`w-full md:w-auto px-12 py-4 rounded-xl font-bold text-base transition-all ${
                  selectedShowId
                    ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-[0_0_25px_rgba(220,38,38,0.4)]"
                    : "bg-zinc-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                {selectedShowId ? "Proceed to Seat Selection" : "Select a Showtime Above"}
              </button>
            </>
          )}
        </section>

        {/* Cast & Crew */}
        {(movie.cast?.length > 0 || movie.crew?.length > 0) && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-red-500" />
              Cast & Crew
            </h2>

            {movie.crew?.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {movie.crew.slice(0, 5).map((member, idx) => (
                  <div
                    key={`${member.id}-${idx}`}
                    className="px-4 py-2 bg-zinc-950 border border-white/10 rounded-lg text-sm"
                  >
                    <span className="text-gray-400 text-xs block">{member.job}</span>
                    <span className="text-white font-semibold">{member.name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 overflow-x-auto pb-4">
              {movie.cast?.map((actor) => (
                <div
                  key={actor.id}
                  className="w-32 shrink-0 text-center bg-zinc-950 border border-white/10 rounded-xl p-3"
                >
                  {actor.profile_path ? (
                    <img
                      src={actor.profile_path}
                      alt={actor.name}
                      loading="lazy"
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-2.5 border border-white/15"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-zinc-800 mx-auto mb-2.5 flex items-center justify-center text-gray-400 font-bold">
                      {actor.name?.charAt(0)}
                    </div>
                  )}
                  <p className="text-xs font-semibold text-white truncate">{actor.name}</p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    {actor.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Movies from TMDB */}
        {movie.similar?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Similar Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {movie.similar.slice(0, 5).map((simMovie) => (
                <MovieCard key={simMovie.id} movie={simMovie} />
              ))}
            </div>
          </section>
        )}
      </div>

      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailer={movie.trailer}
        title={`${movie.title} — Official Trailer`}
      />
    </div>
  );
};

export default MovieDetails;
