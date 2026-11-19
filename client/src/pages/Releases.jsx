import React, { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "../components/MovieCard";
import { apiRequest } from "../lib/api";

const Releases = () => {
  const [tab, setTab] = useState("upcoming");
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadReleases = async () => {
      setLoading(true);
      try {
        const res = await apiRequest(`/api/movies/category/${tab}?page=${page}`);
        if (!active) return;
        setMovies(res.results || []);
        setTotalPages(Math.min(res.total_pages || 1, 25));
      } finally {
        if (active) setLoading(false);
      }
    };
    loadReleases();
    return () => {
      active = false;
    };
  }, [tab, page]);

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6 md:px-16 lg:px-36 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-[0.25em] mb-2">
            <Calendar className="w-4 h-4" />
            <span>TMDB Release Calendar</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {tab === "upcoming" ? "Upcoming Releases" : "Now Playing in Theaters"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Stay ahead of upcoming cinema premieres and fresh box-office releases.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setTab("upcoming");
              setPage(1);
            }}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
              tab === "upcoming"
                ? "bg-red-600 text-white"
                : "bg-zinc-900 text-gray-400 hover:text-white"
            }`}
          >
            Upcoming Releases
          </button>
          <button
            onClick={() => {
              setTab("now_playing");
              setPage(1);
            }}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
              tab === "now_playing"
                ? "bg-red-600 text-white"
                : "bg-zinc-900 text-gray-400 hover:text-white"
            }`}
          >
            Now Playing
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <div className="aspect-[2/3] bg-zinc-900 rounded-lg" />
              <div className="h-4 bg-zinc-900 rounded mt-3 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-14">
              <button
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-zinc-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-zinc-700 disabled:opacity-40 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Releases;
