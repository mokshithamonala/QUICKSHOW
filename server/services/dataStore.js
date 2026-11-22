import crypto from "crypto";
import { isDbConnected } from "../configs/db.js";
import User from "../models/user.js";
import Theatre from "../models/theatre.js";
import Show from "../models/show.js";
import Booking from "../models/booking.js";
import WebhookEvent from "../models/webhookEvent.js";
import { getMaheshBabuUniverse, getMoviesByCategory, isTmdbConfigured } from "./tmdbService.js";

export const SEAT_LOCK_DURATION_MS = 7 * 60 * 1000; // 7 minutes

// ==========================================
// Automatic Development Fallback Store
// Used ONLY when MONGODB_URI is unset or unreachable.
// ==========================================
const memStore = {
  users: new Map(),
  theatres: new Map(),
  shows: new Map(),
  bookings: new Map(),
  webhookEvents: new Map(),
  seeded: false,
};

const makeId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;

export const generateBookingCode = () =>
  `QS-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

const DEFAULT_CATEGORIES = [
  { name: "Silver", rows: ["A", "B", "C"], defaultPrice: 180, price: 180 },
  { name: "Gold", rows: ["D", "E", "F"], defaultPrice: 250, price: 250 },
  { name: "Recliner", rows: ["G", "H"], defaultPrice: 400, price: 400 },
];

const DEFAULT_THEATRES = [
  {
    name: "AMB Cinemas (Asian Mahesh Babu)",
    city: "Hyderabad",
    address: "Gachibowli - Miyapur Rd, Kondapur, Hyderabad, Telangana",
    amenities: ["Dolby Atmos", "Barco Laser 4K", "M-Lounge VIP", "Recliners"],
    screens: [
      {
        name: "Screen 1 - M-Lounge Laser",
        rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
        seatsPerRow: 12,
        categories: DEFAULT_CATEGORIES.map(({ name, rows, defaultPrice }) => ({
          name,
          rows,
          defaultPrice,
        })),
      },
      {
        name: "Screen 2 - Dolby Atmos",
        rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
        seatsPerRow: 12,
        categories: DEFAULT_CATEGORIES.map(({ name, rows, defaultPrice }) => ({
          name,
          rows,
          defaultPrice,
        })),
      },
    ],
    isActive: true,
  },
  {
    name: "Prasads Multiplex (PCX)",
    city: "Hyderabad",
    address: "NTR Gardens, Necklace Road, Hyderabad, Telangana",
    amenities: ["PCX Large Format", "Dolby Atmos", "4K Dual Projection", "Food Court"],
    screens: [
      {
        name: "PCX Screen - Giant Format",
        rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
        seatsPerRow: 12,
        categories: [
          { name: "Silver", rows: ["A", "B", "C"], defaultPrice: 200 },
          { name: "Gold", rows: ["D", "E", "F"], defaultPrice: 295 },
          { name: "Recliner", rows: ["G", "H"], defaultPrice: 450 },
        ],
      },
    ],
    isActive: true,
  },
  {
    name: "PVR ICON: Next Galleria",
    city: "Hyderabad",
    address: "Panjagutta Metro Station, Hyderabad, Telangana",
    amenities: ["IMAX Laser", "Dolby Atmos", "Gourmet Snacks", "Wheelchair Access"],
    screens: [
      {
        name: "Audi 1 - IMAX",
        rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
        seatsPerRow: 12,
        categories: [
          { name: "Silver", rows: ["A", "B", "C"], defaultPrice: 220 },
          { name: "Gold", rows: ["D", "E", "F"], defaultPrice: 320 },
          { name: "Recliner", rows: ["G", "H"], defaultPrice: 480 },
        ],
      },
    ],
    isActive: true,
  },
  {
    name: "INOX Varun Beach",
    city: "Visakhapatnam",
    address: "Beach Road, Krishna Nagar, Visakhapatnam, Andhra Pradesh",
    amenities: ["Dolby 7.1", "Sea View Lounge", "4K Digital", "Recliners"],
    screens: [
      {
        name: "Screen 1 - Coastal Laser",
        rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
        seatsPerRow: 12,
        categories: DEFAULT_CATEGORIES.map(({ name, rows, defaultPrice }) => ({
          name,
          rows,
          defaultPrice,
        })),
      },
    ],
    isActive: true,
  },
];

// Normalize Mongoose Map or plain object to plain JS object
const mapToPlain = (val) => {
  if (!val) return {};
  if (val instanceof Map) return Object.fromEntries(val.entries());
  if (typeof val.toObject === "function") return val.toObject();
  return { ...val };
};

export const getSeatPriceInfo = (show, seatId) => {
  const row = String(seatId).charAt(0).toUpperCase();
  const categories = show.seatCategories || [];
  const matched = categories.find((cat) => (cat.rows || []).includes(row));
  if (matched) {
    return { category: matched.name, price: Number(matched.price) };
  }
  return { category: "Standard", price: Number(show.showPrice || 250) };
};

// ==========================================
// Automatic Initial Seeding (Theatres + Real TMDB Upcoming Shows)
// ==========================================
let seedingPromise = null;

export const ensureInitialSeed = async () => {
  if (seedingPromise) return seedingPromise;

  seedingPromise = (async () => {
    try {
      const existingTheatres = await listTheatres();
      if (existingTheatres.length > 0) return;

      const createdTheatres = [];
      for (const t of DEFAULT_THEATRES) {
        const created = await createTheatre(t);
        createdTheatres.push(created);
      }

      // Fetch real TMDB movies (Mahesh Babu hits + Now Playing) to seed real bookable shows
      let seedMovies = [];
      if (isTmdbConfigured()) {
        const [mbRes, npRes] = await Promise.allSettled([
          getMaheshBabuUniverse(),
          getMoviesByCategory("now_playing", 1),
        ]);
        if (mbRes.status === "fulfilled" && mbRes.value?.movies?.length) {
          const withPosters = mbRes.value.movies.filter((m) => m.poster_path);
          const athadu = withPosters.find((m) => Number(m.id) === 37172);
          const curatedSeed = withPosters
            .slice(0, 4)
            .map((m) => (Number(m.id) === 679919 && athadu ? athadu : m));
          seedMovies.push(...curatedSeed);
        }
        if (npRes.status === "fulfilled" && npRes.value?.results?.length) {
          seedMovies.push(...npRes.value.results.filter((m) => m.poster_path).slice(0, 4));
        }
      }

      // Deduplicate by TMDB ID
      const uniqueMovies = [];
      const seenIds = new Set();
      for (const m of seedMovies) {
        if (!seenIds.has(m.id)) {
          seenIds.add(m.id);
          uniqueMovies.push(m);
        }
      }

      if (uniqueMovies.length === 0) return;

      // Schedule upcoming shows across the next 4 days for these movies
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const showHours = [
        { h: 10, m: 30 },
        { h: 14, m: 15 },
        { h: 18, m: 0 },
        { h: 21, m: 30 },
      ];

      for (let mIdx = 0; mIdx < Math.min(uniqueMovies.length, 6); mIdx++) {
        const movie = uniqueMovies[mIdx];
        // Put each movie in 2 theatres across 3 upcoming days
        const chosenTheatres = [
          createdTheatres[mIdx % createdTheatres.length],
          createdTheatres[(mIdx + 1) % createdTheatres.length],
        ];

        for (const theatre of chosenTheatres) {
          const screen = theatre.screens[0];
          const seatCategories = (screen.categories || DEFAULT_CATEGORIES).map((c) => ({
            name: c.name,
            rows: c.rows,
            price: c.defaultPrice || c.price || 220,
          }));
          const dateTimes = [];
          for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
            for (const slot of showHours.slice(0, 3)) {
              const dt = new Date(today);
              dt.setDate(dt.getDate() + dayOffset);
              dt.setHours(slot.h, slot.m, 0, 0);
              if (dt.getTime() > Date.now() - 30 * 60 * 1000) {
                dateTimes.push(dt.toISOString());
              }
            }
          }

          if (dateTimes.length > 0) {
            await createShowsBatch({
              movie,
              theatreId: String(theatre._id),
              screenName: screen.name,
              showPrice: seatCategories[1]?.price || 250,
              seatCategories,
              dateTimes,
            });
          }
        }
      }

      console.log(`🎬 Seeded ${createdTheatres.length} theatres and upcoming shows for ${Math.min(uniqueMovies.length, 6)} TMDB movies.`);
    } catch (err) {
      console.warn("⚠️ Initial show seeding skipped:", err.message);
    } finally {
      seedingPromise = null;
    }
  })();

  return seedingPromise;
};

// ==========================================
// USER OPERATIONS
// ==========================================
export const upsertUser = async ({ _id, name, email, image, role }) => {
  if (!_id) return null;

  if (isDbConnected()) {
    const update = {
      name: name || "QuickShow User",
      email: email || "",
      image: image || "",
    };
    if (role) update.role = role;

    const user = await User.findOneAndUpdate(
      { _id },
      { $set: update, $setOnInsert: { favorites: [] } },
      { upsert: true, new: true }
    ).lean();
    return user;
  }

  const existing = memStore.users.get(_id);
  const user = {
    _id,
    name: name || existing?.name || "QuickShow User",
    email: email || existing?.email || "",
    image: image || existing?.image || "",
    role: role || existing?.role || "user",
    favorites: existing?.favorites || [],
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  };
  memStore.users.set(_id, user);
  return user;
};

export const getUserById = async (userId) => {
  if (!userId) return null;
  if (isDbConnected()) {
    return User.findById(userId).lean();
  }
  return memStore.users.get(userId) || null;
};

export const countUsers = async () => {
  if (isDbConnected()) {
    return User.countDocuments();
  }
  return memStore.users.size;
};

export const toggleUserFavorite = async (userId, movieData) => {
  const tmdbId = Number(movieData.tmdbId || movieData.id);
  if (!tmdbId) throw new Error("Valid TMDB movie ID is required");

  const entry = {
    tmdbId,
    title: movieData.title || "Untitled",
    poster_path: movieData.poster_path || "",
    backdrop_path: movieData.backdrop_path || "",
    release_date: movieData.release_date || "",
    vote_average: Number(movieData.vote_average || 0),
    genres: Array.isArray(movieData.genres) ? movieData.genres : [],
    addedAt: new Date(),
  };

  if (isDbConnected()) {
    let user = await User.findById(userId);
    if (!user) {
      user = await User.create({ _id: userId, favorites: [] });
    }
    const idx = user.favorites.findIndex((f) => Number(f.tmdbId) === tmdbId);
    let isFavorite = false;
    if (idx >= 0) {
      user.favorites.splice(idx, 1);
      isFavorite = false;
    } else {
      user.favorites.unshift(entry);
      isFavorite = true;
    }
    await user.save();
    return { isFavorite, favorites: user.favorites };
  }

  const existing = memStore.users.get(userId) || {
    _id: userId,
    name: "QuickShow User",
    email: "",
    image: "",
    role: "user",
    favorites: [],
  };
  const idx = existing.favorites.findIndex((f) => Number(f.tmdbId) === tmdbId);
  let isFavorite = false;
  if (idx >= 0) {
    existing.favorites.splice(idx, 1);
    isFavorite = false;
  } else {
    existing.favorites.unshift(entry);
    isFavorite = true;
  }
  memStore.users.set(userId, existing);
  return { isFavorite, favorites: existing.favorites };
};

// ==========================================
// THEATRE OPERATIONS
// ==========================================
export const listTheatres = async () => {
  if (isDbConnected()) {
    return Theatre.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  }
  return Array.from(memStore.theatres.values()).filter((t) => t.isActive !== false);
};

export const getTheatreById = async (id) => {
  if (isDbConnected()) {
    return Theatre.findById(id).lean();
  }
  return memStore.theatres.get(String(id)) || null;
};

export const createTheatre = async (payload) => {
  const data = {
    name: payload.name,
    city: payload.city,
    address: payload.address,
    amenities:
      Array.isArray(payload.amenities) && payload.amenities.length > 0
        ? payload.amenities
        : ["Dolby Atmos", "4K Laser", "Recliners"],
    screens:
      Array.isArray(payload.screens) && payload.screens.length > 0
        ? payload.screens
        : [
            {
              name: "Screen 1",
              rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
              seatsPerRow: 12,
              categories: DEFAULT_CATEGORIES.map(({ name, rows, defaultPrice }) => ({
                name,
                rows,
                defaultPrice,
              })),
            },
          ],
    isActive: true,
  };

  if (isDbConnected()) {
    const doc = await Theatre.create(data);
    return doc.toObject();
  }

  const record = {
    _id: makeId("th"),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memStore.theatres.set(record._id, record);
  return record;
};

export const deleteTheatre = async (id) => {
  if (isDbConnected()) {
    return Theatre.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
  }
  const existing = memStore.theatres.get(String(id));
  if (!existing) return null;
  existing.isActive = false;
  return existing;
};

// ==========================================
// SHOW OPERATIONS & AUTOMATIC SEAT LOCK EXPIRY
// ==========================================
const cleanExpiredLocksObject = (seatLocksObj) => {
  const now = Date.now();
  const active = {};
  const expiredBookingIds = [];
  for (const [seatId, lock] of Object.entries(seatLocksObj || {})) {
    if (!lock) continue;
    const exp = new Date(lock.expiresAt).getTime();
    if (exp > now) {
      active[seatId] = lock;
    } else if (lock.bookingId) {
      expiredBookingIds.push(lock.bookingId);
    }
  }
  return { active, expiredBookingIds };
};

export const purgeExpiredLocksForShow = async (showId) => {
  const now = new Date();
  if (isDbConnected()) {
    const show = await Show.findById(showId);
    if (!show) return null;
    const locks = mapToPlain(show.seatLocks);
    const { active, expiredBookingIds } = cleanExpiredLocksObject(locks);

    if (Object.keys(active).length !== Object.keys(locks).length) {
      show.seatLocks = active;
      await show.save();
    }

    if (expiredBookingIds.length > 0) {
      await Booking.updateMany(
        { _id: { $in: expiredBookingIds }, status: "PENDING_PAYMENT" },
        { $set: { status: "EXPIRED" } }
      );
    }
    return show.toObject();
  }

  const show = memStore.shows.get(String(showId));
  if (!show) return null;
  const { active, expiredBookingIds } = cleanExpiredLocksObject(show.seatLocks);
  show.seatLocks = active;
  for (const bId of expiredBookingIds) {
    const b = memStore.bookings.get(String(bId));
    if (b && b.status === "PENDING_PAYMENT") {
      b.status = "EXPIRED";
      b.updatedAt = now;
    }
  }
  return show;
};

const formatShowPublic = (showDoc) => {
  if (!showDoc) return null;
  const occupiedSeats = mapToPlain(showDoc.occupiedSeats);
  const rawLocks = mapToPlain(showDoc.seatLocks);
  const { active: activeLocks } = cleanExpiredLocksObject(rawLocks);

  return {
    ...showDoc,
    _id: String(showDoc._id),
    occupiedSeats,
    seatLocks: activeLocks,
  };
};

export const createShowsBatch = async ({
  movie,
  theatreId,
  screenName,
  showPrice,
  seatCategories,
  dateTimes,
}) => {
  const theatre = await getTheatreById(theatreId);
  if (!theatre) throw new Error("Selected theatre not found");

  const screen =
    (theatre.screens || []).find((s) => s.name === screenName) || theatre.screens?.[0];
  if (!screen) throw new Error("Selected screen not found in theatre");

  const resolvedCategories =
    Array.isArray(seatCategories) && seatCategories.length > 0
      ? seatCategories.map((c) => ({
          name: c.name,
          rows: c.rows,
          price: Number(c.price || showPrice || 250),
        }))
      : (screen.categories || DEFAULT_CATEGORIES).map((c) => ({
          name: c.name,
          rows: c.rows,
          price: Number(c.defaultPrice || showPrice || 250),
        }));

  const created = [];
  for (const dt of dateTimes) {
    const showDateTime = new Date(dt);
    if (Number.isNaN(showDateTime.getTime())) continue;

    const showPayload = {
      tmdbMovieId: Number(movie.id),
      movie: {
        id: Number(movie.id),
        title: movie.title,
        poster_path: movie.poster_path || "",
        backdrop_path: movie.backdrop_path || "",
        overview: movie.overview || "",
        release_date: movie.release_date || "",
        runtime: Number(movie.runtime || 150),
        vote_average: Number(movie.vote_average || 0),
        vote_count: Number(movie.vote_count || 0),
        genres: Array.isArray(movie.genres) ? movie.genres : [],
        original_language: movie.original_language || "te",
      },
      theatreId: String(theatre._id),
      theatreSnapshot: {
        _id: String(theatre._id),
        name: theatre.name,
        city: theatre.city,
        address: theatre.address,
      },
      screenName: screen.name,
      rows: screen.rows || ["A", "B", "C", "D", "E", "F", "G", "H"],
      seatsPerRow: screen.seatsPerRow || 12,
      showDateTime,
      showPrice: Number(showPrice || resolvedCategories[0]?.price || 250),
      seatCategories: resolvedCategories,
      occupiedSeats: {},
      seatLocks: {},
      status: "active",
    };

    if (isDbConnected()) {
      const doc = await Show.create(showPayload);
      created.push(formatShowPublic(doc.toObject()));
    } else {
      const record = {
        _id: makeId("show"),
        ...showPayload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memStore.shows.set(record._id, record);
      created.push(formatShowPublic(record));
    }
  }

  return created;
};

export const listShows = async ({ tmdbMovieId, theatreId, includePast = false } = {}) => {
  const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000); // keep shows up to 3h after start

  if (isDbConnected()) {
    const query = { status: "active" };
    if (tmdbMovieId) query.tmdbMovieId = Number(tmdbMovieId);
    if (theatreId) query.theatreId = String(theatreId);
    if (!includePast) query.showDateTime = { $gte: cutoff };

    const docs = await Show.find(query).sort({ showDateTime: 1 }).lean();
    return docs.map(formatShowPublic);
  }

  let arr = Array.from(memStore.shows.values()).filter((s) => s.status === "active");
  if (tmdbMovieId) arr = arr.filter((s) => Number(s.tmdbMovieId) === Number(tmdbMovieId));
  if (theatreId) arr = arr.filter((s) => String(s.theatreId) === String(theatreId));
  if (!includePast) {
    arr = arr.filter((s) => new Date(s.showDateTime).getTime() >= cutoff.getTime());
  }
  return arr
    .sort((a, b) => new Date(a.showDateTime) - new Date(b.showDateTime))
    .map(formatShowPublic);
};

export const getShowById = async (showId) => {
  const cleaned = await purgeExpiredLocksForShow(showId);
  return formatShowPublic(cleaned);
};

export const deleteShow = async (showId) => {
  if (isDbConnected()) {
    return Show.findByIdAndUpdate(showId, { status: "cancelled" }, { new: true }).lean();
  }
  const existing = memStore.shows.get(String(showId));
  if (!existing) return null;
  existing.status = "cancelled";
  return existing;
};

// ==========================================
// CONCURRENCY-SAFE SEAT LOCKING & BOOKING LIFECYCLE
// ==========================================
export const lockSeatsAndCreateBooking = async ({
  showId,
  seatIds,
  userId,
  userSnapshot,
}) => {
  const uniqueSeats = [...new Set(seatIds.map((s) => String(s).trim().toUpperCase()))];
  if (uniqueSeats.length === 0 || uniqueSeats.length > 10) {
    throw Object.assign(new Error("Select between 1 and 10 seats per booking."), {
      status: 400,
    });
  }

  const show = await purgeExpiredLocksForShow(showId);
  if (!show || show.status !== "active") {
    throw Object.assign(new Error("Show not found or no longer active."), {
      status: 404,
    });
  }

  // Validate seat coordinates belong to this screen layout
  const validRows = new Set(show.rows || ["A", "B", "C", "D", "E", "F", "G", "H"]);
  const maxCol = show.seatsPerRow || 12;
  for (const seatId of uniqueSeats) {
    const row = seatId.charAt(0);
    const num = Number(seatId.slice(1));
    if (!validRows.has(row) || !Number.isInteger(num) || num < 1 || num > maxCol) {
      throw Object.assign(new Error(`Invalid seat coordinate: ${seatId}`), {
        status: 400,
      });
    }
  }

  const lockId = makeId("lock");
  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + SEAT_LOCK_DURATION_MS);
  const bookingCode = generateBookingCode();

  const seatDetails = uniqueSeats.map((seatId) => {
    const { category, price } = getSeatPriceInfo(show, seatId);
    return { seatId, category, price };
  });
  const totalAmount = seatDetails.reduce((sum, s) => sum + s.price, 0);

  if (isDbConnected()) {
    // Atomic MongoDB check: NONE of the requested seats can be occupied OR actively locked by another user
    const availabilityConditions = uniqueSeats.map((seatId) => ({
      [`occupiedSeats.${seatId}`]: { $exists: false },
      $or: [
        { [`seatLocks.${seatId}`]: { $exists: false } },
        { [`seatLocks.${seatId}.expiresAt`]: { $lte: now } },
        { [`seatLocks.${seatId}.userId`]: userId },
      ],
    }));

    const bookingDoc = new Booking({
      bookingCode,
      userId,
      userSnapshot: userSnapshot || { name: "QuickShow User", email: "" },
      showId: String(show._id),
      movieSnapshot: show.movie,
      theatreSnapshot: show.theatreSnapshot,
      screenName: show.screenName,
      showDateTime: show.showDateTime,
      seats: seatDetails,
      bookedSeats: uniqueSeats,
      totalAmount,
      currency: "INR",
      status: "PENDING_PAYMENT",
      isPaid: false,
      lockId,
      lockExpiresAt,
      payment: {
        provider: "razorpay_test",
        mode: "RAZORPAY TEST MODE",
        isSimulated: false,
        isTestMode: true,
        isRealTransaction: false,
        amountPaise: Math.round(totalAmount * 100),
        status: "CREATED",
        webhookEvents: [],
      },
    });

    const lockUpdate = {};
    for (const seatId of uniqueSeats) {
      lockUpdate[`seatLocks.${seatId}`] = {
        userId,
        lockId,
        bookingId: String(bookingDoc._id),
        expiresAt: lockExpiresAt,
      };
    }

    const updatedShow = await Show.findOneAndUpdate(
      { _id: show._id, status: "active", $and: availabilityConditions },
      { $set: lockUpdate },
      { new: true }
    );

    if (!updatedShow) {
      throw Object.assign(
        new Error(
          "One or more selected seats were just booked or locked by another customer. Please pick different seats."
        ),
        { status: 409 }
      );
    }

    await bookingDoc.save();
    return bookingDoc.toObject();
  }

  // Concurrency-safe synchronous check in Node single-thread fallback store
  const memShow = memStore.shows.get(String(showId));
  for (const seatId of uniqueSeats) {
    if (memShow.occupiedSeats[seatId]) {
      throw Object.assign(
        new Error(`Seat ${seatId} is already booked. Please pick another seat.`),
        { status: 409 }
      );
    }
    const existingLock = memShow.seatLocks[seatId];
    if (
      existingLock &&
      new Date(existingLock.expiresAt).getTime() > now.getTime() &&
      existingLock.userId !== userId
    ) {
      throw Object.assign(
        new Error(`Seat ${seatId} is currently locked by another user. Please choose another seat.`),
        { status: 409 }
      );
    }
  }

  const bookingId = makeId("bk");
  for (const seatId of uniqueSeats) {
    memShow.seatLocks[seatId] = {
      userId,
      lockId,
      bookingId,
      expiresAt: lockExpiresAt,
    };
  }

  const booking = {
    _id: bookingId,
    bookingCode,
    userId,
    userSnapshot: userSnapshot || { name: "QuickShow User", email: "" },
    showId: String(memShow._id),
    movieSnapshot: memShow.movie,
    theatreSnapshot: memShow.theatreSnapshot,
    screenName: memShow.screenName,
    showDateTime: memShow.showDateTime,
    seats: seatDetails,
    bookedSeats: uniqueSeats,
    totalAmount,
    currency: "INR",
    status: "PENDING_PAYMENT",
    isPaid: false,
    lockId,
    lockExpiresAt,
    payment: {
      provider: "razorpay_test",
      mode: "RAZORPAY TEST MODE",
      isSimulated: false,
      isTestMode: true,
      isRealTransaction: false,
      orderId: "",
      paymentId: "",
      signature: "",
      amountPaise: Math.round(totalAmount * 100),
      method: "",
      status: "CREATED",
      failureReason: "",
      verifiedAt: null,
      webhookEvents: [],
    },
    createdAt: now,
    updatedAt: now,
  };

  memStore.bookings.set(bookingId, booking);
  return booking;
};

export const getBookingById = async (bookingId) => {
  if (isDbConnected()) {
    return Booking.findById(bookingId).lean();
  }
  return memStore.bookings.get(String(bookingId)) || null;
};

export const findBookingByOrderId = async (orderId) => {
  if (!orderId) return null;
  if (isDbConnected()) {
    return Booking.findOne({ "payment.orderId": String(orderId) }).lean();
  }
  for (const b of memStore.bookings.values()) {
    if (b.payment?.orderId === String(orderId)) return b;
  }
  return null;
};

export const updateBookingOrder = async (bookingId, paymentOrder) => {
  const isSimulated = Boolean(paymentOrder.isSimulated);
  const isTestMode = Boolean(paymentOrder.isTestMode);
  const isRealTransaction = Boolean(paymentOrder.isRealTransaction);
  const amountPaise =
    Number(paymentOrder.amountPaise) || Math.round(Number(paymentOrder.amount || 0) * 100);

  const update = {
    "payment.provider": paymentOrder.provider,
    "payment.mode": paymentOrder.mode,
    "payment.isSimulated": isSimulated,
    "payment.isTestMode": isTestMode,
    "payment.isRealTransaction": isRealTransaction,
    "payment.orderId": paymentOrder.orderId,
    "payment.amountPaise": amountPaise,
    "payment.status": "CREATED",
  };

  if (isDbConnected()) {
    return Booking.findByIdAndUpdate(bookingId, { $set: update }, { new: true }).lean();
  }
  const b = memStore.bookings.get(String(bookingId));
  if (!b) return null;
  b.payment = {
    ...b.payment,
    provider: paymentOrder.provider,
    mode: paymentOrder.mode,
    isSimulated,
    isTestMode,
    isRealTransaction,
    orderId: paymentOrder.orderId,
    amountPaise,
    status: "CREATED",
  };
  b.updatedAt = new Date();
  return b;
};

export const releaseBookingLock = async (
  bookingId,
  newStatus = "CANCELLED",
  failureReason = "",
  { paymentId = "", webhookEventId = "" } = {}
) => {
  const booking = await getBookingById(bookingId);
  if (!booking) return null;

  // Never downgrade an already CONFIRMED & PAID booking
  if (booking.status === "CONFIRMED" && booking.isPaid) {
    return booking;
  }

  if (booking.status !== "PENDING_PAYMENT") {
    return booking;
  }

  if (isDbConnected()) {
    const unsetLocks = {};
    for (const seatId of booking.bookedSeats) {
      unsetLocks[`seatLocks.${seatId}`] = "";
    }
    await Show.findOneAndUpdate(
      { _id: booking.showId },
      { $unset: unsetLocks }
    );

    const setFields = {
      status: newStatus,
      "payment.status": newStatus === "FAILED" ? "FAILED" : "CANCELLED",
      "payment.failureReason": failureReason || "",
    };
    if (paymentId) setFields["payment.paymentId"] = paymentId;

    const updateOps = { $set: setFields };
    if (webhookEventId) {
      updateOps.$addToSet = { "payment.webhookEvents": webhookEventId };
    }

    const updated = await Booking.findByIdAndUpdate(bookingId, updateOps, {
      new: true,
    }).lean();
    return updated;
  }

  const memShow = memStore.shows.get(String(booking.showId));
  if (memShow) {
    for (const seatId of booking.bookedSeats) {
      if (memShow.seatLocks[seatId]?.lockId === booking.lockId) {
        delete memShow.seatLocks[seatId];
      }
    }
  }

  const memBooking = memStore.bookings.get(String(bookingId));
  memBooking.status = newStatus;
  memBooking.payment.status = newStatus === "FAILED" ? "FAILED" : "CANCELLED";
  memBooking.payment.failureReason = failureReason || "";
  if (paymentId) memBooking.payment.paymentId = paymentId;
  if (webhookEventId) {
    memBooking.payment.webhookEvents = Array.from(
      new Set([...(memBooking.payment.webhookEvents || []), webhookEventId])
    );
  }
  memBooking.updatedAt = new Date();
  return memBooking;
};

export const confirmBookingAfterVerifiedPayment = async ({
  bookingId,
  paymentId,
  signature = "",
  verifiedAt,
  amountPaise,
  method = "",
  webhookEventId = "",
  allowWebhookGrace = false,
}) => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw Object.assign(new Error("Booking not found"), { status: 404 });
  }

  // Duplicate payment / idempotency protection
  if (booking.status === "CONFIRMED" && booking.isPaid) {
    if (webhookEventId) {
      if (isDbConnected()) {
        await Booking.findByIdAndUpdate(bookingId, {
          $addToSet: { "payment.webhookEvents": webhookEventId },
        });
      } else {
        const mb = memStore.bookings.get(String(bookingId));
        if (mb) {
          mb.payment.webhookEvents = Array.from(
            new Set([...(mb.payment.webhookEvents || []), webhookEventId])
          );
        }
      }
    }
    return { booking, alreadyConfirmed: true };
  }

  const canRecoverViaWebhook =
    allowWebhookGrace && (booking.status === "EXPIRED" || booking.status === "PENDING_PAYMENT");

  if (booking.status !== "PENDING_PAYMENT" && !canRecoverViaWebhook) {
    throw Object.assign(
      new Error(`Booking cannot be confirmed from status ${booking.status}.`),
      { status: 409 }
    );
  }

  if (!allowWebhookGrace && new Date(booking.lockExpiresAt).getTime() < Date.now()) {
    await releaseBookingLock(
      bookingId,
      "EXPIRED",
      "Seat reservation lock expired before payment completed."
    );
    throw Object.assign(
      new Error("Your seat lock expired before payment was verified. Please select seats again."),
      { status: 410 }
    );
  }

  const resolvedAmountPaise =
    Number(amountPaise) || booking.payment?.amountPaise || Math.round(Number(booking.totalAmount) * 100);

  if (isDbConnected()) {
    // Check duplicate paymentId across all bookings
    if (paymentId) {
      const dup = await Booking.findOne({
        "payment.paymentId": paymentId,
        _id: { $ne: booking._id },
      }).lean();
      if (dup) {
        throw Object.assign(new Error("Duplicate payment transaction detected."), {
          status: 409,
        });
      }
    }

    // Atomic occupation: ensure none of the seats became occupied concurrently
    const notOccupiedConds = booking.bookedSeats.map((seatId) => ({
      [`occupiedSeats.${seatId}`]: { $exists: false },
    }));

    const occupySet = {};
    const lockUnset = {};
    for (const seatId of booking.bookedSeats) {
      occupySet[`occupiedSeats.${seatId}`] = String(booking._id);
      lockUnset[`seatLocks.${seatId}`] = "";
    }

    const updatedShow = await Show.findOneAndUpdate(
      { _id: booking.showId, $and: notOccupiedConds },
      { $set: occupySet, $unset: lockUnset },
      { new: true }
    );

    if (!updatedShow) {
      await releaseBookingLock(bookingId, "FAILED", "Seat conflict detected during confirmation.");
      throw Object.assign(
        new Error("Seat conflict detected while finalizing booking."),
        { status: 409 }
      );
    }

    const setFields = {
      status: "CONFIRMED",
      isPaid: true,
      "payment.paymentId": paymentId,
      "payment.signature": signature || booking.payment?.signature || "",
      "payment.amountPaise": resolvedAmountPaise,
      "payment.method": method || booking.payment?.method || "",
      "payment.status": "PAID",
      "payment.verifiedAt": verifiedAt || new Date(),
      "payment.failureReason": "",
    };

    const updateOps = { $set: setFields };
    if (webhookEventId) {
      updateOps.$addToSet = { "payment.webhookEvents": webhookEventId };
    }

    const confirmedBooking = await Booking.findByIdAndUpdate(bookingId, updateOps, {
      new: true,
    }).lean();

    return { booking: confirmedBooking, alreadyConfirmed: false };
  }

  // Fallback in-memory atomic confirmation
  const memShow = memStore.shows.get(String(booking.showId));
  if (!memShow) {
    throw Object.assign(new Error("Show not found"), { status: 404 });
  }

  for (const seatId of booking.bookedSeats) {
    if (memShow.occupiedSeats[seatId]) {
      await releaseBookingLock(bookingId, "FAILED", `Seat ${seatId} already occupied.`);
      throw Object.assign(new Error(`Seat ${seatId} was already booked.`), {
        status: 409,
      });
    }
  }

  for (const seatId of booking.bookedSeats) {
    memShow.occupiedSeats[seatId] = String(booking._id);
    delete memShow.seatLocks[seatId];
  }

  const memBooking = memStore.bookings.get(String(bookingId));
  memBooking.status = "CONFIRMED";
  memBooking.isPaid = true;
  memBooking.payment = {
    ...memBooking.payment,
    paymentId,
    signature: signature || memBooking.payment?.signature || "",
    amountPaise: resolvedAmountPaise,
    method: method || memBooking.payment?.method || "",
    status: "PAID",
    verifiedAt: verifiedAt || new Date(),
    failureReason: "",
    webhookEvents: webhookEventId
      ? Array.from(new Set([...(memBooking.payment?.webhookEvents || []), webhookEventId]))
      : memBooking.payment?.webhookEvents || [],
  };
  memBooking.updatedAt = new Date();
  return { booking: memBooking, alreadyConfirmed: false };
};

// ==========================================
// Webhook Idempotency Helpers (MongoDB + Fallback)
// ==========================================
export const claimWebhookEvent = async ({
  eventId,
  provider = "razorpay_test",
  eventType,
  orderId = "",
  paymentId = "",
}) => {
  const key = String(eventId || "").trim();
  if (!key) {
    throw Object.assign(new Error("Missing webhook eventId for idempotency check."), {
      status: 400,
    });
  }

  if (isDbConnected()) {
    try {
      await WebhookEvent.create({
        eventId: key,
        provider,
        eventType,
        orderId,
        paymentId,
        status: "PROCESSING",
        processedAt: new Date(),
      });
      return { duplicate: false };
    } catch (err) {
      if (err?.code === 11000) {
        return { duplicate: true };
      }
      throw err;
    }
  }

  if (memStore.webhookEvents.has(key)) {
    return { duplicate: true };
  }

  memStore.webhookEvents.set(key, {
    eventId: key,
    provider,
    eventType,
    orderId,
    paymentId,
    status: "PROCESSING",
    processedAt: new Date(),
  });
  return { duplicate: false };
};

export const finalizeWebhookEvent = async (eventId, { status = "PROCESSED", bookingId = "", note = "" } = {}) => {
  const key = String(eventId || "").trim();
  if (!key) return;

  if (isDbConnected()) {
    await WebhookEvent.findOneAndUpdate(
      { eventId: key },
      { $set: { status, bookingId: String(bookingId || ""), note, processedAt: new Date() } }
    );
    return;
  }

  const existing = memStore.webhookEvents.get(key);
  if (existing) {
    existing.status = status;
    existing.bookingId = String(bookingId || "");
    existing.note = note;
    existing.processedAt = new Date();
  }
};

export const listBookingsForUser = async (userId) => {
  const now = Date.now();
  if (isDbConnected()) {
    await Booking.updateMany(
      { userId, status: "PENDING_PAYMENT", lockExpiresAt: { $lte: new Date(now) } },
      { $set: { status: "EXPIRED" } }
    );
    return Booking.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  const result = [];
  for (const b of memStore.bookings.values()) {
    if (b.userId === userId) {
      if (b.status === "PENDING_PAYMENT" && new Date(b.lockExpiresAt).getTime() <= now) {
        b.status = "EXPIRED";
      }
      result.push(b);
    }
  }
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const listAllBookings = async ({ status, search } = {}) => {
  const now = Date.now();
  let list = [];
  if (isDbConnected()) {
    await Booking.updateMany(
      { status: "PENDING_PAYMENT", lockExpiresAt: { $lte: new Date(now) } },
      { $set: { status: "EXPIRED" } }
    );
    const query = {};
    if (status && status !== "ALL") query.status = status;
    list = await Booking.find(query).sort({ createdAt: -1 }).lean();
  } else {
    for (const b of memStore.bookings.values()) {
      if (b.status === "PENDING_PAYMENT" && new Date(b.lockExpiresAt).getTime() <= now) {
        b.status = "EXPIRED";
      }
      if (!status || status === "ALL" || b.status === status) {
        list.push(b);
      }
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (b) =>
        b.bookingCode?.toLowerCase().includes(q) ||
        b.movieSnapshot?.title?.toLowerCase().includes(q) ||
        b.userSnapshot?.name?.toLowerCase().includes(q) ||
        b.userSnapshot?.email?.toLowerCase().includes(q) ||
        b.theatreSnapshot?.name?.toLowerCase().includes(q)
    );
  }
  return list;
};

export const getAdminDashboardStats = async () => {
  const [bookings, activeShows, theatres, totalUsers] = await Promise.all([
    listAllBookings(),
    listShows({ includePast: false }),
    listTheatres(),
    countUsers(),
  ]);

  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED" && b.isPaid);
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  return {
    totalBookings: bookings.length,
    confirmedBookings: confirmedBookings.length,
    pendingBookings: bookings.filter((b) => b.status === "PENDING_PAYMENT").length,
    failedBookings: bookings.filter((b) => b.status === "FAILED").length,
    totalRevenue,
    totalUser: totalUsers,
    totalTheaters: theatres.length,
    activeShows,
    recentBookings: bookings.slice(0, 8),
    storageMode: isDbConnected() ? "mongodb" : "dev_fallback",
  };
};
