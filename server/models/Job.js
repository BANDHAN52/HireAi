// ─────────────────────────────────────────────
// models/Job.js — Job post এর database schema
// MongoDB তে "jobs" collection তৈরি করবে
// ─────────────────────────────────────────────

import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    // ── Job Basic Info ──
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
    },

    // ── কোন Company এই job post করেছে ──
    // User model এর _id reference করছে
    company: {
      type: mongoose.Schema.Types.ObjectId,  // MongoDB ObjectId type
      ref: "User",                            // User model এর সাথে link
      required: true,
    },

    // ── Skills যা এই job এ দরকার ──
    // AI automatically extract করবে description থেকে
    requiredSkills: {
      type: [String],   // ["React", "Node.js", "MongoDB"]
      default: [],
    },

    // ── Job Details ──
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "remote", "contract", "internship"],
      default: "full-time",
    },

    location: {
      type: String,
      default: "Remote",
    },

    // ── Salary Range ──
    salary: {
      min: { type: Number, default: 0 },   // Minimum salary
      max: { type: Number, default: 0 },   // Maximum salary
      currency: { type: String, default: "BDT" }, // BDT, USD ইত্যাদি
    },

    experience: {
      type: String,
      enum: ["entry", "mid", "senior", "any"],
      default: "any",
    },

    // ── Job Status ──
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "open",   // নতুন job post করলে open হবে
    },

    // ── কতজন apply করেছে (count রাখার জন্য) ──
    applicationCount: {
      type: Number,
      default: 0,
    },

    // ── Deadline ──
    deadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,  // createdAt, updatedAt auto add হবে
  }
);

// ─────────────────────────────────────────────
// Index — Search fast করার জন্য
// MongoDB এ index থাকলে query অনেক দ্রুত হয়
// ─────────────────────────────────────────────
jobSchema.index({ title: "text", description: "text" }); // Text search এর জন্য
jobSchema.index({ status: 1, createdAt: -1 });            // Filter + sort এর জন্য
jobSchema.index({ requiredSkills: 1 });                   // Skill-based search এর জন্য

const Job = mongoose.model("Job", jobSchema);

export default Job;
