// ─────────────────────────────────────────────
// routes/user.routes.js — Profile update
// ─────────────────────────────────────────────
import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.middleware.js";

const userRouter = express.Router();

// GET /api/users/profile — নিজের profile দেখো
userRouter.get("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
});

// PUT /api/users/profile — Profile update করো
userRouter.put("/profile", protect, async (req, res, next) => {
  try {
    // Password এখানে update করতে দেবো না (separate route দরকার)
    const notAllowed = ["password", "email", "role"];
    notAllowed.forEach((field) => delete req.body[field]);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: "Profile updated!", user });
  } catch (error) { next(error); }
});

// GET /api/users/:id — Public profile দেখো
userRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -__v");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
});

export default userRouter;


// ─────────────────────────────────────────────
// routes/ai.routes.js — AI Features
// ─────────────────────────────────────────────
import express from "express";
import { extractSkillsFromJobDescription, analyzeResume } from "../utils/ai.utils.js";
import { protect } from "../middleware/auth.middleware.js";

const aiRouter = express.Router();

// POST /api/ai/extract-skills — Job description থেকে skills extract করো
// Company use করবে job post করার সময়
aiRouter.post("/extract-skills", protect, async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, message: "Description is required." });
    }

    const skills = await extractSkillsFromJobDescription(description);

    res.status(200).json({
      success: true,
      skills,
      message: `${skills.length} skills extracted!`,
    });
  } catch (error) { next(error); }
});

// POST /api/ai/analyze-resume — Resume analyze করো
// Seeker use করবে
aiRouter.post("/analyze-resume", protect, async (req, res, next) => {
  try {
    const { resumeText, targetJobTitle } = req.body;
    if (!resumeText) {
      return res.status(400).json({ success: false, message: "Resume text is required." });
    }

    const analysis = await analyzeResume(resumeText, targetJobTitle);

    res.status(200).json({ success: true, analysis });
  } catch (error) { next(error); }
});

export default aiRouter;


// ─────────────────────────────────────────────
// routes/admin.routes.js — Dashboard Stats
// ─────────────────────────────────────────────
import express from "express";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const adminRouter = express.Router();

// GET /api/admin/stats — Dashboard এর numbers
adminRouter.get("/stats", protect, restrictTo("admin", "company"), async (req, res, next) => {
  try {
    let stats = {};

    if (req.user.role === "admin") {
      // Admin সব দেখতে পাবে
      const [totalUsers, totalJobs, totalApplications, seekers, companies] =
        await Promise.all([
          User.countDocuments(),
          Job.countDocuments(),
          Application.countDocuments(),
          User.countDocuments({ role: "seeker" }),
          User.countDocuments({ role: "company" }),
        ]);
      stats = { totalUsers, totalJobs, totalApplications, seekers, companies };
    } else {
      // Company শুধু নিজের stats দেখবে
      const [activeJobs, totalApplications, shortlisted, hired] = await Promise.all([
        Job.countDocuments({ company: req.user._id, status: "open" }),
        Application.countDocuments({ job: { $in: await Job.find({ company: req.user._id }).distinct("_id") } }),
        Application.countDocuments({ status: "shortlisted", job: { $in: await Job.find({ company: req.user._id }).distinct("_id") } }),
        Application.countDocuments({ status: "hired", job: { $in: await Job.find({ company: req.user._id }).distinct("_id") } }),
      ]);
      stats = { activeJobs, totalApplications, shortlisted, hired };
    }

    res.status(200).json({ success: true, stats });
  } catch (error) { next(error); }
});

// GET /api/admin/applications-chart — Daily applications (last 7 days)
// Bar chart এর data
adminRouter.get("/applications-chart", protect, restrictTo("company"), async (req, res, next) => {
  try {
    const companyJobs = await Job.find({ company: req.user._id }).distinct("_id");

    // Last 7 দিনের application count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const chartData = await Application.aggregate([
      // $match — filter করো
      {
        $match: {
          job: { $in: companyJobs },
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      // $group — date অনুযায়ী group করো এবং count করো
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }, // প্রতিটা document এর জন্য 1 যোগ করো
        },
      },
      // $sort — date অনুযায়ী sort করো
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ success: true, chartData });
  } catch (error) { next(error); }
});

export default adminRouter;
