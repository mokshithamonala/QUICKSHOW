import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import { Heart, Search, Trash2 } from "lucide-react";
import { useAuthUser, useAuthSession, AuthSignInButton } from "../lib/auth";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const Favourite = () => {
  const { user, isLoaded } = useAuthUser();
  const { getToken } = useAuthSession();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    apiRequest("/api/users/favorites", { getToken })
      .then((res) => {
        if (active) setFavorites(res.favorites || []);
      })
      .catch(() => {
        if (active) setFavorites([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, isLoaded, getToken]);

  if (!isLoaded || (user && loading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center pt-20 px-6">
        <div className="text-center max-w-md">
          <Heart className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Sign In to View Favorites</h1>
          <p className="text-gray-400 mb-8">
            Sign in with your Clerk account to save your favorite TMDB movies and access them anytime.
          </p>
          <AuthSignInButton mode="modal">
            <button className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors cursor-pointer">
              Sign In
            </button>
          </AuthSignInButton>
        </div>
      </div>
    );
  }

  const filteredFavorites = favorites.filter((movie) =>
    movie.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeFavorite = async (movie, e) => {
    e.stopPropagation();
    try {
      const res = await apiRequest("/api/users/favorites/toggle", {
        method: "POST",
        getToken,
        body: { movie },
      });
      setFavorites(res.favorites || []);
      toast.success(`Removed "${movie.title}" from Favorites`);
    } catch (err) {
      toast.error(err.message || "Could not remove favorite");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6 md:px-16 lg:px-36 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">My Favorites</h1>
            <p className="text-gray-400 mt-2">
              {favorites.length} movie{favorites.length === 1 ? "" : "s"} saved to your account
            </p>
          </div>

          {favorites.length > 0 && (
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFavorites.map((movie) => (
              <div key={movie.tmdbId || movie.id} className="relative group">
                <MovieCard movie={movie} />
                <button
                  type="button"
                  onClick={(e) => removeFavorite(movie, e)}
                  title="Remove from favorites"
                  className="absolute top-2 left-2 z-20 p-2 bg-black/80 rounded-full opacity-90 hover:bg-red-600 text-white transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">No Favorites Yet</h2>
            <p className="text-gray-400 mb-8">
              Open any movie and click the heart icon to save it here.
            </p>
            <Link
              to="/movies"
              className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No movies found matching &ldquo;{searchTerm}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favourite;
