import React, { useEffect, useState } from "react";
import { Search, Eye, AlertTriangle } from "lucide-react";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";
import DigitalTicketModal, {
  getStatusBadgeStyle,
} from "../../components/DigitalTicketModal";
import { apiRequest, formatCurrency } from "../../lib/api";
import { dateFormat } from "../../lib/dateFormat";
import { useAuthSession } from "../../lib/auth";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["ALL", "CONFIRMED", "PENDING_PAYMENT", "FAILED", "EXPIRED", "CANCELLED"];

const ListBooking = () => {
  const { getToken } = useAuthSession();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    let active = true;
    const loadBookings = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          status: statusFilter,
          search: search.trim(),
        });
        const res = await apiRequest(`/api/admin/bookings?${qs.toString()}`, {
          getToken,
        });
        if (active) setBookings(res.bookings || []);
      } catch (err) {
        toast.error(err.message || "Could not load bookings");
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(loadBookings, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [statusFilter, search, getToken]);

  return (
    <div className="pb-20 text-white">
      <Title text1="List" text2="Bookings" />

      {/* Search & Status Filter Bar */}
      <div className="mt-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between max-w-6xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by booking code, movie, user, or theater..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-primary rounded-full py-2.5 pl-10 pr-4 text-sm text-white outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900 text-gray-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="max-w-6xl mt-6 overflow-x-auto rounded-xl border border-white/10">
        {loading ? (
          <Loading />
        ) : (
          <table className="w-full border-collapse text-nowrap">
            <thead>
              <tr className="bg-primary/20 text-left text-white text-xs uppercase tracking-wider">
                <th className="p-3.5 pl-5">Code</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Movie & Theater</th>
                <th className="p-3.5">Showtime</th>
                <th className="p-3.5">Seats</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="text-sm text-white">
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr
                    key={b._id}
                    className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
                  >
                    <td className="p-3.5 pl-5 font-mono text-xs">
                      <div>{b.bookingCode}</div>
                      {b.payment?.isSimulated && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          DEV MODE
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <p className="font-medium">{b.userSnapshot?.name || "User"}</p>
                      <p className="text-xs text-gray-400">{b.userSnapshot?.email}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-medium">{b.movieSnapshot?.title}</p>
                      <p className="text-xs text-gray-400">
                        {b.theatreSnapshot?.name} • {b.screenName}
                      </p>
                    </td>
                    <td className="p-3.5 text-xs text-gray-300">
                      {b.showDateTime ? dateFormat(b.showDateTime) : "—"}
                    </td>
                    <td className="p-3.5 font-medium text-xs">
                      {b.bookedSeats?.join(", ")}
                    </td>
                    <td className="p-3.5 font-bold text-red-400">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusBadgeStyle(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400">
                    No bookings found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <DigitalTicketModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
};

export default ListBooking;