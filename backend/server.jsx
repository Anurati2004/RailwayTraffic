import express from "express";
import app from "./src/app.jsx";
import { initDB } from "./src/config/db.jsx";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

async function start() {
  await initDB();
  app.listen(PORT, () => console.log(`🚉 Server running at http://localhost:${PORT}`));
}

start().catch(err => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
