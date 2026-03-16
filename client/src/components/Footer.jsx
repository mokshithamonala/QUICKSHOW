import React from 'react'
import { assets } from '../assets/assets.js'

const Footer = () => {
  return (
    <footer className="bg-black/80 border-t border-white/10 py-12 px-6 md:px-16 lg:px-36">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-300">
        <div className="flex flex-col gap-4">
          <img src={assets.logo} alt="Logo" className="w-32 h-auto" />
          <p className="text-sm leading-relaxed">Your premier destination for movies and entertainment.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wide">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="/movies" className="hover:text-white transition-colors">Movies</a></li>
            <li><a href="/mybookings" className="hover:text-white transition-colors">Bookings</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wide">Download App</h4>
          <div className="flex flex-col gap-3">
            <img src={assets.appStore} alt="App Store" className="w-40 h-auto hover:opacity-80 transition-opacity" />
            <img src={assets.googlePlay} alt="Google Play" className="w-40 h-auto hover:opacity-80 transition-opacity" />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs text-gray-400">
        <p>&copy; 2025 QuickShow. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

