import mongoose from "mongoose";

let dbConnected = false;

export const isDbConnected = () => dbConnected && mongoose.connection.readyState === 1;

const connectDB = async () => {
  try {
    mongoose.set("bufferCommands", false);

    if (!process.env.MONGODB_URI) {
      console.warn(
        "⚠️  MONGODB_URI is not configured — running with automatic development fallback store."
      );
      dbConnected = false;
      return false;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    dbConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    dbConnected = false;
    console.warn(
      `⚠️  MongoDB Connection Unavailable (${error.message}) — running with automatic development fallback store.`
    );
    return false;
  }
};

export default connectDB;