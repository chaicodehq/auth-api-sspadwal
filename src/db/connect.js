import mongoose, { mongo } from "mongoose";

/**
 * TODO: Connect to MongoDB
 *
 * 1. Check if uri is provided (throw error if not: "MongoDB URI is required")
 * 2. Connect using mongoose.connect(uri)
 * 3. Return mongoose.connection
 */
export async function connectDB(uri) {
  if (!uri) {
    throw new Error("MongoDB URI is required");
  }

  try {
    const conn = await mongoose.connect(uri);
    return conn.connection;
  } catch (error) {
    console.log("Mongodb Connection Failed", error);
    process.exit(1);
  }
}
