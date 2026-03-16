import React, { useState, useEffect } from 'react'
import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, UsersIcon, StarIcon } from 'lucide-react'
import { dummyDashboardData } from '../../assets/assets'

// --- HELPER & COMPONENT IMPORTS ---
import Title from '../../components/admin/Title'
import BlurCircle from '../../components/blurcircle'
import { dateFormat } from '../../lib/dateFormat' 

const Dashboard = () => {

  const currency = import.meta.env.VITE_CURRENCY || '$'

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0
  });

  const [loading, setLoading] = useState(true);

  const dashboardCards = [
    { 
        title: "Total Bookings", 
        value: dashboardData.totalBookings || "0", 
        icon: ChartLineIcon 
    },
    { 
        title: "Total Revenue", 
        value: `${currency}${dashboardData.totalRevenue || 0}`, 
        icon: CircleDollarSignIcon 
    },
    { 
        title: "Active Shows", 
        value: dashboardData.activeShows?.length || "0", 
        icon: PlayCircleIcon 
    },
    { 
        title: "Total Users", 
        value: dashboardData.totalUser || "0", 
        icon: UsersIcon 
    }
  ]

  const fetchDashboardData = async () => {
    // Simulating API call with dummy data
    setDashboardData(dummyDashboardData)
    setLoading(false)
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-10 text-white">Loading...</div>

  return (
    <div className="min-h-screen text-white p-4">
      {/* Header Section */}
      <Title text1="Admin" text2="Dashboard" />

      {/* Stats Cards Section */}
      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0" />
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div key={index} className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full backdrop-blur-sm">
              <div>
                <h1 className="text-sm text-gray-400">{card.title}</h1>
                <p className="text-xl font-medium mt-1">
                  {card.value}
                </p>
              </div>
              <card.icon className="w-6 h-6 text-primary" />
            </div>
          ))}
        </div>
      </div>

      {/* Active Shows Section (Movie Cards) */}
      <div className="mt-10">
        <p className="text-lg font-medium">Active Shows</p>
        
        <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
          <BlurCircle top="100px" left="-10%" />
          
          {dashboardData.activeShows && dashboardData.activeShows.length > 0 ? (
            dashboardData.activeShows.map((show) => (
              <div 
                key={show._id} 
                className="w-55 rounded-lg overflow-hidden pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Movie Poster */}
                <img 
                  src={show.movie.poster_path} 
                  alt={show.movie.title} 
                  className="h-60 w-full object-cover" 
                />
                
                {/* Movie Title */}
                <p className="font-medium p-2 truncate text-sm">
                  {show.movie.title}
                </p>
                
                {/* Price and Rating */}
                <div className="flex items-center justify-between px-2">
                  <p className="text-lg font-semibold flex items-center gap-0.5">
                    <span className="text-sm font-normal text-gray-400">{currency}</span>
                    {show.showPrice}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <StarIcon className="w-3 h-3 text-primary fill-primary" />
                    <span>{show.movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                
                {/* Date Display */}
                <p className="px-2 pt-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                  {dateFormat(show.showDateTime)}
                </p>
              </div>
            ))
          ) : (
            <div className="p-10 text-gray-500">No active shows found.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard