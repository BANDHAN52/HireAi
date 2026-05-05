// ─────────────────────────────────────────────
// routes/auth.routes.js
// Authentication এর সব routes এখানে define করা
// index.js এ /api/auth prefix দিয়ে connect করা আছে
// ─────────────────────────────────────────────

import express from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/register — নতুন user তৈরি
router.post("/register", register);

// POST /api/auth/login — login করো, token পাও
router.post("/login", login);

// GET /api/auth/me — আমি কে? (token দিয়ে জানো)
// protect middleware আগে চলবে, token valid হলে getMe চলবে
router.get("/me", protect, getMe);

export default router;
