import React, { useEffect, useState } from "react";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";
import { StarIcon, Check, X, Search } from "lucide-react";
import { kConverter } from "../../lib/kconverter";
import { apiRequest, getCurrencySymbol } from "../../lib/api";
import { useAuthSession } from "../../lib/auth";
import toast from "react-hot-toast";

const AddShows = () => {
  const { getToken } = useAuthSession();
  const currency = getCurrencySymbol();

  const [movies, setMovies] = useState([]);
  const [movieSource, setMovieSource] = useState("now_playing");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMovies, setLoadingMovies] = useState(true);

  const [theaters, setTheaters] = useState([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState("");
  const [selectedScreenName, setSelectedScreenName] = useState("");

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");

  const [silverPrice, setSilverPrice] = useState("180");
  const [goldPrice, setGoldPrice] = useState("250");
  const [reclinerPrice, setReclinerPrice] = useState("400");
  const [submitting, setSubmitting] = useState(false);

  // Load theaters for dropdown
  useEffect(() => {
    apiRequest("/api/admin/theaters", { getToken })
      .then((res) => {
        const list = res.theaters || [];
        setTheaters(list);
        if (list.length > 0) {
          setSelectedTheatreId(list[0]._id);
          const firstScreen = list[0].screens?.[0];
          if (firstScreen) {
            setSelectedScreenName(firstScreen.name);
            const cats = firstScreen.categories || [];
            if (cats[0]) setSilverPrice(String(cats[0].defaultPrice));
            if (cats[1]) setGoldPrice(String(cats[1].defaultPrice));
            if (cats[2]) setReclinerPrice(String(cats[2].defaultPrice));
          }
        }
      })
      .catch(() => {});
  }, [getToken]);

  // Load TMDB movies (Now Playing, Mahesh Babu Universe, or live Search)
  useEffect(() => {
    let active = true;
    const loadMovies = async () => {
      setLoadingMovies(true);
      try {
        let data;
        if (searchQuery.trim()) {
          data = await apiRequest(
            `/api/movies/search?q=${encodeURIComponent(searchQuery.trim())}&page=1`
          );
          if (active) setMovies(data.results || []);
        } else if (movieSource === "mahesh_babu") {
          data = await apiRequest("/api/movies/universe/mahesh-babu");
          if (active) setMovies((data.movies || []).filter((m) => m.poster_path));
        } else {
          data = await apiRequest(`/api/movies/category/${movieSource}?page=1`);
          if (active) setMovies(data.results || []);
        }
      } catch {
        if (active) setMovies([]);
      } finally {
        if (active) setLoadingMovies(false);
      }
    };

    const timer = setTimeout(loadMovies, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [movieSource, searchQuery]);

  const currentTheatre = theaters.find((t) => t._id === selectedTheatreId);

  const handleTheatreChange = (id) => {
    setSelectedTheatreId(id);
    const th = theaters.find((t) => t._id === id);
    const firstScreen = th?.screens?.[0];
    setSelectedScreenName(firstScreen?.name || "");
    if (firstScreen?.categories) {
      if (firstScreen.categories[0]) setSilverPrice(String(firstScreen.categories[0].defaultPrice));
      if (firstScreen.categories[1]) setGoldPrice(String(firstScreen.categories[1].defaultPrice));
      if (firstScreen.categories[2]) setReclinerPrice(String(firstScreen.categories[2].defaultPrice));
    }
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) {
      toast.error("Pick a date and time first.");
      return;
    }
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });
    setDateTimeInput("");
  };

  const removeTime = (date, timeToRemove) => {
    setDateTimeSelection((prev) => {
      const updatedTimes = prev[date].filter((t) => t !== timeToRemove);
      const updatedSelection = { ...prev };
      if (updatedTimes.length === 0) {
        delete updatedSelection[date];
      } else {
        updatedSelection[date] = updatedTimes;
      }
      return updatedSelection;
    });
  };

  const handleAddShow = async () => {
    if (!selectedMovie) {
      toast.error("Please select a TMDB movie.");
      return;
    }
    if (!selectedTheatreId) {
      toast.error("Please select a theater.");
      return;
    }

    const dateTimes = [];
    for (const [date, times] of Object.entries(dateTimeSelection)) {
      for (const time of times) {
        dateTimes.push(new Date(`${date}T${time}`).toISOString());
      }
    }

    if (dateTimes.length === 0) {
      toast.error("Please add at least one show date and time.");
      return;
    }

    setSubmitting(true);
    try {
      const seatCategories = [
        { name: "Silver", rows: ["A", "B", "C"], price: Number(silverPrice) || 180 },
        { name: "Gold", rows: ["D", "E", "F"], price: Number(goldPrice) || 250 },
        { name: "Recliner", rows: ["G", "H"], price: Number(reclinerPrice) || 400 },
      ];

      const res = await apiRequest("/api/admin/shows", {
        method: "POST",
        getToken,
        body: {
          tmdbMovieId: selectedMovie.id,
          movie: selectedMovie,
          theatreId: selectedTheatreId,
          screenName: selectedScreenName,
          showPrice: Number(goldPrice) || 250,
          seatCategories,
          dateTimes,
        },
      });

      toast.success(res.message || "Show(s) scheduled successfully!");
      setDateTimeSelection({});
      setSelectedMovie(null);
    } catch (err) {
      toast.error(err.message || "Could not schedule show");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-20 text-white max-w-6xl">
      <Title text1="Add" text2="Shows" />

      {/* Movie Source & TMDB Search */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "now_playing", label: "Now Playing (TMDB)" },
            { id: "mahesh_babu", label: "Mahesh Babu Universe" },
            { id: "trending", label: "Trending (TMDB)" },
            { id: "upcoming", label: "Upcoming (TMDB)" },
          ].map((src) => (
            <button
              key={src.id}
              type="button"
              onClick={() => {
                setMovieSource(src.id);
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                !searchQuery && movieSource === src.id
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900 text-gray-400 hover:text-white"
              }`}
            >
              {src.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any TMDB movie..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-red-600"
          />
        </div>
      </div>

      {/* TMDB Movie Selector Strip */}
      <p className="mt-6 text-sm text-gray-400">
        1. Select a Movie {selectedMovie && <span className="text-red-400 font-semibold">• Selected: {selectedMovie.title} (TMDB #{selectedMovie.id})</span>}
      </p>

      {loadingMovies ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="group flex flex-nowrap gap-4 mt-3 w-max">
            {movies.slice(0, 18).map((movie) => (
              <div
                key={movie.id}
                onClick={() => setSelectedMovie(movie)}
                className="w-40 sm:w-44 cursor-pointer transition-all duration-300"
              >
                <div
                  className={`relative aspect-[2/3] w-full overflow-hidden rounded-lg border-2 transition-all bg-zinc-900 ${
                    selectedMovie?.id === movie.id
                      ? "border-red-600"
                      : "border-transparent"
                  }`}
                >
                  {movie.poster_path && (
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      className={`w-full h-full object-cover brightness-90 transition-opacity ${
                        selectedMovie && selectedMovie.id !== movie.id
                          ? "opacity-50"
                          : "opacity-100"
                      }`}
                    />
                  )}
                  {selectedMovie?.id === movie.id && (
                    <div className="absolute top-2 right-2 bg-red-600 rounded-sm p-0.5 z-10">
                      <Check className="w-3.5 h-3.5 text-white stroke-[4px]" />
                    </div>
                  )}
                  <div className="text-[10px] sm:text-xs flex items-center justify-between p-2 bg-black/80 w-full absolute bottom-0 left-0">
                    <p className="flex items-center gap-1 text-gray-300">
                      <StarIcon className="w-3 h-3 text-primary fill-primary" />
                      {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                    </p>
                    <p className="text-gray-400">{kConverter(movie.vote_count || 0)}</p>
                  </div>
                </div>
                <div className="mt-2 text-white">
                  <p className="text-sm font-medium truncate w-full">{movie.title}</p>
                  <p className="text-xs text-gray-500">{movie.release_date || "TBA"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theater & Screen Selection */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            2. Select Theater
          </label>
          <select
            value={selectedTheatreId}
            onChange={(e) => handleTheatreChange(e.target.value)}
            className="w-full bg-zinc-900 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-red-600"
          >
            {theaters.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.city})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            3. Select Screen
          </label>
          <select
            value={selectedScreenName}
            onChange={(e) => setSelectedScreenName(e.target.value)}
            className="w-full bg-zinc-900 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-red-600"
          >
            {(currentTheatre?.screens || []).map((scr) => (
              <option key={scr.name} value={scr.name}>
                {scr.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Seat Category Pricing */}
      <div className="mt-8 max-w-3xl">
        <label className="block text-sm font-medium mb-3 text-white">
          4. Configure Seat Categories & Ticket Prices ({currency})
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Silver (Rows A–C)", val: silverPrice, set: setSilverPrice },
            { label: "Gold (Rows D–F)", val: goldPrice, set: setGoldPrice },
            { label: "Recliner (Rows G–H)", val: reclinerPrice, set: setReclinerPrice },
          ].map((tier) => (
            <div
              key={tier.label}
              className="border border-gray-700 rounded-lg p-3 bg-zinc-950"
            >
              <span className="text-xs text-gray-400 block mb-1.5">{tier.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 text-sm">{currency}</span>
                <input
                  type="number"
                  min={50}
                  value={tier.val}
                  onChange={(e) => tier.set(e.target.value)}
                  className="bg-transparent outline-none text-white w-full font-semibold"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Show Dates & Times */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2 text-white">
          5. Add Show Date and Time
        </label>
        <div className="inline-flex flex-wrap gap-3 border border-gray-700 p-1.5 pl-3 rounded-lg bg-zinc-950">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="bg-transparent outline-none text-white rounded-md cursor-pointer [color-scheme:dark]"
          />
          <button
            type="button"
            onClick={handleDateTimeAdd}
            className="bg-red-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Add Time
          </button>
        </div>
      </div>

      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="text-sm font-semibold text-gray-300">Selected Showtimes</p>
          {Object.keys(dateTimeSelection).map((date) => (
            <div key={date}>
              <p className="text-xs font-bold text-gray-400 mb-2">{date}</p>
              <div className="flex flex-wrap gap-2">
                {dateTimeSelection[date].map((time) => (
                  <div
                    key={time}
                    className="flex items-center gap-2 bg-red-600/20 border border-red-600/50 text-white px-3 py-1 rounded-md text-sm"
                  >
                    {time}
                    <X
                      className="w-3.5 h-3.5 cursor-pointer hover:text-red-400"
                      onClick={() => removeTime(date, time)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={submitting}
        onClick={handleAddShow}
        className="mt-10 px-10 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-lg transition-all cursor-pointer"
      >
        {submitting ? "Scheduling Show(s)..." : "Schedule Show(s)"}
      </button>
    </div>
  );
};

export default AddShows;