import React, { useState, useEffect } from "react";
import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  UsersIcon,
  StarIcon,
  Building2,
  MapPin,
} from "lucide-react";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/blurcircle";
import Loading from "../../components/Loading";
import { dateFormat } from "../../lib/dateFormat";
import { apiRequest, formatCurrency } from "../../lib/api";
import { useAuthSession } from "../../lib/auth";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { getToken } = useAuthSession();

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
    totalTheaters: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiRequest("/api/admin/dashboard", { getToken })
      .then((res) => {
        if (active && res?.dashboard) {
          setDashboardData(res.dashboard);
        }
      })
      .catch((err) => {
        toast.error(err.message || "Could not load dashboard stats");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getToken]);

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings || 0,
      sub: `${dashboardData.confirmedBookings || 0} confirmed`,
      icon: ChartLineIcon,
    },
    {
      title: "Verified Revenue",
      value: formatCurrency(dashboardData.totalRevenue || 0),
      sub: "Paid bookings only",
      icon: CircleDollarSignIcon,
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows?.length || 0,
      sub: `${dashboardData.totalTheaters || 0} theaters`,
      icon: PlayCircleIcon,
    },
    {
      title: "Registered Users",
      value: dashboardData.totalUser || 0,
      sub: "Synced Clerk accounts",
      icon: UsersIcon,
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen text-white pb-16">
      <Title text1="Admin" text2="Dashboard" />

      {/* Stats Cards Section */}
      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0" />
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full max-w-5xl">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-5 py-4 bg-primary/10 border border-primary/20 rounded-xl backdrop-blur-sm"
            >
              <div>
                <h2 className="text-sm text-gray-400">{card.title}</h2>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{card.sub}</p>
              </div>
              <card.icon className="w-7 h-7 text-primary shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Active Shows Section */}
      <div className="mt-10">
        <p className="text-lg font-medium flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Active Scheduled Shows ({dashboardData.activeShows?.length || 0})
        </p>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5 max-w-6xl">
          <BlurCircle top="100px" left="-10%" />

          {dashboardData.activeShows && dashboardData.activeShows.length > 0 ? (
            dashboardData.activeShows.slice(0, 12).map((show) => {
              const bookedCount = Object.keys(show.occupiedSeats || {}).length;
              return (
                <div
                  key={show._id}
                  className="relative z-10 rounded-xl overflow-hidden pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition-all duration-300"
                >
                  {show.movie?.poster_path && (
                    <img
                      src={show.movie.poster_path}
                      alt={show.movie.title}
                      className="h-56 w-full object-cover"
                    />
                  )}

                  <p className="font-semibold px-3 pt-3 truncate text-sm">
                    {show.movie?.title}
                  </p>

                  <p className="px-3 text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-primary shrink-0" />
                    {show.theatreSnapshot?.name} • {show.screenName}
                  </p>

                  <div className="flex items-center justify-between px-3 mt-2">
                    <p className="text-base font-bold">
                      {formatCurrency(show.showPrice)}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-gray-300">
                      <StarIcon className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span>
                        {show.movie?.vote_average
                          ? Number(show.movie.vote_average).toFixed(1)
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="px-3 pt-2 flex items-center justify-between text-[11px] text-gray-400">
                    <span>{dateFormat(show.showDateTime)}</span>
                    <span className="text-emerald-400 font-medium">
                      {bookedCount} booked
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-gray-500 col-span-full">
              No active shows found. Use Add Shows to schedule a TMDB movie.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;