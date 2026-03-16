import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MovieCard from "./MovieCard";
import { dummyShowsData } from "../assets/assets";

const FeaturesSection = ({ movies }) => {

  const navigate = useNavigate();

  const displayData =
    movies && movies.length > 0 ? movies : dummyShowsData;

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 bg-black min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center pt-20 pb-10">

        <h2 className="text-white text-xl font-semibold">
          Now Showing
        </h2>

        <button
          onClick={() => navigate("/movies")}
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>

      {/* Movies */}
      <div className="flex flex-wrap gap-8 justify-center">

        {displayData && displayData.length > 0 ? (
          displayData.slice(0, 4).map((movie) => (
            <MovieCard
              key={movie._id || movie.id}
              movie={movie}
            />
          ))
        ) : (
          <p className="text-gray-400">No movies available</p>
        )}

      </div>

      {/* Show More */}
      <div className="flex justify-center mt-16 pb-16">

        <button
          onClick={() => {
            navigate("/movies");
            window.scrollTo(0, 0);
          }}
          className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          Show More
        </button>

      </div>

    </div>
  );
};

export default FeaturesSection;