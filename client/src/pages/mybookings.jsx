import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Ticket, AlertTriangle } from "lucide-react";
import { useAuthUser, useAuthSession, AuthSignInButton } from "../lib/auth";
import { Link } from "react-router-dom";
import { apiRequest, formatCurrency } from "../lib/api";
import Loading from "../components/Loading";
import DigitalTicketModal, {
  getStatusBadgeStyle,
} from "../components/DigitalTicketModal";

const MyBookings = () => {
  const { isLoaded, user } = useAuthUser();
  const { getToken } = useAuthSession();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    apiRequest("/api/bookings/my", { getToken })
      .then((res) => {
        if (active) setBookings(res.bookings || []);
      })
      .catch(() => {
        if (active) setBookings([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, isLoaded, getToken]);

  if (!isLoaded || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center pt-20 px-6">
        <div className="text-center max-w-md">
          <Ticket className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Sign In to View Bookings
          </h1>
          <p className="text-gray-400 mb-8">
            Sign in with your Clerk account to view your confirmed digital tickets and booking history.
          </p>
          <AuthSignInButton mode="modal">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold cursor-pointer">
              Sign In
            </button>
          </AuthSignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="relative px-6 md:px-16 lg:px-36 pt-28 min-h-[85vh] bg-black text-white pb-20">
      <div className="absolute top-[100px] left-[100px] pointer-events-none">
        <div className="w-64 h-64 bg-red-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1">My Bookings</h1>
          <p className="text-gray-400 text-sm">
            Your persistent booking history & digital cinema passes
          </p>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-5">
            {bookings.map((item) => {
              const showDate = item.showDateTime ? new Date(item.showDateTime) : null;
              return (
                <div
                  key={item._id}
                  className="flex flex-col md:flex-row justify-between bg-zinc-950 border border-primary/25 rounded-xl overflow-hidden hover:border-red-600/50 transition-colors"
                >
                  {/* Left Section */}
                  <div className="flex flex-col sm:flex-row flex-1">
                    {item.movieSnapshot?.poster_path && (
                      <img
                        src={item.movieSnapshot.poster_path}
                        alt={item.movieSnapshot.title}
                        className="w-full sm:w-32 h-48 sm:h-auto object-cover shrink-0"
                      />
                    )}

                    <div className="flex flex-col p-5 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">
                          {item.bookingCode}
                        </span>
                        {item.payment?.isSimulated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            DEV MODE
                          </span>
                        )}
                      </div>

                      <p className="text-xl font-bold text-white">
                        {item.movieSnapshot?.title}
                      </p>

                      <p className="text-gray-400 text-xs mt-1">
                        {item.screenName}
                        {item.movieSnapshot?.runtime > 0
                          ? ` • ${item.movieSnapshot.runtime} mins`
                          : ""}
                      </p>

                      <div className="flex flex-col gap-1.5 mt-4 text-sm text-gray-300">
                        {showDate && (
                          <div className="flex items-center gap-3 flex-wrap text-xs text-gray-300">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-red-500" />
                              {showDate.toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-red-500" />
                              {showDate.toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>
                            {item.theatreSnapshot?.name}
                            {item.theatreSnapshot?.city
                              ? `, ${item.theatreSnapshot.city}`
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col justify-between items-start md:items-end p-5 border-t md:border-t-0 md:border-l border-zinc-800/80 min-w-[210px] bg-black/30">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                    <div className="md:text-right mt-4">
                      <p className="text-gray-400 text-xs mb-1">
                        Seats: <span className="text-white font-semibold">{item.bookedSeats?.join(", ")}</span>
                      </p>
                      <p className="text-2xl font-black text-red-500">
                        {formatCurrency(item.totalAmount)}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-4 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => setActiveBooking(item)}
                        className="flex-1 md:flex-none px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        {item.status === "CONFIRMED" ? "Digital Ticket" : "View Details"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-950 border border-white/10 rounded-2xl">
            <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">No Bookings Yet</h2>
            <p className="text-gray-400 text-sm mb-8">
              Explore active theaters or browse movies to book your first digital ticket.
            </p>
            <Link
              to="/theaters"
              className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
            >
              Browse Active Shows
            </Link>
          </div>
        )}
      </div>

      <DigitalTicketModal
        booking={activeBooking}
        onClose={() => setActiveBooking(null)}
      />
    </div>
  );
};

export default MyBookings;