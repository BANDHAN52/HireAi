// src/pages/PostJob.jsx — Company posts a job + AI skill extraction
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", jobType: "full-time",
    location: "", experience: "any",
    salary: { min: "", max: "", currency: "BDT" },
    requiredSkills: [], deadline: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Add skill tag manually
  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.requiredSkills.includes(s)) {
      setField("requiredSkills", [...form.requiredSkills, s]);
    }
    setSkillInput("");
  };

  const removeSkill = (s) => setField("requiredSkills", form.requiredSkills.filter(x => x !== s));

  // AI extract skills from description
  const extractSkills = async () => {
    if (!form.description.trim()) return setError("Write a job description first");
    setExtracting(true);
    setError("");
    try {
      const { data } = await api.post("/ai/extract-skills", { description: form.description });
      // Merge with existing skills (no duplicates)
      const merged = [...new Set([...form.requiredSkills, ...data.skills])];
      setField("requiredSkills", merged);
    } catch (err) {
      setError("AI extraction failed. Add skills manually.");
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.description) return setError("Title and description are required");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        salary: { min: Number(form.salary.min) || 0, max: Number(form.salary.max) || 0, currency: form.salary.currency },
      };
      await api.post("/jobs", payload);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="page-loader" style={{ flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🎉</div>
      <h2 style={{ fontWeight: 800 }}>Job Posted Successfully!</h2>
      <p style={{ color: "var(--muted)" }}>Redirecting to dashboard...</p>
    </div>
  );

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 760 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px", marginBottom: 6 }}>Post a New Job</h1>
        <p style={{ color: "var(--muted)" }}>Use AI to automatically extract required skills from your description</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label">Job Title *</label>
          <input className="form-input" placeholder="e.g. Full Stack Developer"
            value={form.title} onChange={(e) => setField("title", e.target.value)} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Job Type</label>
            <select className="form-input" value={form.jobType} onChange={(e) => setField("jobType", e.target.value)}>
              {["full-time", "part-time", "remote", "contract", "internship"].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Experience Level</label>
            <select className="form-input" value={form.experience} onChange={(e) => setField("experience", e.target.value)}>
              {[["any", "Any Level"], ["entry", "Entry Level"], ["mid", "Mid Level"], ["senior", "Senior Level"]].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" placeholder="e.g. Dhaka / Remote"
            value={form.location} onChange={(e) => setField("location", e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Min Salary</label>
            <input className="form-input" type="number" placeholder="e.g. 50000"
              value={form.salary.min} onChange={(e) => setForm(f => ({ ...f, salary: { ...f.salary, min: e.target.value } }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Salary</label>
            <input className="form-input" type="number" placeholder="e.g. 80000"
              value={form.salary.max} onChange={(e) => setForm(f => ({ ...f, salary: { ...f.salary, max: e.target.value } }))} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="form-input" value={form.salary.currency} onChange={(e) => setForm(f => ({ ...f, salary: { ...f.salary, currency: e.target.value } }))}>
              {["BDT", "USD", "EUR"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Application Deadline</label>
            <input className="form-input" type="date"
              value={form.deadline} onChange={(e) => setField("deadline", e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Job Description *</label>
          <textarea className="form-input" rows={6}
            placeholder="Describe the role, responsibilities, requirements..."
            value={form.description} onChange={(e) => setField("description", e.target.value)} required />

          {/* AI Extract Button */}
          <button type="button" onClick={extractSkills} disabled={extracting}
            style={styles.aiBtn}>
            {extracting
              ? <><span className="spinner" style={{ width: 14, height: 14, borderTopColor: "var(--accent2)" }} /> Extracting skills...</>
              : "🤖 Extract Skills with AI"}
          </button>





          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
             ⚠️ This AI feature requires a valid API key
          </p>


        </div>

        {/* Skills Input */}
        <div className="form-group">
          <label className="form-label">Required Skills</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input className="form-input" placeholder="Type a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }} />
            <button type="button" className="btn btn-outline" onClick={() => addSkill(skillInput)}>Add</button>
          </div>

          {/* Skill Tags */}
          <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
            {form.requiredSkills.map((s) => (
              <span key={s} style={styles.skillTag}>
                {s}
                <button type="button" onClick={() => removeSkill(s)} style={styles.removeSkill}>×</button>
              </span>
            ))}
            {form.requiredSkills.length === 0 && (
              <span style={{ fontSize: 13, color: "var(--muted)" }}>No skills added yet. Use AI or type manually.</span>
            )}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting} style={{ marginTop: 8 }}>
          {submitting ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Publishing...</> : "Publish Job Post →"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  aiBtn: { display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, padding: "9px 16px", background: "rgba(255,107,138,0.1)", border: "1px solid rgba(255,107,138,0.3)", borderRadius: 8, color: "var(--accent2)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  skillTag: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(124,111,255,0.12)", border: "1px solid rgba(124,111,255,0.2)", borderRadius: 8, fontSize: 12, color: "var(--accent)", fontWeight: 500 },
  removeSkill: { background: "none", border: "none", color: "var(--accent)", fontSize: 16, cursor: "pointer", lineHeight: 1, padding: "0 2px" },
};
