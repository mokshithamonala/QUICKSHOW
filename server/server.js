import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from "./routes/showRoutes.js";

const app = express();
const port = 3000;

try {
  await connectDB();
  console.log('✅ All set up! Starting server...');
  
  app.listen(port, () => console.log(`✅ Server listening at http://localhost:${port}`));
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}}
