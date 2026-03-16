import React, { useState } from 'react'
import { dummyShowsData } from '../assets/assets'
import MovieCard from '../components/MovieCard'
import { Heart, Search } from 'lucide-react'
import { useUser, SignInButton } from '@clerk/react'
import { Link } from 'react-router-dom'

const Favourite = () => {
  const { user, isLoaded } = useUser()
  const [favorites, setFavorites] = useState(dummyShowsData.slice(0, 3)) // Demo favorites
  const [searchTerm, setSearchTerm] = useState('')

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center pt-20 px-6">
        <div className="text-center max-w-md">
          <Heart className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Sign In to View Favorites</h1>
          <p className="text-gray-400 mb-8">
            Please sign in to save your favorite movies and access them from any device.
          </p>
          <SignInButton mode="modal">
            <button className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    )
  }

  const filteredFavorites = favorites.filter(movie =>
    movie.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const removeFavorite = (movieId) => {
    setFavorites(prev => prev.filter(m => m._id !== movieId))
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-16 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">My Favorites</h1>
            <p className="text-gray-400 mt-2">{favorites.length} movies saved</p>
          </div>

          {/* Search */}
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
              <div key={movie._id} className="relative group">
                <MovieCard movie={movie} />
                {/* Remove Button */}
                <button
                  onClick={() => removeFavorite(movie._id)}
                  className="absolute top-2 right-2 p-2 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </button>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">No Favorites Yet</h2>
            <p className="text-gray-400 mb-8">
              Start adding movies to your favorites to see them here!
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
            <p className="text-gray-500 text-lg">No movies found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Favourite

