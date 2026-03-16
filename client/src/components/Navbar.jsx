import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { MenuIcon, SearchIcon, XIcon } from "lucide-react";
import { SignInButton, UserButton, useUser } from "@clerk/react";

const Navbar = () => {

  const [open, setOpen] = useState(false);

  const { user } = useUser();

  const navigate = useNavigate();

  return (

    <nav className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 bg-gradient-to-b from-black/95 via-black/50 to-transparent">

      {/* Logo */}

      <Link to="/" className="max-md:flex-1 group">

        <img
          src={assets.logo}
          alt="QuickShow Logo"
          className="w-32 md:w-40 h-auto transition-all duration-500 filter drop-shadow-[0_0_8px_rgba(255,0,0,0.6)] group-hover:drop-shadow-[0_0_15px_rgba(255,0,0,0.9)]"
        />

      </Link>

      {/* Navigation */}

      <div
        className={`absolute left-1/2 -translate-x-1/2
        max-md:top-0 max-md:left-0 max-md:translate-x-0
        z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-6 md:gap-10
        md:px-12 py-3 max-md:h-screen md:rounded-full
        bg-black/80 md:bg-black/40 md:border border-white/20
        transition-all duration-500 ease-in-out
        ${open ? "max-md:w-full opacity-100" : "max-md:w-0 opacity-0 md:opacity-100 overflow-hidden"}`}
      >

        {/* Close icon */}

        <XIcon
          className="md:hidden absolute top-8 right-8 w-8 h-8 text-white cursor-pointer"
          onClick={() => setOpen(false)}
        />

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">

          <Link
            to="/"
            onClick={() => { window.scrollTo(0,0); setOpen(false); }}
            className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-[0.25em]"
          >
            Home
          </Link>

          <Link
            to="/movies"
            onClick={() => { window.scrollTo(0,0); setOpen(false); }}
            className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-[0.25em]"
          >
            Movies
          </Link>

          <Link
            to="/theaters"
            onClick={() => { window.scrollTo(0,0); setOpen(false); }}
            className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-[0.25em]"
          >
            Theaters
          </Link>

          <Link
            to="/releases"
            onClick={() => { window.scrollTo(0,0); setOpen(false); }}
            className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-[0.25em]"
          >
            Releases
          </Link>

          <Link
            to="/favourite"
            onClick={() => { window.scrollTo(0,0); setOpen(false); }}
            className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-[0.25em]"
          >
            Favorites
          </Link>

          {/* Admin link visible only if user logged in */}

          {user && (
            <Link
              to="/admin"
              onClick={() => { window.scrollTo(0,0); setOpen(false); }}
              className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-[0.25em]"
            >
              Admin
            </Link>
          )}

        </div>

      </div>

      {/* Right Section */}

      <div className="flex items-center gap-6 md:gap-8">

        {/* Search icon */}

        <div className="p-2 bg-black border border-white/10 rounded-full cursor-pointer group hover:border-red-600">

          <SearchIcon className="max-md:hidden w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />

        </div>

        {/* Login button if user not logged in */}

        {!user ? (

          <SignInButton mode="modal">

            <button className="px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm text-gray-300 hover:text-white bg-black/50">

              Login

            </button>

          </SignInButton>

        ) : (

          <UserButton afterSignOutUrl="/" />

        )}

        {/* Mobile menu button */}

        <MenuIcon
          className="md:hidden w-7 h-7 text-white cursor-pointer hover:text-red-500"
          onClick={() => setOpen(true)}
        />

      </div>

    </nav>

  );

};

export default Navbar;