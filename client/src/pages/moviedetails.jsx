import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dummyShowsData, dummyDateTimeData } from '../assets/assets'
import { Play, Star, Clock, Calendar, ArrowLeft, Heart } from 'lucide-react'
import MovieCard from '../components/MovieCard'

const MovieDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [recommendedMovies, setRecommendedMovies] = useState([])

  useEffect(() => {
    const foundMovie = dummyShowsData.find(
      m => m._id === id || m.id === parseInt(id)
    )

    setMovie(foundMovie)

    if (foundMovie) {
      const similarMovies = dummyShowsData.filter(m =>
        m._id !== foundMovie._id &&
        m.genres?.some(g =>
          foundMovie.genres?.some(fg => fg.name === g.name)
        )
      )

      setRecommendedMovies(similarMovies.slice(0, 5))
    }

    if (dummyDateTimeData) {
      const dates = Object.keys(dummyDateTimeData)
      if (dates.length > 0) {
        setSelectedDate(dates[0])
      }
    }

  }, [id])

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const dates = dummyDateTimeData ? Object.keys(dummyDateTimeData) : []
  const times = selectedDate && dummyDateTimeData ? dummyDateTimeData[selectedDate] : []

  const handleBookTickets = () => {
    if (selectedDate && selectedTime) {
      navigate(`/movies/${id}/${selectedDate}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-24 left-6 md:left-16 z-40 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Hero Section */}
      <div className="relative h-[70vh]">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.backdrop_path})` }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 lg:px-36 pb-10">
          <div className="flex flex-col md:flex-row gap-8 items-end">

            <div className="w-48 md:w-56 shrink-0">
              <img
                src={movie.poster_path}
                alt={movie.title}
                className="w-full rounded-lg shadow-2xl"
              />
            </div>

            <div className="flex-1">

              <div className="flex items-center gap-4 mb-3">
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  {movie.vote_average?.toFixed(1)}
                </span>

                <span className="text-gray-400">|</span>

                <span className="flex items-center gap-1 text-gray-300">
                  <Clock className="w-4 h-4" />
                  {movie.runtime} min
                </span>

                <span className="text-gray-400">|</span>

                <span className="text-gray-300">
                  {movie.release_date?.split('-')[0]}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {movie.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-4 py-1 bg-red-600/20 text-red-500 border border-red-600/30 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 text-lg max-w-2xl mb-6">
                {movie.overview}
              </p>

              <div className="flex gap-4">

                <button className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors">
                  <Play className="w-5 h-5" />
                  Watch Trailer
                </button>

                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3 rounded-lg border transition-colors ${
                    isFavorite
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-red-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>

              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Showtimes */}
      <div className="px-6 md:px-16 lg:px-36 py-12">

        <h2 className="text-2xl font-bold mb-6">Select Show</h2>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => {
                setSelectedDate(date)
                setSelectedTime('')
              }}
              className={`flex flex-col items-center px-6 py-4 rounded-lg min-w-[80px] transition-all ${
                selectedDate === date
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
              }`}
            >
              <Calendar className="w-5 h-5 mb-2" />
              <span className="font-bold">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-sm">{new Date(date).getDate()}</span>
            </button>
          ))}
        </div>

        {times.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            {times.map((show) => (
              <button
                key={show.showId}
                onClick={() => setSelectedTime(show.time)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedTime === show.time
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {new Date(show.time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleBookTickets}
          disabled={!selectedDate || !selectedTime}
          className={`w-full md:w-auto px-12 py-4 rounded-lg font-bold text-lg transition-all ${
            selectedDate && selectedTime
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-zinc-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedDate && selectedTime ? 'Book Tickets' : 'Select Date & Time'}
        </button>

        {/* Recommended Movies */}
        {recommendedMovies.length > 0 && (
          <div className="mt-20">

            <h2 className="text-2xl font-bold mb-6">
              Recommended Movies
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

              {recommendedMovies.map((recMovie) => (
                <MovieCard
                  key={recMovie._id || recMovie.id}
                  movie={recMovie}
                />
              ))}

            </div>

          </div>
        )}

      </div>

    </div>
  )
}

export default MovieDetails
