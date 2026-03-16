import React from "react";
import { ArrowRight, Sparkles, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Keeping your requested import path
import backgroundImage from "../assets/backgroundImage.png"; 

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative flex flex-col items-start justify-center gap-6 px-6 md:px-16 lg:px-36 h-screen text-white pt-20 overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center"
      }}
    >
      {/* Cinematic Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-0"></div>

      <div className="relative z-10 flex flex-col gap-6 animate-in fade-in slide-in-from-left-10 duration-1000">
        
        {/* Grand Studio Branding */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">
            BoB Multiverse
          </h2>
          <div className="h-1 w-24 bg-red-600 shadow-[0_0_10px_#ff0000]"></div>
        </div>

        {/* Movie Title & Tagline */}
        <h1 className="text-7xl md:text-[100px] leading-tight md:leading-[0.8] font-black uppercase italic tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,1)]">
          Varanasi
          <span className="block text-xl md:text-2xl font-light tracking-[0.2em] mt-4 normal-case text-gray-300">
             – where spirituality meets eternity.”
          </span>
        </h1>

        {/* Movie Metadata */}
        <div className="flex flex-wrap items-center gap-6 text-gray-200 font-bold text-sm tracking-widest uppercase">
          <span className="bg-red-600/20 px-3 py-1 rounded border border-red-600/50">
            Action | Adventure | Mythology
          </span>

          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4 text-red-500" /> Kashi - Releasing 2028
          </div>
        </div>

        {/* Story Description */}
        <p className="max-w-2xl text-gray-200 text-lg md:text-xl leading-relaxed font-medium drop-shadow-lg">
          Varanasi is a Telugu movie inspired by adventure and mythological elements. 
          It follows the journey of a hero as he seeks to solve a mysterious problem connected with history and culture. 
        </p>

        {/* Action Button */}
        <div className="flex items-center gap-6 mt-4">
          <button
            onClick={() => navigate("/movies")}
            className="group flex items-center gap-3 px-12 py-4 bg-red-600 text-white hover:bg-white hover:text-black transition-all duration-500 rounded-sm font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(220,38,38,0.5)]"
          >
            Explore the Saga
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>

          <span className="hidden md:block text-[10px] text-gray-400 uppercase tracking-[0.4em] font-bold">
            Advanced Filmmaking Technology
          </span>
        </div>
      </div>

      {/* Bottom Cinematic Fade */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
    </div>
  );
};

export default HeroSection;