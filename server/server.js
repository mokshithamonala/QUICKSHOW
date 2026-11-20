import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import connectDB, { isDbConnected } from "./configs/db.js";
import { inngest, syncUserFunctions } from "./inngest/index.js";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import movieRoutes from "./routes/movieRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import classicRoutes from "./routes/classicRoutes.js";
import { isClerkServerConfigured, requireAuth } from "./middleware/auth.js";
import { isTmdbConfigured } from "./services/tmdbService.js";
import { getPaymentStatusInfo } from "./services/payment/paymentService.js";
import { ensureInitialSeed } from "./services/dataStore.js";
import { ensureClassicsSeeded } from "./services/classicMovieService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load environment variables from root .env and optional server/.env
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

const clerkReady = isClerkServerConfigured();

// Connect Database then seed initial theatres, TMDB shows, and isolated Watch Free Classics
connectDB().finally(() => {
  ensureInitialSeed();
  ensureClassicsSeeded();
});

// Core Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Health & Status Endpoint (always returns 200 JSON, never triggers auth handshake)
app.get("/api/health", (_req, res) => {
  const payment = getPaymentStatusInfo();
  res.json({
    success: true,
    status: "ok",
    service: "QUICKSHOW API",
    dbConnected: isDbConnected(),
    storageMode: isDbConnected() ? "mongodb" : "dev_fallback",
    clerkConfigured: clerkReady,
    tmdbConfigured: isTmdbConfigured(),
    paymentMode: payment.paymentMode,
    paymentProvider: payment.provider,
    paymentLabel: payment.mode,
    isSimulatedPayment: payment.isSimulated,
    razorpayConfigured: payment.razorpayConfigured,
  });
});

// Clerk Auth Middleware — scoped strictly to /api so HTML/static preview routes
// never trigger Clerk 307 handshake redirects inside iframes or SPAs
if (clerkReady) {
  app.use("/api", clerkMiddleware());
} else {
  console.warn(
    "⚠️  Clerk server keys not configured — protected routes require valid Clerk keys in .env."
  );
  app.use("/api", (req, _res, next) => {
    req.auth = () => ({ userId: null });
    next();
  });
}

// Inngest Endpoint (all 3 Clerk user sync functions registered)
app.use("/api/inngest", serve({ client: inngest, functions: syncUserFunctions }));

// API Routes
app.use("/api/movies", movieRoutes);
app.use("/api/classics", classicRoutes); // Isolated Watch Free Classics collection & rights-verified streams
app.use("/api", showRoutes); // /api/theaters, /api/shows, /api/shows/:showId
app.use("/api", bookingRoutes); // /api/bookings/*, /api/payments/*
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Legacy protected profile route preserved
app.get("/api/profile", requireAuth, (req, res) => {
  res.json({ success: true, message: "Your profile", user: req.authUser });
});

// Serve built React frontend when available (single-port preview & production)
const clientDistPath = path.join(rootDir, "client", "dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ success: false, message: "API route not found" });
    }
    if (req.method === "GET") {
      return res.sendFile(path.join(clientDistPath, "index.html"));
    }
    return next();
  });
} else {
  app.get("/", (_req, res) => {
    res.json({ success: true, message: "QuickShow API is running..." });
  });
}

// Centralized Error Handler
app.use((err, _req, res, _next) => {
  const status = err.status || err.response?.status || 500;
  console.error(`❌ [${status}] Server Error:`, err.message);
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`🚀 QuickShow server running on http://${HOST}:${PORT}`);
  console.log(`🎬 TMDB Live API: ${isTmdbConfigured() ? "ENABLED" : "UNCONFIGURED"}`);
  console.log(`💳 Payment Mode: ${getPaymentStatusInfo().mode}`);
  console.log(`🔗 Inngest endpoint http://${HOST}:${PORT}/api/inngest`);
});