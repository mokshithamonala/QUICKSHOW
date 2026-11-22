import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  MapPin,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest, formatCurrency } from "../lib/api";
import { useAuthSession, useAuthUser, AuthSignInButton } from "../lib/auth";
import Loading from "../components/Loading";
import DigitalTicketModal from "../components/DigitalTicketModal";

// Singleton loader for official Razorpay Checkout script (loaded only when Razorpay mode is active)
const loadRazorpayCheckoutScript = () => {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const SeatLayout = () => {
  const { showId, id, date } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const { getToken } = useAuthSession();

  const [show, setShow] = useState(null);
  const [resolvedShowId, setResolvedShowId] = useState(showId || "");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Locking & Payment Modal State
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [busyAction, setBusyAction] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [failureReason, setFailureReason] = useState("Bank declined (Simulated)");
  const [paymentOutcomeError, setPaymentOutcomeError] = useState("");
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  // Load active backend payment configuration (Razorpay Test Mode or Simulated fallback)
  useEffect(() => {
    apiRequest("/api/payments/config")
      .then((res) => setPaymentConfig(res))
      .catch(() => {});
  }, []);

  // Load live show + seat map
  const fetchShow = useCallback(
    async (targetId, silent = false) => {
      if (!targetId) return;
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await apiRequest(`/api/shows/${targetId}`);
        setShow(res.show);
        setResolvedShowId(res.show._id);
      } catch (err) {
        toast.error(err.message || "Could not load show seats");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // Support both /seat-layout/:showId and legacy /movies/:id/:date
  useEffect(() => {
    if (showId) {
      fetchShow(showId);
      return;
    }
    if (id) {
      setLoading(true);
      apiRequest(`/api/shows?tmdbMovieId=${id}`)
        .then((res) => {
          const list = res.shows || [];
          const match =
            (date &&
              list.find(
                (s) => new Date(s.showDateTime).toISOString().slice(0, 10) === date
              )) ||
            list[0];
          if (match) {
            fetchShow(match._id);
          } else {
            setShow(null);
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    }
  }, [showId, id, date, fetchShow]);

  // Countdown timer for active seat lock
  useEffect(() => {
    if (!pendingBooking?.lockExpiresAt) {
      setSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(pendingBooking.lockExpiresAt).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(diff);
      if (diff === 0) {
        toast.error("Seat reservation lock expired. Seats have been released.");
        setPendingBooking(null);
        setPaymentOrder(null);
        setSelectedSeats([]);
        if (resolvedShowId) fetchShow(resolvedShowId, true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pendingBooking, resolvedShowId, fetchShow]);

  const rows = show?.rows || ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = show?.seatsPerRow || 12;
  const occupiedSeats = show?.occupiedSeats || {};
  const seatLocks = show?.seatLocks || {};

  const getRowCategory = useCallback(
    (row) => {
      const cat = (show?.seatCategories || []).find((c) =>
        (c.rows || []).includes(row)
      );
      return cat || { name: "Standard", price: show?.showPrice || 250 };
    },
    [show]
  );

  const isSeatLockedByOther = (seatId) => {
    const lock = seatLocks[seatId];
    if (!lock) return false;
    if (new Date(lock.expiresAt).getTime() <= Date.now()) return false;
    if (user?.id && lock.userId === user.id) return false;
    return true;
  };

  const toggleSeat = (seatId) => {
    if (occupiedSeats[seatId]) {
      toast.error(`Seat ${seatId} is already booked.`);
      return;
    }
    if (isSeatLockedByOther(seatId)) {
      toast.error(`Seat ${seatId} is temporarily locked by another customer.`);
      return;
    }
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) return prev.filter((s) => s !== seatId);
      if (prev.length >= 10) {
        toast.error("Maximum 10 seats can be booked at once.");
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const selectedSeatDetails = useMemo(() => {
    return selectedSeats.map((seatId) => {
      const cat = getRowCategory(seatId.charAt(0));
      return { seatId, category: cat.name, price: Number(cat.price) };
    });
  }, [selectedSeats, getRowCategory]);

  const totalPrice = useMemo(
    () => selectedSeatDetails.reduce((sum, s) => sum + s.price, 0),
    [selectedSeatDetails]
  );

  // Launch official Razorpay Checkout modal for a locked booking & server-created order
  const openRazorpayCheckout = useCallback(
    async (booking, order) => {
      const loaded = await loadRazorpayCheckoutScript();
      if (!loaded || !window.Razorpay) {
        toast.error(
          "Could not load Razorpay Checkout script. Please check your internet connection and retry."
        );
        return;
      }

      let settled = false;

      const options = {
        key: order.keyId, // Public Key ID only — secret stays strictly on backend
        amount: order.amountPaise,
        currency: order.currency || "INR",
        name: "QUICKSHOW",
        description: `${booking.movieSnapshot?.title || "Movie Tickets"} · Seats: ${(
          booking.bookedSeats || []
        ).join(", ")}`,
        order_id: order.orderId,
        prefill: {
          name:
            user?.fullName ||
            [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
            booking.userSnapshot?.name ||
            "",
          email:
            user?.primaryEmailAddress?.emailAddress ||
            booking.userSnapshot?.email ||
            "",
        },
        notes: {
          bookingId: String(booking._id),
          bookingCode: booking.bookingCode,
        },
        theme: {
          color: "#F84565",
        },
        handler: async (response) => {
          settled = true;
          setVerifyingPayment(true);
          setPaymentOutcomeError("");
          try {
            const verifyRes = await apiRequest("/api/payments/verify", {
              method: "POST",
              getToken,
              body: {
                bookingId: booking._id,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            });

            toast.success(
              verifyRes.message || "Payment verified and digital ticket generated!"
            );
            setPendingBooking(null);
            setPaymentOrder(null);
            setSelectedSeats([]);
            setConfirmedTicket(verifyRes.booking);
            fetchShow(resolvedShowId, true);
          } catch (err) {
            const msg =
              err.message || "Server signature verification failed. Seats released.";
            setPaymentOutcomeError(msg);
            toast.error(msg);
            setPendingBooking(null);
            setPaymentOrder(null);
            setSelectedSeats([]);
            fetchShow(resolvedShowId, true);
          } finally {
            setVerifyingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (!settled) {
              toast(
                "Razorpay Checkout closed. Your seats remain locked until you retry or cancel."
              );
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (resp) => {
        settled = true;
        const reason =
          resp?.error?.description ||
          resp?.error?.reason ||
          "Payment failed in Razorpay Test Checkout.";
        const failedPaymentId = resp?.error?.metadata?.payment_id || "";

        try {
          await apiRequest("/api/payments/failed", {
            method: "POST",
            getToken,
            body: {
              bookingId: booking._id,
              paymentId: failedPaymentId,
              reason,
            },
          });
        } catch {
          // Best-effort lock release
        }

        setPaymentOutcomeError(reason);
        toast.error(reason);
        setPendingBooking(null);
        setPaymentOrder(null);
        setSelectedSeats([]);
        fetchShow(resolvedShowId, true);
      });

      rzp.open();
    },
    [user, getToken, resolvedShowId, fetchShow]
  );

  // Step 1: Lock seats atomically on server & create backend payment order (amount always computed server-side)
  const handleProceedToPayment = async () => {
    if (!user) {
      toast.error("Please sign in to lock seats and book tickets.");
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }

    setBusyAction(true);
    setPaymentOutcomeError("");
    try {
      const lockRes = await apiRequest("/api/bookings/lock", {
        method: "POST",
        getToken,
        body: { showId: resolvedShowId, seats: selectedSeats },
      });

      const booking = lockRes.booking;
      const orderRes = await apiRequest("/api/payments/create-order", {
        method: "POST",
        getToken,
        body: { bookingId: booking._id },
      });

      setPendingBooking(booking);
      setPaymentOrder(orderRes.order);
      fetchShow(resolvedShowId, true);

      if (
        orderRes.order?.provider === "razorpay_test" ||
        orderRes.order?.provider === "razorpay_live"
      ) {
        toast.success("Seats locked for 7 minutes! Opening Razorpay Test Checkout...");
        await openRazorpayCheckout(booking, orderRes.order);
      } else {
        toast.success("Seats locked for 7 minutes! Complete simulated checkout below.");
      }
    } catch (err) {
      toast.error(err.message || "Could not start payment checkout.");
      fetchShow(resolvedShowId, true);
    } finally {
      setBusyAction(false);
    }
  };

  // Step 2 (Simulated fallback only): Verify simulated payment on backend (Success OR Failure)
  const handleSimulatePayment = async (outcome) => {
    if (!pendingBooking || !paymentOrder || busyAction) return;
    setBusyAction(true);
    setPaymentOutcomeError("");

    try {
      const res = await apiRequest("/api/payments/verify", {
        method: "POST",
        getToken,
        body: {
          bookingId: pendingBooking._id,
          orderId: paymentOrder.orderId,
          orderToken: paymentOrder.orderToken,
          outcome,
          failureReason: outcome === "failed" ? failureReason : "",
        },
      });

      toast.success(res.message || "Booking confirmed!");
      setPendingBooking(null);
      setPaymentOrder(null);
      setSelectedSeats([]);
      setConfirmedTicket(res.booking);
      fetchShow(resolvedShowId, true);
    } catch (err) {
      const msg = err.message || "Simulated payment failed.";
      setPaymentOutcomeError(msg);
      toast.error(msg);
      setPendingBooking(null);
      setPaymentOrder(null);
      setSelectedSeats([]);
      fetchShow(resolvedShowId, true);
    } finally {
      setBusyAction(false);
    }
  };

  // Release active lock cleanly if user cancels checkout
  const handleCancelCheckout = async () => {
    if (!pendingBooking) return;
    setBusyAction(true);
    try {
      await apiRequest(`/api/bookings/${pendingBooking._id}/release`, {
        method: "POST",
        getToken,
      });
      toast("Seat lock released.");
    } catch {
      // Best-effort release
    } finally {
      setPendingBooking(null);
      setPaymentOrder(null);
      setSelectedSeats([]);
      setBusyAction(false);
      fetchShow(resolvedShowId, true);
    }
  };

  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <Loading />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center pt-24 px-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Show Not Found</h1>
        <p className="text-gray-400 mb-6">
          This showtime is no longer available or has already ended.
        </p>
        <button
          onClick={() => navigate("/theaters")}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
        >
          Browse Active Shows
        </button>
      </div>
    );
  }

  const showDateObj = new Date(show.showDateTime);

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-16 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => fetchShow(resolvedShowId, true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 border border-white/10 text-xs text-gray-300 hover:text-white hover:border-red-600 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh Live Seats</span>
          </button>
        </div>

        {/* Show Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-5 bg-zinc-950 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-4">
            {show.movie?.poster_path && (
              <img
                src={show.movie.poster_path}
                alt={show.movie.title}
                className="w-16 h-24 object-cover rounded-lg shrink-0"
              />
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{show.movie?.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-400 text-sm mt-1">
                <span className="flex items-center gap-1.5 text-gray-200">
                  <MapPin className="w-4 h-4 text-red-500" />
                  {show.theatreSnapshot?.name} ({show.theatreSnapshot?.city})
                </span>
                <span className="text-red-400 font-medium">{show.screenName}</span>
              </div>
              <p className="flex items-center gap-1.5 text-gray-400 text-xs mt-1.5">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                {showDateObj.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                •{" "}
                {showDateObj.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(show.seatCategories || []).map((cat) => (
              <div
                key={cat.name}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs"
              >
                <span className="text-gray-400">{cat.name}: </span>
                <span className="text-white font-bold">{formatCurrency(cat.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment failure alert if previous attempt failed */}
        {paymentOutcomeError && (
          <div className="mb-8 p-4 rounded-xl bg-red-600/15 border border-red-600/40 flex items-start gap-3 text-sm text-red-200">
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Previous Payment Failed — Seats Released</p>
              <p className="text-red-300 mt-0.5">{paymentOutcomeError}</p>
            </div>
          </div>
        )}

        {/* Screen */}
        <div className="mb-10">
          <div className="relative h-2 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full mb-2">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-gray-500 text-xs tracking-[1em]">
              SCREEN THIS WAY
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-3/4 h-12 bg-gradient-to-b from-red-600/20 to-transparent blur-xl rounded-t-full" />
          </div>
        </div>

        {/* Seat Legend */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-zinc-900 rounded border border-zinc-700" />
            <span className="text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-600 rounded" />
            <span className="text-gray-400">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-amber-500/30 border border-amber-500/60 rounded" />
            <span className="text-gray-400">Locked (Hold)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-zinc-700 rounded" />
            <span className="text-gray-400">Booked</span>
          </div>
        </div>

        {/* Categorized Seat Grid */}
        <div className="overflow-x-auto pb-4 mb-10">
          <div className="min-w-[540px] flex flex-col items-center gap-2.5">
            {rows.map((row, rowIdx) => {
              const cat = getRowCategory(row);
              const prevCat = rowIdx > 0 ? getRowCategory(rows[rowIdx - 1]) : null;
              const showTierHeader = !prevCat || prevCat.name !== cat.name;

              return (
                <React.Fragment key={row}>
                  {showTierHeader && (
                    <div className="w-full max-w-xl flex items-center justify-between pt-3 pb-1 border-b border-white/10 text-xs">
                      <span className="uppercase tracking-widest font-bold text-red-400">
                        {cat.name} Tier
                      </span>
                      <span className="text-gray-300 font-semibold">
                        {formatCurrency(cat.price)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="w-6 text-gray-500 text-xs font-bold">{row}</span>
                    <div className="flex gap-1.5">
                      {Array.from({ length: seatsPerRow }, (_, i) => i + 1).map((seatNum) => {
                        const seatId = `${row}${seatNum}`;
                        const isBooked = Boolean(occupiedSeats[seatId]);
                        const isLocked = isSeatLockedByOther(seatId);
                        const isSelected = selectedSeats.includes(seatId);
                        const aisleGap = seatNum === Math.floor(seatsPerRow / 2) ? "mr-4" : "";

                        let seatClasses =
                          "bg-zinc-900 border border-zinc-700 hover:border-red-500 text-gray-300 cursor-pointer";
                        if (isBooked) {
                          seatClasses =
                            "bg-zinc-700/80 border border-zinc-700 text-zinc-500 cursor-not-allowed";
                        } else if (isLocked) {
                          seatClasses =
                            "bg-amber-500/25 border border-amber-500/60 text-amber-300 cursor-not-allowed";
                        } else if (isSelected) {
                          seatClasses =
                            "bg-red-600 border border-red-500 text-white font-bold shadow-[0_0_12px_rgba(220,38,38,0.6)] cursor-pointer";
                        }

                        return (
                          <button
                            key={seatId}
                            type="button"
                            onClick={() => toggleSeat(seatId)}
                            disabled={isBooked || isLocked}
                            title={`${seatId} (${cat.name} - ${formatCurrency(cat.price)})`}
                            className={`w-8 h-8 rounded text-xs transition-all ${aisleGap} ${seatClasses}`}
                          >
                            {seatNum}
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-6 text-gray-500 text-xs font-bold text-right">
                      {row}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Booking Summary</h3>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
              {paymentConfig?.mode || "RAZORPAY TEST MODE"}
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Selected Seats</span>
              <span className="font-semibold text-white text-right">
                {selectedSeatDetails.length > 0
                  ? selectedSeatDetails
                      .map((s) => `${s.seatId} (${s.category})`)
                      .join(", ")
                  : "None selected"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Ticket Count</span>
              <span>{selectedSeatDetails.length}</span>
            </div>

            <div className="border-t border-zinc-800 pt-4 mt-4 flex justify-between items-center">
              <span className="font-bold text-base">Total Payable</span>
              <span className="font-black text-red-500 text-2xl">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          {!user ? (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 mb-3">
                Sign in with Clerk to lock seats and complete checkout.
              </p>
              <AuthSignInButton mode="modal">
                <button className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer">
                  Sign In to Book Tickets
                </button>
              </AuthSignInButton>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleProceedToPayment}
              disabled={selectedSeats.length === 0 || busyAction}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                selectedSeats.length > 0 && !busyAction
                  ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-[0_0_25px_rgba(220,38,38,0.4)]"
                  : "bg-zinc-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Lock className="w-4 h-4" />
              {busyAction
                ? "Locking Seats..."
                : selectedSeats.length > 0
                ? `Lock Seats & Proceed to Payment (${formatCurrency(totalPrice)})`
                : "Select Seats to Continue"}
            </button>
          )}
        </div>
      </div>

      {/* Active Seat Lock & Checkout Modal (Razorpay Test Mode or Simulated Fallback) */}
      {pendingBooking && paymentOrder && (
        <div className="fixed inset-0 z-[95] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-950 border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl">
            {/* Explicit Mode Banner */}
            <div className="bg-amber-500/20 border-b border-amber-500/30 px-5 py-3 flex items-center gap-2.5 text-amber-300 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {paymentOrder.isSimulated
                  ? "DEVELOPMENT MODE — SIMULATED PAYMENT ADAPTER (NO REAL CHARGE)"
                  : paymentOrder.isTestMode
                  ? "RAZORPAY TEST MODE — TEST CREDENTIALS ONLY (NO REAL MONEY CHARGED)"
                  : "RAZORPAY SECURE CHECKOUT"}
              </span>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl font-bold text-white">
                    {paymentOrder.isSimulated ? "Simulated Checkout" : "Razorpay Checkout"}
                  </h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-red-600/20 border border-red-600/40 text-red-300 text-xs font-mono font-bold">
                  Lock expires in {formatTimer(secondsLeft)}
                </div>
              </div>

              <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Movie</span>
                  <span className="font-semibold text-white">
                    {pendingBooking.movieSnapshot?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Theater</span>
                  <span className="text-gray-200">{pendingBooking.theatreSnapshot?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Locked Seats</span>
                  <span className="text-white font-semibold">
                    {pendingBooking.bookedSeats?.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Booking Status</span>
                  <span className="text-amber-400 font-mono text-xs font-bold">
                    {pendingBooking.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Gateway</span>
                  <span className="text-amber-300 font-mono text-xs font-semibold">
                    {paymentOrder.mode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID</span>
                  <span className="text-gray-300 font-mono text-xs">
                    {paymentOrder.orderId}
                  </span>
                </div>
                <div className="border-t border-zinc-800 pt-2.5 flex justify-between items-center">
                  <span className="font-bold text-white">Server-Verified Amount</span>
                  <span className="text-xl font-black text-red-500">
                    {formatCurrency(pendingBooking.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/10 text-xs text-gray-300 space-y-1.5">
                <p className="flex items-center gap-1.5 text-white font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Server-Verified Transaction Flow
                </p>
                <p>
                  {paymentOrder.isSimulated
                    ? "Choose an outcome below to test backend verification, booking transitions, and automatic lock release."
                    : "Your order was created via Razorpay's Orders API using backend-calculated ticket prices. Your booking will only confirm after server-side HMAC-SHA256 signature verification."}
                </p>
              </div>

              {paymentOrder.isSimulated ? (
                <>
                  {/* Simulated Failure Reason Picker */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">
                      Failure Scenario (if testing failed payment):
                    </label>
                    <select
                      value={failureReason}
                      onChange={(e) => setFailureReason(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="Bank declined transaction (Simulated)">
                        Bank declined transaction (Simulated)
                      </option>
                      <option value="Insufficient funds (Simulated)">
                        Insufficient funds (Simulated)
                      </option>
                      <option value="UPI / Gateway timeout (Simulated)">
                        UPI / Gateway timeout (Simulated)
                      </option>
                    </select>
                  </div>

                  {/* Simulated Action Buttons */}
                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      disabled={busyAction}
                      onClick={() => handleSimulatePayment("success")}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      {busyAction ? "Verifying on Server..." : "Simulate Successful Payment"}
                    </button>

                    <button
                      type="button"
                      disabled={busyAction}
                      onClick={() => handleSimulatePayment("failed")}
                      className="w-full py-3 bg-red-600/20 hover:bg-red-600/35 border border-red-600/40 disabled:opacity-50 text-red-300 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Simulate Failed Payment (Releases Seats)
                    </button>

                    <button
                      type="button"
                      disabled={busyAction}
                      onClick={handleCancelCheckout}
                      className="w-full py-2.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel & Release Seat Lock
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    disabled={busyAction || verifyingPayment}
                    onClick={() => openRazorpayCheckout(pendingBooking, paymentOrder)}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                  >
                    <CreditCard className="w-5 h-5" />
                    {verifyingPayment
                      ? "Verifying Razorpay Signature on Server..."
                      : `Pay Now with Razorpay (${formatCurrency(pendingBooking.totalAmount)})`}
                  </button>

                  <button
                    type="button"
                    disabled={busyAction || verifyingPayment}
                    onClick={handleCancelCheckout}
                    className="w-full py-2.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel & Release Seat Lock
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Digital Ticket Modal shown immediately after verified payment */}
      <DigitalTicketModal
        booking={confirmedTicket}
        onClose={() => {
          setConfirmedTicket(null);
          navigate("/mybookings");
        }}
      />
    </div>
  );
};

export default SeatLayout;
