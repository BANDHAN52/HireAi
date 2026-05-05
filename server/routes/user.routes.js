import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
});

router.put("/profile", protect, async (req, res, next) => {
  try {
    const notAllowed = ["password", "email", "role"];
    notAllowed.forEach((field) => delete req.body[field]);
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Profile updated!", user });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
});

export default router;
