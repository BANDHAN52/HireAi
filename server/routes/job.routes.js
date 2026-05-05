// ─────────────────────────────────────────────
// routes/job.routes.js
// Job এর সব API endpoints
// index.js এ /api/jobs prefix দিয়ে connect
// ─────────────────────────────────────────────

import express from "express";
import {
  createJob, getAllJobs, getJobById,
  updateJob, deleteJob, getMyCompanyJobs
} from "../controllers/job.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/jobs — সব jobs দেখো (public, login লাগবে না)
router.get("/", getAllJobs);

// GET /api/jobs/company/my-jobs — Company এর নিজের jobs
// protect = login করা লাগবে
// restrictTo("company") = শুধু company role
router.get("/company/my-jobs", protect, restrictTo("company"), getMyCompanyJobs);

// GET /api/jobs/:id — একটা job এর details (public)
router.get("/:id", getJobById);

// POST /api/jobs — নতুন job post করো (only company)
router.post("/", protect, restrictTo("company"), createJob);

// PUT /api/jobs/:id — Job update করো (only owner company)
router.put("/:id", protect, restrictTo("company"), updateJob);

// DELETE /api/jobs/:id — Job delete করো (only owner company)
router.delete("/:id", protect, restrictTo("company"), deleteJob);

export default router;
