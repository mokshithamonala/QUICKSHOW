import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./configs/db.js";
import { inngest } from "./inngest/index.js";
import { serve } from "inngest/express";
import { syncUserCreation } from "./inngestFunctions.js";
import { clerkMiddleware } from "@clerk/express"; // <-- Clerk

const app = express();
const PORT = process.env.PORT || 3000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware()); // <-- Clerk auth

// Inngest Endpoint
app.use("/api/inngest", serve({ client: inngest, functions: [syncUserCreation] }));

// Protected route example
app.get("/profile", (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  res.json({ message: "Your profile", userId });
});

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "QuickShow API is running..." });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 Inngest endpoint http://localhost:${PORT}/api/inngest`);
});