import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import HeroSection from "../components/Herosection";
import FeaturesSection from "../components/FeauturesSection";
import TrailersSection from "../components/TrailersSection";
import { apiRequest } from "../lib/api";

const Home = () => {
  const navigate = useNavigate();
  const [nowPlaying, setNowPlaying] = useState([]);
  const [trending, setTrending] = useState([]);
  const [maheshMovies, setMaheshMovies] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [npRes, trRes, mbRes, trailerRes] = await Promise.allSettled([
          apiRequest("/api/movies/category/now_playing?page=1"),
          apiRequest("/api/movies/category/trending?page=1"),
          apiRequest("/api/movies/universe/mahesh-babu"),
          apiRequest("/api/movies/trailers"),
        ]);

        if (!active) return;

        if (npRes.status === "fulfilled") {
          setNowPlaying(npRes.value.results || []);
        }
        if (trRes.status === "fulfilled") {
          setTrending(trRes.value.results || []);
        }
        if (mbRes.status === "fulfilled") {
          const withPosters = (mbRes.value.movies || []).filter((m) => m.poster_path);
          // Replace ONLY the 4th card (Acharya, ID 679919) with Athadu (2005, ID 37172)
          // while preserving Vāranāsi, Guntur Kaaram, Sarkaru Vaari Paata, and Sarileru Neekevvaru unchanged
          const athaduReplacement = withPosters.find((m) => Number(m.id) === 37172) || {
            id: 37172,
            _id: "37172",
            title: "Athadu",
            original_title: "అతడు",
            release_date: "2005-08-10",
            original_language: "te",
            vote_average: 7.8,
            genres: [
              { id: 28, name: "Action" },
              { id: 53, name: "Thriller" },
              { id: 10751, name: "Family" },
            ],
            poster_path: "https://image.tmdb.org/t/p/w500/ojZAu2KOemaDEfLnJXZeuU9QQko.jpg",
          };
          const curatedBoBHomeRow = withPosters
            .slice(0, 5)
            .map((m) => (Number(m.id) === 679919 ? athaduReplacement : m));
          setMaheshMovies(curatedBoBHomeRow);
        }
        if (trailerRes.status === "fulfilled") {
          setTrailers(trailerRes.value.trailers || []);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHomeData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-black min-h-screen text-white">
      <HeroSection />

      {/* BoB Multiverse Spotlight Banner */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-36 pt-14">
        <div className="relative overflow-hidden rounded-2xl border border-red-600/30 bg-gradient-to-r from-red-950/40 via-zinc-950 to-black p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-[0.25em] mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Signature Collection</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              Mahesh Babu Movie Universe
            </h2>
            <p className="text-gray-300 text-sm md:text-base mt-1.5 max-w-2xl">
              Explore Superstar Mahesh Babu&apos;s complete dynamically synced TMDB filmography,
              career milestones, ratings, and official trailers in the BoB Multiverse.
            </p>
          </div>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/mahesh-babu");
            }}
            className="shrink-0 flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer"
          >
            Enter Universe
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live BoB Multiverse Preview Row */}
      <FeaturesSection
        title="BoB Multiverse — Mahesh Babu Classics & Hits"
        subtitle="Dynamically powered by TMDB movie credits"
        movies={maheshMovies}
        loading={loading}
        viewAllPath="/mahesh-babu"
        viewAllLabel="Explore Full Filmography"
        limit={5}
      />

      {/* Live Now Playing Row */}
      <FeaturesSection
        title="Now Showing in Cinemas"
        subtitle="Live TMDB Now Playing releases"
        movies={nowPlaying}
        loading={loading}
        viewAllPath="/movies"
        viewAllLabel="View All Movies"
        limit={5}
      />

      {/* Live Trending Row */}
      <FeaturesSection
        title="Trending This Week"
        subtitle="Most talked-about films worldwide"
        movies={trending}
        loading={loading}
        viewAllPath="/movies?tab=trending"
        viewAllLabel="Explore Trending"
        limit={5}
      />

      {/* Live Trailers Section */}
      <div className="pb-16">
        <TrailersSection trailers={trailers} />
      </div>
    </div>
  );
};

export default Home;