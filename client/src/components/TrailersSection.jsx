import React, { useState, useEffect } from "react";
import { PlayCircle } from "lucide-react";
import { dummyTrailers } from "../assets/assets";

const TrailersSection = ({ trailers }) => {
  const list = trailers && trailers.length > 0 ? trailers : dummyTrailers;
  const [currentTrailer, setCurrentTrailer] = useState(list[0] || null);

  useEffect(() => {
    if (list.length > 0) {
      setCurrentTrailer(list[0]);
    }
  }, [trailers]);

  if (!currentTrailer) {
    return <div className="text-center text-gray-400 py-8">Loading trailers...</div>;
  }

  return (
    <section className="flex flex-col items-center px-6 md:px-16 lg:px-36 py-12">
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Featured Trailers</h2>
          <p className="text-gray-400 text-sm mt-1">
            Now Playing: <span className="text-red-400 font-medium">{currentTrailer.title}</span>
          </p>
        </div>
      </div>

      {/* Video Player */}
      <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-black shadow-2xl">
        <iframe
          key={currentTrailer.videoUrl}
          className="w-full h-full"
          src={`${currentTrailer.videoUrl}?mute=1`}
          title={currentTrailer.title || "YouTube video player"}
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 w-full max-w-4xl">
        {list.slice(0, 4).map((trailer) => {
          const isActive = trailer.videoUrl === currentTrailer.videoUrl;
          return (
            <button
              type="button"
              key={trailer.videoUrl || trailer.image}
              onClick={() => setCurrentTrailer(trailer)}
              className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all duration-300 text-left ${
                isActive
                  ? "border-red-600 scale-[1.02]"
                  : "border-transparent hover:border-white/30"
              }`}
            >
              <img
                src={trailer.image}
                className="w-full aspect-video object-cover brightness-75 group-hover:brightness-95 transition-all"
                alt={trailer.title || "trailer"}
              />
              <PlayCircle className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-lg" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent px-2.5 py-1.5">
                <p className="text-xs text-white font-medium truncate">
                  {trailer.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default TrailersSection;