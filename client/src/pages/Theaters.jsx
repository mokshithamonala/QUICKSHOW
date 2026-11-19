import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Film, Clock, Sparkles, Building2 } from "lucide-react";
import { apiRequest, formatCurrency } from "../lib/api";
import Loading from "../components/Loading";

const Theaters = () => {
  const navigate = useNavigate();
  const [theaters, setTheaters] = useState([]);
  const [cities, setCities] = useState(["All"]);
  const [selectedCity, setSelectedCity] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadTheaters = async () => {
      setLoading(true);
      try {
        const qs = selectedCity !== "All" ? `?city=${encodeURIComponent(selectedCity)}` : "";
        const res = await apiRequest(`/api/theaters${qs}`);
        if (!active) return;
        setTheaters(res.theaters || []);
        setCities(res.cities || ["All"]);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadTheaters();
    return () => {
      active = false;
    };
  }, [selectedCity]);

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6 md:px-16 lg:px-36 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-red-500 text-xs font-bold uppercase tracking-[0.25em] mb-2">
            QuickShow Partner Cinemas
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">Theaters & Showtimes</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Pick a cinema, screen, and showtime to book seats immediately.
          </p>
        </div>

        {/* City Filter */}
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                selectedCity === city
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900 text-gray-400 hover:text-white"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : theaters.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No active theaters found for this city yet.
        </div>
      ) : (
        <div className="space-y-8">
          {theaters.map((theatre) => (
            <div
              key={theatre._id}
              className="bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-red-500" />
                    <h2 className="text-2xl font-bold text-white">{theatre.name}</h2>
                  </div>
                  <p className="flex items-center gap-2 text-sm text-gray-400 mt-1.5">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span>
                      {theatre.address} ({theatre.city})
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(theatre.amenities || []).map((am) => (
                      <span
                        key={am}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/10 text-xs text-gray-300"
                      >
                        <Sparkles className="w-3 h-3 text-red-500" />
                        {am}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <span className="px-3 py-1 rounded-full bg-red-600/15 border border-red-600/30 text-red-400 text-xs font-semibold">
                    {theatre.screens?.length || 1} Screen(s) • {theatre.activeShowCount} Active Shows
                  </span>
                </div>
              </div>

              {/* Upcoming Shows inside this Theatre */}
              <div className="pt-6">
                {theatre.upcomingShows && theatre.upcomingShows.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {theatre.upcomingShows.map((show) => {
                      const dt = new Date(show.showDateTime);
                      const occupiedCount = Object.keys(show.occupiedSeats || {}).length;
                      const totalSeats = (show.rows?.length || 8) * (show.seatsPerRow || 12);
                      const available = Math.max(0, totalSeats - occupiedCount);

                      return (
                        <div
                          key={show._id}
                          onClick={() => navigate(`/seat-layout/${show._id}`)}
                          className="flex gap-3.5 p-3.5 rounded-xl bg-zinc-900/70 border border-white/10 hover:border-red-600 cursor-pointer transition-all group"
                        >
                          {show.movie?.poster_path ? (
                            <img
                              src={show.movie.poster_path}
                              alt={show.movie.title}
                              className="w-16 h-24 object-cover rounded-lg shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-24 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                              <Film className="w-5 h-5 text-gray-500" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h3 className="text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                                {show.movie?.title}
                              </h3>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {show.screenName}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-gray-200 font-medium">
                                <Clock className="w-3.5 h-3.5 text-red-500" />
                                <span>
                                  {dt.toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })}{" "}
                                  •{" "}
                                  {dt.toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-emerald-400">
                                  {available} seats left
                                </span>
                                <span className="font-bold text-white">
                                  from {formatCurrency(show.seatCategories?.[0]?.price || show.showPrice)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No shows scheduled at this theater yet.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Theaters;
