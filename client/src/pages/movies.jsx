import React, { useState, useEffect } from "react";
import { dummyShowsData } from "../assets/assets";
import MovieCard from "../components/MovieCard";
import { Search } from "lucide-react";

const Movies = () => {

  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
    if (dummyShowsData) {
      setMovies(dummyShowsData);
    }
  }, []);

  const genres = [
    "All",
    ...new Set(
      movies.flatMap((movie) =>
        movie.genres?.map((g) => g.name) || []
      )
    ),
  ];

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGenre =
      selectedGenre === "All" ||
      movie.genres?.some((g) => g.name === selectedGenre);

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-16 lg:px-36 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">

        <div>
          <h1 className="text-3xl md:text-4xl font-bold">All Movies</h1>
          <p className="text-gray-400 mt-2">
            Discover the latest blockbusters
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-12 pr-4 text-white"
          />
        </div>

      </div>

      {/* Genres */}
      <div className="flex flex-wrap gap-3 mb-10">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-5 py-2 rounded-full ${
              selectedGenre === genre
                ? "bg-red-600 text-white"
                : "bg-zinc-900 text-gray-400"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Movies */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie._id || movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No movies found</p>
      )}

    </div>
  );
};

export default Movies;