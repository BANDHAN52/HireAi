// ─────────────────────────────────────────────
// models/Application.js — Job application schema
// কে কোন job এ apply করেছে সেটা track করে
// MongoDB তে "applications" collection হবে
// ─────────────────────────────────────────────

import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    // ── কোন Job এ apply হয়েছে ──
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",        // Job model এর সাথে link
      required: true,
    },

    // ── কে apply করেছে ──
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",       // User model এর সাথে link
      required: true,
    },

    // ── AI Match Score ──
    // Apply করার সময় AI calculate করবে (0-100)
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ── কোন skills match হয়েছে, কোনগুলো missing ──
    matchDetails: {
      matchedSkills: { type: [String], default: [] },  // ["React", "Node.js"]
      missingSkills: { type: [String], default: [] },  // ["Docker", "AWS"]
    },

    // ── Application এর বর্তমান অবস্থা ──
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "rejected", "hired"],
      default: "pending",  // Apply করলে pending হবে
    },

    // ── Cover Letter (optional) ──
    coverLetter: {
      type: String,
      default: "",
    },

    // ── Resume URL (apply করার সময়ের resume) ──
    resumeUrl: {
      type: String,
      default: "",
    },

    // ── Company এর note (internal) ──
    companyNote: {
      type: String,
      default: "",  // Candidate দেখতে পাবে না
    },
  },
  {
    timestamps: true,  // Apply করার date/time save হবে
  }
);

// ─────────────────────────────────────────────
// Compound Index — একই person একই job এ
// দুইবার apply করতে পারবে না
// ─────────────────────────────────────────────
applicationSchema.index(
  { job: 1, applicant: 1 },
  { unique: true }  // unique: true মানে duplicate allow না
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
