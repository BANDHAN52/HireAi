// src/pages/JobDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Calculated match score
  const matchScore = user?.role === "seeker" && user?.skills?.length > 0 && job?.requiredSkills?.length > 0
    ? Math.round((user.skills.filter(s => job.requiredSkills.some(r => r.toLowerCase() === s.toLowerCase())).length / job.requiredSkills.length) * 100)
    : null;

  const matchedSkills = user?.skills?.filter(s => job?.requiredSkills?.some(r => r.toLowerCase() === s.toLowerCase())) || [];
  const missingSkills = job?.requiredSkills?.filter(r => !user?.skills?.some(s => s.toLowerCase() === r.toLowerCase())) || [];

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data.job);
      } catch {
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!user) return navigate("/login");
    setApplying(true);
    try {
      await api.post(`/applications/${id}/apply`, { coverLetter });
      setApplied(true);
      setShowApplyForm(false);
      setMsg({ type: "success", text: "Application submitted! The company will be notified." });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to apply" });
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (!job) return null;

  const mc = matchScore !== null
    ? matchScore >= 80 ? { color: "var(--green)", label: "Strong Match" }
    : matchScore >= 50 ? { color: "var(--yellow)", label: "Good Match" }
    : { color: "var(--muted)", label: "Partial Match" }
    : null;

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={styles.layout}>
        {/* Main Content */}
        <div>
          {/* Job Header */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ ...styles.logo, background: `hsl(${job.title?.charCodeAt(0) * 5 % 360},60%,20%)` }}>
                {(job.company?.companyName || "?").charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>{job.title}</h1>
                <p style={{ color: "var(--muted)", fontSize: 14 }}>
                  {job.company?.companyName || job.company?.name} · {job.location}
                </p>
              </div>
              {job.status !== "open" && <span className="badge badge-red">Closed</span>}
            </div>

            {/* Meta */}
            <div className="flex gap-8" style={{ flexWrap: "wrap", marginBottom: 16 }}>
              <span className="badge badge-accent">{job.jobType}</span>
              <span className="badge badge-gray">{job.experience === "any" ? "Any Level" : job.experience + " level"}</span>
              {job.salary?.min > 0 && <span className="badge badge-green">{job.salary.currency} {job.salary.min.toLocaleString()} – {job.salary.max.toLocaleString()}</span>}
              <span className="badge badge-gray">📅 Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              {job.applicationCount > 0 && <span className="badge badge-gray">👥 {job.applicationCount} applicants</span>}
            </div>

            {/* Required Skills */}
            {job.requiredSkills?.length > 0 && (
              <div>
                <div style={styles.sectionLabel}>Required Skills</div>
                <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
                  {job.requiredSkills.map(s => (
                    <span key={s} style={{
                      padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                      background: matchedSkills.includes(s) ? "rgba(0,214,143,0.12)" : "var(--surface2)",
                      color: matchedSkills.includes(s) ? "var(--green)" : "var(--text)",
                      border: `1px solid ${matchedSkills.includes(s) ? "rgba(0,214,143,0.2)" : "var(--border)"}`,
                    }}>
                      {matchedSkills.some(m => m.toLowerCase() === s.toLowerCase()) ? "✓ " : ""}{s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card">
            <div style={styles.sectionLabel}>Job Description</div>
            <div style={{ color: "var(--text)", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {job.description}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside>
          {/* AI Match Card */}
          {mc && user?.role === "seeker" && (
            <div className="card" style={{ marginBottom: 16, borderColor: `${mc.color}33` }}>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: mc.color, letterSpacing: "-2px" }}>
                  {matchScore}%
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: mc.color, marginBottom: 16 }}>
                  {mc.label}
                </div>
                {matchedSkills.length > 0 && (
                  <div style={{ textAlign: "left", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 600, marginBottom: 4 }}>✓ You have</div>
                    <div className="flex gap-6" style={{ flexWrap: "wrap" }}>
                      {matchedSkills.map(s => <span key={s} className="badge badge-green" style={{ fontSize: 11 }}>{s}</span>)}
                    </div>
                  </div>
                )}
                {missingSkills.length > 0 && (
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 12, color: "var(--accent2)", fontWeight: 600, marginBottom: 4 }}>✗ Missing</div>
                    <div className="flex gap-6" style={{ flexWrap: "wrap" }}>
                      {missingSkills.map(s => <span key={s} className="badge badge-red" style={{ fontSize: 11 }}>{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Apply Section */}
          <div className="card">
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

            {!user ? (
              <>
                <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12, textAlign: "center" }}>Login to apply for this job</p>
                <Link to="/login" className="btn btn-primary btn-full">Login to Apply</Link>
              </>
            ) : user.role !== "seeker" ? (
              <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center" }}>Only job seekers can apply</p>
            ) : applied ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <p style={{ fontWeight: 600 }}>Application Submitted!</p>
                <Link to="/my-applications" style={{ color: "var(--accent)", fontSize: 13, display: "block", marginTop: 8 }}>View My Applications →</Link>
              </div>
            ) : job.status !== "open" ? (
              <p style={{ color: "var(--accent2)", fontSize: 13, textAlign: "center" }}>This job is no longer accepting applications</p>
            ) : !showApplyForm ? (
              <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowApplyForm(true)}>
                Apply Now
              </button>
            ) : (
              <div>
                <div className="form-group">
                  <label className="form-label">Cover Letter (Optional)</label>
                  <textarea className="form-input" rows={4} placeholder="Tell the company why you're a great fit..."
                    value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
                </div>
                <button className="btn btn-primary btn-full" onClick={handleApply} disabled={applying}>
                  {applying ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</> : "Submit Application"}
                </button>
                <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => setShowApplyForm(false)}>Cancel</button>
              </div>
            )}
          </div>

          {/* Company Info */}
          {job.company?.companyDescription && (
            <div className="card" style={{ marginTop: 16 }}>
              <div style={styles.sectionLabel}>About Company</div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{job.company.companyDescription}</p>
              {job.company.companyWebsite && (
                <a href={job.company.companyWebsite} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontSize: 13, display: "block", marginTop: 8 }}>
                  🌐 Visit Website →
                </a>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" },
  logo: { width: 52, height: 52, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: "white", flexShrink: 0 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
};
