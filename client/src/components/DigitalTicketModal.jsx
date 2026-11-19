import React from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "../lib/api";

// Deterministic QR-style SVG matrix generated from bookingCode for visual digital ticket pass
const TicketQrGraphic = ({ code = "QUICKSHOW" }) => {
  const size = 9;
  const cells = [];
  let seed = 0;
  for (let i = 0; i < code.length; i++) {
    seed = (seed * 31 + code.charCodeAt(i)) % 100000;
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isCorner =
        (r < 3 && c < 3) ||
        (r < 3 && c >= size - 3) ||
        (r >= size - 3 && c < 3);
      const hash = (seed + r * 17 + c * 31 + r * c * 7) % 11;
      if (isCorner || hash % 2 === 0) {
        cells.push({ r, c });
      }
    }
  }
  return (
    <svg
      viewBox={`0 0 ${size * 10} ${size * 10}`}
      className="w-24 h-24 bg-white p-1.5 rounded-lg shrink-0"
      aria-label={`Ticket code ${code}`}
    >
      {cells.map((cell, idx) => (
        <rect
          key={idx}
          x={cell.c * 10}
          y={cell.r * 10}
          width="9"
          height="9"
          rx="1.5"
          fill="#09090B"
        />
      ))}
    </svg>
  );
};

export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    case "PENDING_PAYMENT":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    case "FAILED":
      return "bg-red-500/15 text-red-400 border border-red-500/30";
    case "EXPIRED":
    case "CANCELLED":
    default:
      return "bg-zinc-700/40 text-gray-300 border border-zinc-600/40";
  }
};

const DigitalTicketModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const showDate = booking.showDateTime ? new Date(booking.showDateTime) : null;
  const isConfirmed = booking.status === "CONFIRMED" && booking.isPaid;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-zinc-950 border border-red-600/30 rounded-2xl overflow-hidden shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Development Mode Banner when simulated */}
        {booking.payment?.isSimulated && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-5 py-2.5 flex items-center gap-2 text-amber-300 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              DEVELOPMENT MODE — Simulated Payment Transaction (No real money charged)
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Ticket className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="text-white font-bold text-lg">
                {isConfirmed ? "QuickShow Digital Ticket" : "Booking Summary"}
              </h2>
              <p className="text-xs text-gray-400 font-mono">{booking.bookingCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyle(
                booking.status
              )}`}
            >
              {booking.status}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Movie & Poster */}
          <div className="flex flex-col sm:flex-row gap-5">
            {booking.movieSnapshot?.poster_path && (
              <img
                src={booking.movieSnapshot.poster_path}
                alt={booking.movieSnapshot?.title}
                className="w-28 h-40 object-cover rounded-lg border border-white/10 shrink-0"
              />
            )}
            <div className="flex-1 space-y-2.5">
              <h3 className="text-2xl font-bold text-white">
                {booking.movieSnapshot?.title}
              </h3>

              <div className="flex flex-wrap gap-3 text-xs text-gray-300">
                {booking.movieSnapshot?.original_language && (
                  <span className="px-2.5 py-1 bg-zinc-900 border border-white/10 rounded uppercase">
                    {booking.movieSnapshot.original_language}
                  </span>
                )}
                {booking.movieSnapshot?.runtime > 0 && (
                  <span className="px-2.5 py-1 bg-zinc-900 border border-white/10 rounded">
                    {booking.movieSnapshot.runtime} mins
                  </span>
                )}
                <span className="px-2.5 py-1 bg-red-600/15 border border-red-600/30 text-red-400 rounded">
                  {booking.screenName}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  <span>
                    {booking.theatreSnapshot?.name}
                    {booking.theatreSnapshot?.city
                      ? `, ${booking.theatreSnapshot.city}`
                      : ""}
                  </span>
                </div>
                {showDate && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-500" />
                      {showDate.toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500" />
                      {showDate.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="border-t border-dashed border-zinc-700" />

          {/* Seats & QR Pass */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-zinc-900/70 border border-white/10 rounded-xl p-4">
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Seats ({booking.bookedSeats?.length || 0})
                </p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {(booking.seats?.length ? booking.seats : (booking.bookedSeats || []).map((s) => ({ seatId: s, category: "Standard", price: 0 }))).map(
                    (seat) => (
                      <span
                        key={seat.seatId}
                        className="px-2.5 py-1 bg-red-600/20 border border-red-600/40 text-white rounded text-xs font-semibold"
                      >
                        {seat.seatId}
                        {seat.category ? ` · ${seat.category}` : ""}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Booking Holder</p>
                  <p className="text-white font-medium">
                    {booking.userSnapshot?.name || "QuickShow Guest"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Paid</p>
                  <p className="text-red-500 font-bold text-lg">
                    {formatCurrency(booking.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {isConfirmed && (
              <div className="flex flex-col items-center gap-1.5">
                <TicketQrGraphic code={booking.bookingCode} />
                <span className="text-[10px] uppercase tracking-widest text-gray-400">
                  Scan at Entry
                </span>
              </div>
            )}
          </div>

          {/* Payment Verification Audit Trail */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold mb-1">
              {isConfirmed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : booking.status === "FAILED" ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              )}
              <span>Payment & Verification Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-400">
              <div>
                Mode:{" "}
                <span className="text-white font-medium">
                  {booking.payment?.mode || "DEVELOPMENT MODE"}
                </span>
              </div>
              <div>
                Provider:{" "}
                <span className="text-white font-mono">
                  {booking.payment?.provider || "dev_simulated"}
                </span>
              </div>
              {booking.payment?.orderId && (
                <div className="truncate">
                  Order ID:{" "}
                  <span className="text-white font-mono">{booking.payment.orderId}</span>
                </div>
              )}
              {booking.payment?.paymentId && (
                <div className="truncate">
                  Payment ID:{" "}
                  <span className="text-white font-mono">{booking.payment.paymentId}</span>
                </div>
              )}
            </div>

            {booking.payment?.failureReason && (
              <p className="text-red-400 pt-1">
                Reason: {booking.payment.failureReason}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 bg-black/40">
          {isConfirmed && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Ticket
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalTicketModal;
