import React, { useEffect } from "react";
import { X, Film } from "lucide-react";

const TrailerModal = ({ isOpen, onClose, trailer, title }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const embedUrl = trailer?.embedUrl || trailer?.videoUrl || "";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-zinc-950 border border-white/15 rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <Film className="w-5 h-5 text-red-500 shrink-0" />
            <h3 className="text-white font-semibold truncate">
              {title || trailer?.name || "Official Trailer"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close trailer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="aspect-video bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              className="w-full h-full"
              src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
              title={title || "Movie Trailer"}
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-8 text-gray-400">
              <p className="text-lg font-medium text-white mb-2">
                No YouTube trailer available on TMDB
              </p>
              <p className="text-sm">
                This movie currently does not have an official trailer linked on TMDB.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
