// ─────────────────────────────────────────────
// routes/application.routes.js
// ─────────────────────────────────────────────
import express from "express";
import {
  applyForJob, getMyApplications,
  getJobApplicants, updateApplicationStatus
} from "../controllers/application.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/applications/:jobId/apply — Apply করো (only seeker)
router.post("/:jobId/apply", protect, restrictTo("seeker"), applyForJob);

// GET /api/applications/my-applications — আমার applications (only seeker)
router.get("/my-applications", protect, restrictTo("seeker"), getMyApplications);

// GET /api/applications/job/:jobId — Job এর applicants (only company)
router.get("/job/:jobId", protect, restrictTo("company"), getJobApplicants);

// PUT /api/applications/:id/status — Status update (only company)
router.put("/:id/status", protect, restrictTo("company"), updateApplicationStatus);

export default router;
