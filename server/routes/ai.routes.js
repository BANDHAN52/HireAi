// routes/ai.routes.js
import express from "express";
import { extractSkillsFromJobDescription, analyzeResume } from "../utils/ai.utils.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/extract-skills", protect, async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ success: false, message: "Description is required." });
    const skills = await extractSkillsFromJobDescription(description);
    res.status(200).json({ success: true, skills });
  } catch (error) { next(error); }
});

router.post("/analyze-resume", protect, async (req, res, next) => {
  try {
    const { resumeText, targetJobTitle } = req.body;
    if (!resumeText) return res.status(400).json({ success: false, message: "Resume text is required." });
    const analysis = await analyzeResume(resumeText, targetJobTitle);
    res.status(200).json({ success: true, analysis });
  } catch (error) { next(error); }
});

export default router;
