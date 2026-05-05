// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({});
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [resumeText, setResumeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        experience: user.experience || "",
        education: user.education || "",
        skills: user.skills || [],
        companyName: user.companyName || "",
        companyDescription: user.companyDescription || "",
        companyWebsite: user.companyWebsite || "",
        resumeUrl: user.resumeUrl || "",
        githubUrl: user.githubUrl || "",
        linkedinUrl: user.linkedinUrl || "",
      });
    }
  }, [user]);

  const addSkill = (s) => {
    s = s.trim();
    if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput("");
  };
  const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", form);
      updateUser(data.user);
      showMsg("success", "Profile updated successfully!");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) return showMsg("error", "Paste your resume text first");
    setAnalyzing(true);
    try {
      const { data } = await api.post("/ai/analyze-resume", { resumeText });
      setAnalysis(data.analysis);
      if (data.analysis.extractedSkills?.length > 0) {
        const merged = [...new Set([...form.skills, ...data.analysis.extractedSkills])];
        setForm(f => ({ ...f, skills: merged }));
      }
    } catch (err) {
      showMsg("error", "Resume analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 800 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", marginBottom: 28 }}>My Profile</h1>

      {/* Toast Notification */}
      {msg.text && (
        <div style={{
          position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, padding: "14px 28px", borderRadius: 12, fontWeight: 600,
          fontSize: 14, whiteSpace: "nowrap", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          background: msg.type === "success" ? "rgba(0,214,143,0.95)" : "rgba(255,107,138,0.95)",
          color: "white",
        }}>
          {msg.type === "success" ? "✅ " : "❌ "}{msg.text}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Basic Info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name || ""} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" placeholder="e.g. Dhaka, Bangladesh"
              value={form.location || ""} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea className="form-input" rows={3} placeholder="Write a short bio..."
              value={form.bio || ""} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>
        </div>

        {/* Seeker Fields */}
        {user?.role === "seeker" && (
          <>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={styles.sectionTitle}>Professional Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <input className="form-input" placeholder="e.g. 2 years, Fresher"
                    value={form.experience || ""} onChange={(e) => setForm(f => ({ ...f, experience: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Education</label>
                  <input className="form-input" placeholder="e.g. BSc Computer Science"
                    value={form.education || ""} onChange={(e) => setForm(f => ({ ...f, education: e.target.value }))} />
                </div>
              </div>

              {/* Skills */}
              <div className="form-group">
                <label className="form-label">Skills</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input className="form-input" placeholder="Add a skill (e.g. React)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }} />
                  <button type="button" className="btn btn-outline" onClick={() => addSkill(skillInput)}>Add</button>
                </div>
                <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
                  {(form.skills || []).map(s => (
                    <span key={s} style={styles.skillTag}>
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} style={styles.removeSkill}>×</button>
                    </span>
                  ))}
                  {!form.skills?.length && <span style={{ fontSize: 13, color: "var(--muted)" }}>No skills added</span>}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={styles.sectionTitle}>Links & Portfolio</h3>
              <div className="form-group">
                <label className="form-label">📄 Resume Link (Google Drive / Dropbox)</label>
                <input className="form-input" placeholder="https://drive.google.com/..."
                  value={form.resumeUrl || ""} onChange={(e) => setForm(f => ({ ...f, resumeUrl: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">🐙 GitHub Profile</label>
                <input className="form-input" placeholder="https://github.com/username"
                  value={form.githubUrl || ""} onChange={(e) => setForm(f => ({ ...f, githubUrl: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">💼 LinkedIn Profile</label>
                <input className="form-input" placeholder="https://linkedin.com/in/username"
                  value={form.linkedinUrl || ""} onChange={(e) => setForm(f => ({ ...f, linkedinUrl: e.target.value }))} />
              </div>
            </div>

            {/* AI Resume Analyzer */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={styles.sectionTitle}>🤖 AI Resume Analyzer</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
                Paste your resume text and AI will analyze it — extract skills, find weaknesses, give suggestions.
              </p>
              <textarea className="form-input" rows={6}
                placeholder="Paste your resume content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)} />
              <button type="button" className="btn btn-primary" style={{ marginTop: 10 }}
                onClick={analyzeResume} disabled={analyzing}>
                {analyzing ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Analyzing...</> : "🔍 Analyze Resume"}
              </button>



              
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
             ⚠️ This AI feature requires a valid API key
          </p>




              {analysis && (
                <div style={styles.analysisBox}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>✅ Strengths</div>
                      {analysis.strengths?.map((s, i) => <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>• {s}</div>)}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent2)", marginBottom: 8 }}>⚠️ Weaknesses</div>
                      {analysis.weaknesses?.map((w, i) => <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>• {w}</div>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>💡 Suggestions</div>
                    {analysis.suggestions?.map((s, i) => <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>• {s}</div>)}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>Overall Score:</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "var(--accent)" }}>{analysis.overallScore}/100</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Company Fields */}
        {user?.role === "company" && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={styles.sectionTitle}>Company Details</h3>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="form-input" value={form.companyName || ""} onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Company Website</label>
              <input className="form-input" placeholder="https://yourcompany.com"
                value={form.companyWebsite || ""} onChange={(e) => setForm(f => ({ ...f, companyWebsite: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Company Description</label>
              <textarea className="form-input" rows={4}
                value={form.companyDescription || ""} onChange={(e) => setForm(f => ({ ...f, companyDescription: e.target.value }))} />
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
          {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  sectionTitle: { fontSize: 15, fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid var(--border)" },
  skillTag: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(124,111,255,0.12)", border: "1px solid rgba(124,111,255,0.2)", borderRadius: 8, fontSize: 12, color: "var(--accent)", fontWeight: 500 },
  removeSkill: { background: "none", border: "none", color: "var(--accent)", fontSize: 16, cursor: "pointer", padding: "0 2px" },
  analysisBox: { marginTop: 16, padding: 16, background: "rgba(124,111,255,0.06)", border: "1px solid rgba(124,111,255,0.15)", borderRadius: 10 },
};
