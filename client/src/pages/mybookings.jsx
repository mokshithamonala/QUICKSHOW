import React, { useState, useEffect } from "react";
import { dummyBookingData } from "../assets/assets";
import { Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { useUser, SignInButton } from "@clerk/react";
import { Link } from "react-router-dom";

// Note: Ensure these components/helpers exist in your project as seen in your tabs
// import BlurCircle from "../components/BlurCircle"; 
// import Loading from "../components/Loading";
// import { timeFormat } from "../utils/isoTimeFormat";
// import { dateFormat } from "../utils/dateFormat";

const MyBookings = () => {
  const { isLoaded, user } = useUser();
  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMyBookings = async () => {
    // In a real app, you'd fetch from an API here using the user.id
    setBookings(dummyBookingData);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      getMyBookings();
    }
  }, [user]);

  // Loading state (Clerk or API)
  if (!isLoaded || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // If user not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center pt-20 px-6">
        <div className="text-center max-w-md">
          <Ticket className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Sign In to View Bookings
          </h1>
          <p className="text-gray-400 mb-8">
            Please sign in to view your movie bookings.
          </p>
          <SignInButton mode="modal">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh] bg-black text-white pb-20">
      {/* Background elements from screenshot */}
      <div className="absolute top-[100px] left-[100px]">
         <div className="w-64 h-64 bg-red-600/20 blur-[120px] rounded-full" />
      </div>
      
      <div className="relative z-10">
        <div className="mb-10">
          <h1 className="text-lg font-semibold mb-4">My Bookings</h1>
          <p className="text-gray-400 text-sm mt-[-10px] mb-6">Manage your movie tickets</p>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((item, index) => (
              <div 
                key={item._id || index} 
                className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
              >
                {/* Left Section: Poster and Details */}
                <div className="flex flex-col md:flex-row">
                  <img 
                    src={item.show?.movie?.poster_path} 
                    alt="" 
                    className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded" 
                  />

                  <div className="flex flex-col p-4">
                    <p className="text-lg font-semibold">
                      {item.show?.movie?.title}
                    </p>
                    
                    <p className="text-gray-400 text-sm">
                      {item.show?.movie?.runtime} mins
                    </p>

                    <div className="flex flex-col gap-1 mt-auto">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.show?.showDateTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>QuickShow Theater</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section: Status and Price */}
                <div className="flex flex-col justify-between items-end p-4 border-t md:border-t-0 md:border-l border-zinc-800/50">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.isPaid
                        ? "bg-green-600/20 text-green-500 border border-green-600/30"
                        : "bg-yellow-600/20 text-yellow-500 border border-yellow-600/30"
                    }`}
                  >
                    {item.isPaid ? "Confirmed" : "Pending"}
                  </span>

                  <div className="text-right mt-4">
                    <p className="text-gray-400 text-xs mb-1">
                      Seats: {item.bookedSeats?.join(", ")}
                    </p>
                    <p className="text-xl font-bold text-red-500">
                      {currency}{item.amount}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 rounded transition-colors">
                      Ticket
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">No Bookings Yet</h2>
            <Link
              to="/movies"
              className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
            >
              Browse Movies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;