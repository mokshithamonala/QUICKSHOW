import React, { useState } from "react";
import HeroSection from "../components/Herosection";
import FeaturesSection from "../components/FeauturesSection";
import TrailersSection from "../components/TrailersSection";
import { dummyTrailers, dummyShowsData } from "../assets/assets";

const Home = () => {

  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);

  return (
    <div className="bg-black min-h-screen text-white">

      <HeroSection />

      <FeaturesSection movies={dummyShowsData} />

      <div className="container mx-auto px-4 py-12">
        <TrailersSection
          currentTrailer={currentTrailer}
          setCurrentTrailer={setCurrentTrailer}
        />
      </div>

    </div>
  );
};

export default Home;