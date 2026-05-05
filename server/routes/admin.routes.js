// routes/admin.routes.js
import express from "express";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/stats", protect, restrictTo("admin", "company"), async (req, res, next) => {
  try {
    let stats = {};
    if (req.user.role === "admin") {
      const [totalUsers, totalJobs, totalApplications, seekers, companies] = await Promise.all([
        User.countDocuments(), Job.countDocuments(), Application.countDocuments(),
        User.countDocuments({ role: "seeker" }), User.countDocuments({ role: "company" }),
      ]);
      stats = { totalUsers, totalJobs, totalApplications, seekers, companies };
    } else {
      const jobIds = await Job.find({ company: req.user._id }).distinct("_id");
      const [activeJobs, totalApplications, shortlisted, hired] = await Promise.all([
        Job.countDocuments({ company: req.user._id, status: "open" }),
        Application.countDocuments({ job: { $in: jobIds } }),
        Application.countDocuments({ status: "shortlisted", job: { $in: jobIds } }),
        Application.countDocuments({ status: "hired", job: { $in: jobIds } }),
      ]);
      stats = { activeJobs, totalApplications, shortlisted, hired };
    }
    res.status(200).json({ success: true, stats });
  } catch (error) { next(error); }
});

router.get("/applications-chart", protect, restrictTo("company", "admin"), async (req, res, next) => {
  try {
    const jobIds = await Job.find({ company: req.user._id }).distinct("_id");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const chartData = await Application.aggregate([
      { $match: { job: { $in: jobIds }, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json({ success: true, chartData });
  } catch (error) { next(error); }
});

export default router;
