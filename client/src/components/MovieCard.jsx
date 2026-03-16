import React from "react";
import { Star, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  if (!movie) return null;

  return (
    <div
      onClick={() => navigate(`/movies/${movie.id}`)}
      className="relative group cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        <img
          src={movie.poster_path}
          alt={movie.title}
          className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <button className="w-full py-2 bg-red-600 text-white text-sm font-bold rounded-md uppercase tracking-wider">
            Book Now
          </button>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-md">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white text-xs font-bold">
            {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
          </span>
        </div>
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
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

