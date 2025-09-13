import mongoose from "mongoose";

export async function initDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/train_traffic";
  try {
    await mongoose.connect(uri);
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection error", err);
    process.exit(1);
  }
}
