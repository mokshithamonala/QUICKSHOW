import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Home from './pages/home'
import Movies from './pages/movies'
import MovieDetails from './pages/moviedetails'
import SeatLayout from './pages/seatLayout'
import MyBookings from './pages/mybookings'
import Favourite from './pages/favourite'
import AdminLayout from './pages/admin/Layout' // Imported as AdminLayout
import Dashboard from './pages/admin/Dashboard'
import ListShows from './pages/admin/ListShows'
import ListBooking from './pages/admin/ListBooking'
import AddShows from './pages/admin/AddShows.jsx' // Fixed name to match AddShows
import { Toaster } from 'react-hot-toast'

const App = () => {

  return (
    <AppLayout>
      <Toaster />
      <Routes>
        {/* User Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movies/:id' element={<MovieDetails />} />
        <Route path='/movies/:id/:date' element={<SeatLayout />} />
        <Route path='/mybookings' element={<MyBookings />} />
        <Route path='/theaters' element={<div className="min-h-screen bg-black text-white flex items-center justify-center pt-24"><h1 className="text-4xl font-bold">Theaters Page (Coming Soon)</h1></div>} />
        <Route path='/releases' element={<div className="min-h-screen bg-black text-white flex items-center justify-center pt-24"><h1 className="text-4xl font-bold">Releases Page (Coming Soon)</h1></div>} />
        <Route path='/favourite' element={<Favourite />} />
        <Route path='/favorite' element={<Navigate to="/favourite" />} />

        {/* Admin Routes - Fixed Layout and AddShows references */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBooking />} />
        </Route>
      </Routes>
    </AppLayout>
  )
}

export default App