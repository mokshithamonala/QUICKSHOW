import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";
import { dateFormat } from "../../lib/dateFormat";
import { apiRequest, formatCurrency } from "../../lib/api";
import { useAuthSession } from "../../lib/auth";
import toast from "react-hot-toast";

const ListShows = () => {
  const { getToken } = useAuthSession();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/api/admin/shows", { getToken });
      setShows(res.shows || []);
    } catch (err) {
      toast.error(err.message || "Could not load shows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllShows();
  }, []);

  const handleCancelShow = async (show) => {
    try {
      await apiRequest(`/api/admin/shows/${show._id}`, {
        method: "DELETE",
        getToken,
      });
      toast.success(`Cancelled show for "${show.movie?.title}"`);
      getAllShows();
    } catch (err) {
      toast.error(err.message || "Could not cancel show");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="pb-16 text-white">
      <Title text1="List" text2="Shows" />

      <div className="max-w-6xl mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full border-collapse text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white text-sm">
              <th className="p-3.5 font-semibold pl-5">Movie Name</th>
              <th className="p-3.5 font-semibold">Theater & Screen</th>
              <th className="p-3.5 font-semibold">Show Time</th>
              <th className="p-3.5 font-semibold">Seats Booked</th>
              <th className="p-3.5 font-semibold">Est. Earnings</th>
              <th className="p-3.5 font-semibold text-right pr-5">Action</th>
            </tr>
          </thead>

          <tbody className="text-sm font-light text-white">
            {shows.length > 0 ? (
              shows.map((show) => {
                const booked = Object.keys(show.occupiedSeats || {}).length;
                const totalSeats = (show.rows?.length || 8) * (show.seatsPerRow || 12);
                const earnings = booked * Number(show.showPrice || 0);
                return (
                  <tr
                    key={show._id}
                    className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
                  >
                    <td className="p-3.5 pl-5 font-medium">{show.movie?.title}</td>
                    <td className="p-3.5 text-gray-300">
                      {show.theatreSnapshot?.name} •{" "}
                      <span className="text-xs text-gray-400">{show.screenName}</span>
                    </td>
                    <td className="p-3.5 text-gray-300">{dateFormat(show.showDateTime)}</td>
                    <td className="p-3.5">
                      <span className="font-semibold">{booked}</span>{" "}
                      <span className="text-gray-400 text-xs">/ {totalSeats}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-400">
                      {formatCurrency(earnings)}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleCancelShow(show)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No shows scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListShows;