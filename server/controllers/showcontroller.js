import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// 1. API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
      headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
    });

    res.json({ success: true, movies: data.results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. API to add a new show to the database
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    // Check if the movie exists in our database
    let movie = await Movie.findById(movieId);

    if (!movie) {
      // Fetch movie details and credits from TMDB API
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
        })
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      };

      movie = await Movie.create(movieDetails);
    }

    // Process showsInput to create multiple show documents
    const showsToCreate = [];
    
    showsInput.forEach(show => {
      const showDate = show.date; // Format expected: YYYY-MM-DD
      show.time.forEach((time) => {
        // Construct a valid ISO string: YYYY-MM-DDThh:mm:ss
        const dateTimeString = `${showDate}T${time}:00`; 
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice: showPrice,
          occupiedSeats: {}
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
      res.json({ success: true, message: `${showsToCreate.length} shows added successfully` });
    } else {
      res.status(400).json({ success: false, message: "No show times provided" });
    }

  } catch (error) {
    console.error("Error in addShow:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};