import mongoose from "mongoose";
import { env } from "./env.js";

let cachedConnectionPromise;

export const connectDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== "production",
    });
  }

  try {
    await cachedConnectionPromise;
    return mongoose.connection;
  } catch (error) {
    cachedConnectionPromise = null;
    throw error;
  }
};
