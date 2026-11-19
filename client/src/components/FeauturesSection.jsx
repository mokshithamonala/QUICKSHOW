import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MovieCard from "./MovieCard";

const FeaturesSection = ({
  title = "Now Showing",
  subtitle = "",
  movies = [],
  loading = false,
  viewAllPath = "/movies",
  viewAllLabel = "View All",
  limit = 5,
}) => {
  const navigate = useNavigate();

  return (
    <section className="px-6 md:px-16 lg:px-24 xl:px-36 bg-black py-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-white text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>

        <button
          onClick={() => {
            window.scrollTo(0, 0);
            navigate(viewAllPath);
          }}
          className="flex items-center gap-2 text-gray-300 hover:text-red-500 text-sm font-medium transition-colors cursor-pointer"
        >
          {viewAllLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: limit }).map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <div className="aspect-[2/3] rounded-lg bg-zinc-900" />
              <div className="h-4 bg-zinc-900 rounded mt-3 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : movies && movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.slice(0, limit).map((movie) => (
            <MovieCard key={movie.id || movie._id} movie={movie} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm py-8">No movies available right now.</p>
      )}
    </section>
  );
};

export default FeaturesSection;