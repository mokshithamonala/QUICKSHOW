import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { MenuIcon, SearchIcon, XIcon, Star, Film, ArrowRight } from "lucide-react";
import { AuthSignInButton, AuthUserButton, useAuthSession, useAuthUser } from "../lib/auth";
import { apiRequest } from "../lib/api";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const searchInputRef = useRef(null);
  const { user } = useAuthUser();
  const { getToken } = useAuthSession();
  const navigate = useNavigate();

  // Check backend RBAC admin status whenever user changes (never assume logged-in == admin)
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsAdmin(false);
      return;
    }

    apiRequest("/api/users/me", { getToken })
      .then((res) => {
        if (!cancelled) setIsAdmin(Boolean(res?.user?.isAdmin));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, getToken]);

  // Focus search input when overlay opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [searchOpen]);

  // Debounced live TMDB search
  useEffect(() => {
    if (!searchOpen || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await apiRequest(
          `/api/movies/search?q=${encodeURIComponent(searchQuery.trim())}&page=1`
        );
        setSearchResults((data.results || []).slice(0, 6));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim();
    setSearchOpen(false);
    navigate(`/movies?search=${encodeURIComponent(q)}`);
  };

  return (
    <>
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
          z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-6 md:gap-5 lg:gap-6
          md:px-8 py-3 max-md:h-screen md:rounded-full
          bg-black/90 md:bg-black/50 md:backdrop-blur-md md:border border-white/20
          transition-all duration-500 ease-in-out
          ${open ? "max-md:w-full opacity-100" : "max-md:w-0 opacity-0 md:opacity-100 overflow-hidden"}`}
        >
          {/* Close icon */}
          <XIcon
            className="md:hidden absolute top-8 right-8 w-8 h-8 text-white cursor-pointer"
            onClick={() => setOpen(false)}
          />

          <div className="flex flex-col md:flex-row gap-6 md:gap-5 lg:gap-6 items-center whitespace-nowrap">
            <Link
              to="/"
              onClick={() => {
                window.scrollTo(0, 0);
                setOpen(false);
              }}
              className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-[0.2em]"
            >
              Home
            </Link>

            <Link
              to="/movies"
              onClick={() => {
                window.scrollTo(0, 0);
                setOpen(false);
              }}
              className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-[0.2em]"
            >
              Movies
            </Link>

            <Link
              to="/mahesh-babu"
              onClick={() => {
                window.scrollTo(0, 0);
                setOpen(false);
              }}
              className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-[0.2em]"
            >
              BoB Universe
            </Link>

            <Link
              to="/classics"
              onClick={() => {
                window.scrollTo(0, 0);
                setOpen(false);
              }}
              className="text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-[0.18em]"
            >
              Watch Free Classics
            </Link>

            <Link
              to="/theaters"
              onClick={() => {
                window.scrollTo(0, 0);
                setOpen(false);
              }}
              className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-[0.2em]"
            >
              Theaters
            </Link>

            <Link
              to="/releases"
              onClick={() => {
                window.scrollTo(0, 0);
                setOpen(false);
              }}
              className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-[0.2em]"
            >
              Releases
            </Link>

            <Link
              to="/favourite"
              onClick={() => {
                window.scrollTo(0, 0);
                setOpen(false);
              }}
              className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-[0.2em]"
            >
              Favorites
            </Link>

            {user && (
              <Link
                to="/mybookings"
                onClick={() => {
                  window.scrollTo(0, 0);
                  setOpen(false);
                }}
                className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-[0.2em]"
              >
                Bookings
              </Link>
            )}

            {/* Admin link visible ONLY to backend-verified admins */}
            {user && isAdmin && (
              <Link
                to="/admin"
                onClick={() => {
                  window.scrollTo(0, 0);
                  setOpen(false);
                }}
                className="text-amber-400 hover:text-amber-300 text-xs font-bold uppercase tracking-[0.2em]"
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Search icon */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search movies"
            className="p-2.5 bg-black/70 border border-white/15 rounded-full cursor-pointer group hover:border-red-600 transition-colors"
          >
            <SearchIcon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
          </button>

          {/* Login button if user not logged in */}
          {!user ? (
            <AuthSignInButton mode="modal">
              <button className="px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm text-gray-300 hover:text-white bg-black/50 text-sm cursor-pointer">
                Login
              </button>
            </AuthSignInButton>
          ) : (
            <AuthUserButton afterSignOutUrl="/" />
          )}

          {/* Mobile menu button */}
          <MenuIcon
            className="md:hidden w-7 h-7 text-white cursor-pointer hover:text-red-500"
            onClick={() => setOpen(true)}
          />
        </div>
      </nav>

      {/* Live TMDB Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-zinc-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-3 px-5 py-4 border-b border-white/10"
            >
              <SearchIcon className="w-5 h-5 text-red-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any movie on TMDB (e.g. Pokiri, Athadu, Interstellar)..."
                className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-base"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              {searching && (
                <p className="text-center text-gray-400 py-8 text-sm">
                  Searching TMDB catalogue...
                </p>
              )}

              {!searching && searchQuery.trim() && searchResults.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">
                  No movies matched "{searchQuery}".
                </p>
              )}

              {!searching && searchResults.length > 0 && (
                <div className="space-y-1.5">
                  {searchResults.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        navigate(`/movies/${movie.id}`);
                      }}
                      className="w-full flex items-center gap-4 p-2.5 rounded-xl hover:bg-zinc-900 transition-colors text-left"
                    >
                      {movie.poster_path ? (
                        <img
                          src={movie.poster_path}
                          alt={movie.title}
                          className="w-11 h-16 object-cover rounded shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-16 bg-zinc-800 rounded flex items-center justify-center shrink-0">
                          <Film className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{movie.title}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <span>{movie.release_date?.slice(0, 4) || "TBA"}</span>
                          <span className="uppercase">{movie.original_language}</span>
                          {movie.vote_average > 0 && (
                            <span className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-3 h-3 fill-yellow-400" />
                              {movie.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-500 shrink-0" />
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full mt-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-red-400 hover:text-red-300 border-t border-white/10"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </div>
              )}

              {!searchQuery.trim() && (
                <div className="p-4 flex flex-wrap gap-2 items-center justify-between text-xs text-gray-400">
                  <span>Quick jump:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        navigate("/mahesh-babu");
                      }}
                      className="px-3 py-1.5 bg-red-600/20 border border-red-600/40 text-red-300 rounded-full hover:bg-red-600/30"
                    >
                      Mahesh Babu Universe
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        navigate("/classics");
                      }}
                      className="px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 rounded-full hover:bg-emerald-600/30"
                    >
                      Watch Free Classics
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        navigate("/movies");
                      }}
                      className="px-3 py-1.5 bg-zinc-900 border border-white/10 text-gray-300 rounded-full hover:text-white"
                    >
                      Trending Movies
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        navigate("/theaters");
                      }}
                      className="px-3 py-1.5 bg-zinc-900 border border-white/10 text-gray-300 rounded-full hover:text-white"
                    >
                      Active Theaters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;