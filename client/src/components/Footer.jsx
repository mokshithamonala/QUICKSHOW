import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets.js";

const Footer = () => {
  return (
    <footer className="bg-black/80 border-t border-white/10 py-12 px-6 md:px-16 lg:px-36">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-300">
        <div className="flex flex-col gap-4">
          <img src={assets.logo} alt="QuickShow Logo" className="w-32 h-auto" />
          <p className="text-sm leading-relaxed">
            Your premier BoB Multiverse destination for live movie discovery and cinema ticket booking.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wide">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/movies" className="hover:text-white transition-colors">
                Movies
              </Link>
            </li>
            <li>
              <Link to="/mahesh-babu" className="hover:text-red-400 transition-colors">
                Mahesh Babu Universe
              </Link>
            </li>
            <li>
              <Link to="/theaters" className="hover:text-white transition-colors">
                Theaters
              </Link>
            </li>
            <li>
              <Link to="/mybookings" className="hover:text-white transition-colors">
                My Bookings
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wide">Download App</h4>
          <div className="flex flex-col gap-3">
            <img
              src={assets.appStore}
              alt="App Store"
              className="w-40 h-auto hover:opacity-80 transition-opacity"
            />
            <img
              src={assets.googlePlay}
              alt="Google Play"
              className="w-40 h-auto hover:opacity-80 transition-opacity"
            />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} QuickShow • BoB Multiverse. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
