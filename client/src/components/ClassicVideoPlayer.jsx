import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  X,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { apiRequest } from "../lib/api";

const formatClock = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const ClassicVideoPlayer = ({ classic, onClose }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const [verifying, setVerifying] = useState(true);
  const [streamData, setStreamData] = useState(null);
  const [authError, setAuthError] = useState("");
  const [playbackError, setPlaybackError] = useState("");
  const [buffering, setBuffering] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const verifyStream = useCallback(async () => {
    if (!classic?.tmdbId) return;
    setVerifying(true);
    setAuthError("");
    setPlaybackError("");
    setStreamData(null);

    try {
      const res = await apiRequest(`/api/classics/${classic.tmdbId}/stream`);
      if (!res?.authorized || !res?.stream?.streamUrl) {
        setAuthError(
          res?.message || "Streaming rights could not be verified for this title."
        );
        return;
      }
      setStreamData(res.stream);
    } catch (err) {
      setAuthError(
        err.message || "Streaming permission verification failed on the server."
      );
    } finally {
      setVerifying(false);
    }
  }, [classic?.tmdbId]);

  useEffect(() => {
    verifyStream();
  }, [verifyStream]);

  // Keep fullscreen state synced with browser events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch((err) => {
        setPlaybackError(
          err?.message || "Browser blocked playback. Click Play again to start."
        );
      });
    } else {
      video.pause();
    }
  }, []);

  const seekBy = useCallback((delta) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const next = Math.max(0, Math.min(video.duration, video.currentTime + delta));
    video.currentTime = next;
    setCurrentTime(next);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, [isMuted]);

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const handleSeek = (e) => {
    const val = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
    setCurrentTime(val);
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = useCallback(async () => {
    const target = containerRef.current;
    if (!target) return;
    try {
      if (!document.fullscreenElement) {
        await target.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback for mobile Safari video fullscreen
      if (videoRef.current?.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen();
      }
    }
  }, []);

  // Keyboard shortcuts for cinema ergonomics
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        onClose();
        return;
      }
      if (!streamData || ["INPUT", "SELECT", "TEXTAREA"].includes(e.target?.tagName)) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        seekBy(10);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        seekBy(-10);
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMute();
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [streamData, onClose, togglePlay, seekBy, toggleMute, toggleFullscreen]);

  const handleRetryVideo = () => {
    setPlaybackError("");
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    } else {
      verifyStream();
    }
  };

  if (!classic) return null;

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const bufferedPct = duration > 0 ? Math.min(100, (bufferedEnd / duration) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-zinc-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Player Top Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10 bg-black/70">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold uppercase tracking-[0.2em]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Verified Legal Public-Domain Stream</span>
            </div>
            <h2 className="text-white font-bold text-lg sm:text-xl truncate mt-0.5">
              {classic.title}{" "}
              <span className="text-gray-400 font-normal text-sm">
                ({classic.releaseYear} · {classic.languageLabel})
              </span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close classic movie player"
            className="p-2 rounded-full bg-zinc-900 hover:bg-red-600 text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport */}
        <div
          ref={containerRef}
          className="relative bg-black aspect-video w-full flex flex-col justify-center overflow-hidden select-none"
        >
          {verifying && (
            <div className="flex flex-col items-center justify-center gap-3 text-gray-300 p-8 text-center">
              <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
              <p className="text-sm font-medium text-white">
                Verifying legal streaming rights with QuickShow server...
              </p>
              <p className="text-xs text-gray-400">
                Checking public-domain license, region clearance, and authorized archive source
              </p>
            </div>
          )}

          {!verifying && authError && (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center max-w-lg mx-auto">
              <div className="p-3.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-white font-bold text-lg">
                Playback Not Authorized
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">{authError}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-semibold cursor-pointer"
              >
                Return to Watch Free Classics
              </button>
            </div>
          )}

          {!verifying && streamData && (
            <>
              <video
                ref={videoRef}
                src={streamData.streamUrl}
                poster={streamData.backdropPath || streamData.posterPath}
                playsInline
                preload="metadata"
                onClick={togglePlay}
                onPlay={() => {
                  setIsPlaying(true);
                  setPlaybackError("");
                }}
                onPause={() => setIsPlaying(false)}
                onWaiting={() => setBuffering(true)}
                onPlaying={() => setBuffering(false)}
                onCanPlay={() => setBuffering(false)}
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  v.volume = volume;
                  v.muted = isMuted;
                  setDuration(v.duration || 0);
                }}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  setCurrentTime(v.currentTime || 0);
                  if (v.buffered.length > 0) {
                    setBufferedEnd(v.buffered.end(v.buffered.length - 1));
                  }
                }}
                onError={() => {
                  setBuffering(false);
                  setIsPlaying(false);
                  setPlaybackError(
                    "Unable to stream the archive video file right now. Internet Archive servers may be busy or your network blocked external media."
                  );
                }}
                className="w-full h-full object-contain bg-black cursor-pointer"
              />

              {/* Center Play Overlay when paused & no error */}
              {!isPlaying && !buffering && !playbackError && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Play full movie"
                  className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.65)] transition-transform hover:scale-105 cursor-pointer"
                >
                  <Play className="w-9 h-9 fill-white ml-1" />
                </button>
              )}

              {/* Buffering Spinner */}
              {buffering && !playbackError && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35">
                  <Loader2 className="w-11 h-11 text-red-500 animate-spin" />
                </div>
              )}

              {/* Playback Error Overlay */}
              {playbackError && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                  <p className="text-white font-semibold max-w-md">{playbackError}</p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleRetryVideo}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry Stream
                    </button>
                    {streamData.sourcePageUrl && (
                      <a
                        href={streamData.sourcePageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-200 rounded-lg text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Source Archive Page
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Cinema Control Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pt-8 pb-3.5 space-y-2.5">
                {/* Seek Bar */}
                <div className="relative flex items-center group">
                  <div className="w-full h-1.5 bg-zinc-700/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-500 transition-all"
                      style={{ width: `${bufferedPct}%` }}
                    />
                  </div>
                  <div
                    className="pointer-events-none absolute left-0 h-1.5 bg-red-600 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.5}
                    value={currentTime}
                    onChange={handleSeek}
                    aria-label="Seek video position"
                    className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer"
                  />
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={isPlaying ? "Pause" : "Play"}
                      className="p-2 rounded-lg bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => seekBy(-10)}
                      title="Back 10 seconds"
                      className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => seekBy(10)}
                      title="Forward 10 seconds"
                      className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-2 ml-1">
                      <button
                        type="button"
                        onClick={toggleMute}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-red-400" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        aria-label="Volume"
                        className="w-16 sm:w-20 accent-red-600 cursor-pointer"
                      />
                    </div>

                    <span className="text-xs text-gray-300 font-mono ml-1">
                      {formatClock(currentTime)} / {formatClock(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={playbackRate}
                      onChange={(e) => handleRateChange(Number(e.target.value))}
                      aria-label="Playback speed"
                      className="bg-zinc-900/90 border border-white/15 rounded-lg px-2 py-1 text-xs text-gray-200 outline-none cursor-pointer"
                    >
                      <option value={0.75}>0.75x</option>
                      <option value={1}>1x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                    </select>

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                      {isFullscreen ? (
                        <Minimize className="w-4 h-4" />
                      ) : (
                        <Maximize className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Legal Licensing & Attribution Footer */}
        {streamData && (
          <div className="px-5 py-4 bg-zinc-950 border-t border-white/10 text-xs text-gray-400 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-gray-200 font-medium">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  {streamData.licenseName}
                </span>
                <span className="text-gray-500">·</span>
                <span>{streamData.regionAvailability}</span>
              </div>
              <p>{streamData.attribution}</p>
            </div>

            {streamData.sourcePageUrl && (
              <a
                href={streamData.sourcePageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-red-600 text-gray-200 hover:text-white transition-colors"
              >
                <span>{streamData.authorizedSource}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassicVideoPlayer;
