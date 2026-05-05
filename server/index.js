// ─────────────────────────────────────────────
// index.js — Server এর main entry point
// Command: node index.js  অথবা  npm run dev
// ─────────────────────────────────────────────

import express from "express";       // Express framework import
import cors from "cors";             // CORS — frontend থেকে request আসতে দেবে
import dotenv from "dotenv";         // .env file থেকে secrets load করবে
import mongoose from "mongoose";     // MongoDB connection এর জন্য

// ── সব routes import ──
import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import userRoutes from "./routes/user.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config(); // .env file load করো

const app = express(); // Express app তৈরি করো

// ── Middleware ──
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://hire-ai-six.vercel.app",
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());             // JSON body parse করবে (req.body কাজ করবে)
app.use(express.urlencoded({ extended: true })); // Form data parse করবে

// ── Routes connect করো ──
app.use("/api/auth", authRoutes);               // /api/auth/register, /api/auth/login
app.use("/api/jobs", jobRoutes);               // /api/jobs — job CRUD
app.use("/api/applications", applicationRoutes); // /api/applications — apply করা
app.use("/api/users", userRoutes);             // /api/users — profile
app.use("/api/ai", aiRoutes);                  // /api/ai — AI features
app.use("/api/admin", adminRoutes);            // /api/admin — dashboard stats

// ── Health check route ──
app.get("/", (req, res) => {
  res.json({ message: "HireAI API is running 🚀" });
});

// ── Global error handler ──
// কোনো route থেকে next(error) call হলে এখানে আসবে
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// ── MongoDB connect করো, তারপর server start করো ──
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)   // MongoDB URI .env থেকে নেবে
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Connection fail হলে server বন্ধ করো
  });
