import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Home from "./pages/home";
import Movies from "./pages/movies";
import MaheshBabuUniverse from "./pages/MaheshBabuUniverse";
import MovieDetails from "./pages/moviedetails";
import SeatLayout from "./pages/seatLayout";
import MyBookings from "./pages/mybookings";
import Favourite from "./pages/favourite";
import Theaters from "./pages/Theaters";
import Releases from "./pages/Releases";
import AdminLayout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import ManageTheaters from "./pages/admin/ManageTheaters";
import ListShows from "./pages/admin/ListShows";
import ListBooking from "./pages/admin/ListBooking";
import AddShows from "./pages/admin/AddShows";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <AppLayout>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.12)",
          },
        }}
      />
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/mahesh-babu" element={<MaheshBabuUniverse />} />
        <Route path="/bob-multiverse" element={<Navigate to="/mahesh-babu" replace />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/seat-layout/:showId" element={<SeatLayout />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/mybookings" element={<MyBookings />} />
        <Route path="/theaters" element={<Theaters />} />
        <Route path="/releases" element={<Releases />} />
        <Route path="/favourite" element={<Favourite />} />
        <Route path="/favorite" element={<Navigate to="/favourite" replace />} />

        {/* RBAC-Protected Admin Routes */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="theaters" element={<ManageTheaters />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBooking />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default App;