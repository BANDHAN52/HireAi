// ─────────────────────────────────────────────
// models/User.js — User এর database schema
// MongoDB তে "users" collection তৈরি করবে
// ─────────────────────────────────────────────

import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Password hash করার জন্য

const userSchema = new mongoose.Schema(
  {
    // ── Basic Info ──
    name: {
      type: String,
      required: [true, "Name is required"],  // Validation — name ছাড়া save হবে না
      trim: true,                             // আগে পরে space remove করবে
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,             // Same email দিয়ে দুজন register করতে পারবে না
      lowercase: true,          // সব email lowercase এ save হবে
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,            // By default password query তে আসবে না (security)
    },

    // ── Role — কে job seeker আর কে company ──
    role: {
      type: String,
      enum: ["seeker", "company", "admin"], // শুধু এই তিনটা value allow
      default: "seeker",
    },

    // ── Profile Picture ──
    avatar: {
      type: String,
      default: "",  // Cloudinary URL save হবে এখানে
    },

    // ── Seeker এর জন্য extra fields ──
    // Company হলে এগুলো empty থাকবে
    skills: {
      type: [String],  // Array of strings: ["React", "Node.js", "MongoDB"]
      default: [],
    },

    experience: {
      type: String,    // "2 years", "Fresher", "5+ years"
      default: "",
    },

    education: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    resumeUrl: {
      type: String,    // Cloudinary তে upload করা PDF এর URL
      default: "",
    },

    githubUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },

    // ── Company এর জন্য extra fields ──
    companyName: {
      type: String,
      default: "",
    },

    companyWebsite: {
      type: String,
      default: "",
    },

    companyDescription: {
      type: String,
      default: "",
    },

    companyLogo: {
      type: String,   // Cloudinary URL
      default: "",
    },

    // ── Account status ──
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,   // createdAt আর updatedAt automatically add হবে
  }
);

// ─────────────────────────────────────────────
// Pre-save Hook — Password save হওয়ার আগে hash করো
// প্রতিবার save() call হলে এই function চলবে
// ─────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  // যদি password change না হয়ে থাকে, skip করো
  // (profile update এ password re-hash হবে না)
  if (!this.isModified("password")) return next();

  // bcrypt দিয়ে password hash করো
  // saltRounds = 12 মানে hashing কতটা strong হবে (বেশি = slow কিন্তু secure)
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─────────────────────────────────────────────
// Instance Method — Login এ password compare করার জন্য
// user.comparePassword("inputPassword") call করলে চলবে
// ─────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  // bcrypt.compare — plain text vs hashed password compare করে
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
// "User" দিলে MongoDB তে "users" collection তৈরি হবে (lowercase + plural)

export default User;
