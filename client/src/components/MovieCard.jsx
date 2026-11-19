import React from "react";
import { Star, Calendar, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  if (!movie) return null;

  const movieId = movie.id || movie.tmdbId || movie._id;

  return (
    <div
      onClick={() => {
        window.scrollTo(0, 0);
        navigate(`/movies/${movieId}`);
      }}
      className="relative group cursor-pointer transform transition-all duration-300 hover:-translate-y-2 w-full"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-lg shadow-lg bg-zinc-900 aspect-[2/3]">
        {movie.poster_path ? (
          <img
            src={movie.poster_path}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-gray-500 bg-zinc-900">
            <Film className="w-10 h-10 mb-2 text-zinc-700" />
            <span className="text-xs font-medium text-gray-400 line-clamp-2">
              {movie.title}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <button className="w-full py-2 bg-red-600 text-white text-xs sm:text-sm font-bold rounded-md uppercase tracking-wider">
            View & Book
          </button>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/75 px-2 py-1 rounded-md backdrop-blur-sm">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white text-xs font-bold">
            {movie.vote_average ? Number(movie.vote_average).toFixed(1) : "N/A"}
          </span>
        </div>

        {/* Language Tag */}
        {movie.original_language && (
          <div className="absolute top-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-gray-200 backdrop-blur-sm">
            {movie.original_language}
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="mt-3 text-center">
        <h3 className="text-white text-sm font-semibold truncate group-hover:text-red-500 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-gray-400 text-xs">
            {movie.release_date ? movie.release_date.split("-")[0] : "TBA"}
          </span>
          {movie.genres?.[0]?.name && (
            <span className="text-gray-500 text-xs">• {movie.genres[0].name}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
