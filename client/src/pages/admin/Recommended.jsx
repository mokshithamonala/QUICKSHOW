import React from "react";
import { dummyShowsData } from "../../assets/assets";
import MovieCard from "./MovieCard";

const RecommendedMovies = ({ currentMovie }) => {

  const recommended = dummyShowsData.filter(
    (movie) =>
      movie._id !== currentMovie._id &&
      movie.genres?.some(g =>
        currentMovie.genres?.some(cg => cg.name === g.name)
      )
  ).slice(0, 4);

  return (
    <div className="mt-16">

      <h2 className="text-2xl font-semibold mb-6">
        Recommended Movies
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {recommended.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}

      </div>

    </div>
  );
};

export default RecommendedMovies;
