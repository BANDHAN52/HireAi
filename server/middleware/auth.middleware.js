// ─────────────────────────────────────────────
// middleware/auth.middleware.js
// Protected routes এ এই middleware বসাবো
// Request আসলে আগে JWT token check করবে
// Token valid হলে তারপর controller চলবে
// ─────────────────────────────────────────────

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ─────────────────────────────────────────────
// protect — Login করা user কিনা check করো
// Usage: router.get("/profile", protect, getProfile)
// ─────────────────────────────────────────────
export const protect = async (req, res, next) => {
  try {
    let token;

    // Authorization header থেকে token নাও
    // Format: "Bearer eyJhbGciOiJIUzI1NiIs..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]; // "Bearer " এর পরের অংশ
    }

    // Token না থাকলে reject করো
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please login first.",
      });
    }

    // Token verify করো — tamper হয়েছে কিনা check করে
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded এ থাকবে: { id: "userId", role: "seeker", iat: ..., exp: ... }

    // Database থেকে user নিয়ে আসো (token এ stored id দিয়ে)
    // select("+password") না দিলে password আসবে না (schema তে select:false ছিল)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token is invalid.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // req.user এ user info রাখো — পরবর্তী middleware/controller use করতে পারবে
    req.user = user;
    next(); // পরবর্তী middleware বা controller এ যাও
  } catch (error) {
    // Token expire হয়ে গেলে বা invalid হলে এখানে আসবে
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please login again." });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────
// restrictTo — নির্দিষ্ট role check করো
// Usage: router.post("/jobs", protect, restrictTo("company"), createJob)
// শুধু company role এর user job create করতে পারবে
// ─────────────────────────────────────────────
export const restrictTo = (...roles) => {
  // roles = ["company", "admin"] — যাদের allow করতে চাই
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${roles.join(", ")} can perform this action.`,
      });
    }
    next();
  };
};
