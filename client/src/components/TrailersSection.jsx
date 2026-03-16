import React, { useState } from "react";
import { PlayCircle } from "lucide-react";
import { dummyTrailers } from "../assets/assets";

const TrailersSection = () => {

  const [currentTrailer, setCurrentTrailer] = useState(
    dummyTrailers && dummyTrailers.length > 0 ? dummyTrailers[0] : null
  );

  if (!currentTrailer) {
    return <div className="text-center text-gray-400">Loading trailers...</div>;
  }

  return (
    <section className="flex flex-col items-center">

      {/* Video Player */}
      <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-black">

        <iframe
          key={currentTrailer.videoUrl}
          className="w-full h-full"
          src={`${currentTrailer.videoUrl}?autoplay=1&mute=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>

      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4 mt-8 max-w-3xl">

        {dummyTrailers.map((trailer) => (

          <div
            key={trailer.image}
            onClick={() => setCurrentTrailer(trailer)}
            className="relative cursor-pointer hover:scale-105 transition duration-300"
          >

            <img
              src={trailer.image}
              className="rounded-lg brightness-75"
              alt="trailer"
            />

            <PlayCircle className="absolute top-1/2 left-1/2 w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 text-white" />

          </div>

        ))}

      </div>

    </section>
  );
};

export default TrailersSection;