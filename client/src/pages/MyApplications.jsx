// src/pages/MyApplications.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api.js";

const STATUS_STYLES = {
  pending:     { color: "var(--muted)",    bg: "var(--surface2)", label: "Pending" },
  reviewing:   { color: "var(--yellow)",   bg: "rgba(255,201,77,0.1)", label: "Under Review" },
  shortlisted: { color: "var(--green)",    bg: "rgba(0,214,143,0.1)", label: "Shortlisted 🎉" },
  rejected:    { color: "var(--accent2)",  bg: "rgba(255,107,138,0.1)", label: "Not Selected" },
  hired:       { color: "#00b4d8",         bg: "rgba(0,180,216,0.1)", label: "Hired! 🎊" },
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/applications/my-applications")
      .then(({ data }) => setApplications(data.applications))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", marginBottom: 28 }}>
        My Applications
        <span style={{ fontSize: 16, fontWeight: 400, color: "var(--muted)", marginLeft: 10 }}>({applications.length})</span>
      </h1>

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <h3>No applications yet</h3>
          <p style={{ marginBottom: 20 }}>Start applying for jobs to track them here</p>
          <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {applications.map((app) => {
            const st = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
            return (
              <div key={app._id} className="card">
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <div className="flex gap-12" style={{ alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: `hsl(${app.job?.title?.charCodeAt(0) * 5 % 360},60%,20%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "white", flexShrink: 0 }}>
                      {(app.job?.company?.companyName || "?").charAt(0)}
                    </div>
                    <div>
                      <Link to={`/jobs/${app.job?._id}`} style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                        {app.job?.title}
                      </Link>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>
                        {app.job?.company?.companyName} · {app.job?.location} · {app.job?.jobType}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, background: st.bg, color: st.color, flexShrink: 0 }}>
                    {st.label}
                  </div>
                </div>

                <div className="flex gap-16" style={{ flexWrap: "wrap" }}>
                  {/* Match Score */}
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>AI Match</span>
                    <span style={{
                      fontWeight: 700, fontSize: 15,
                      color: app.matchScore >= 80 ? "var(--green)" : app.matchScore >= 50 ? "var(--yellow)" : "var(--muted)"
                    }}>
                      {app.matchScore}%
                    </span>
                  </div>

                  {/* Matched Skills */}
                  {app.matchDetails?.matchedSkills?.length > 0 && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Matched Skills</span>
                      <div className="flex gap-6" style={{ flexWrap: "wrap" }}>
                        {app.matchDetails.matchedSkills.slice(0, 4).map(s => (
                          <span key={s} className="badge badge-green" style={{ fontSize: 10 }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {app.matchDetails?.missingSkills?.length > 0 && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Missing Skills</span>
                      <div className="flex gap-6" style={{ flexWrap: "wrap" }}>
                        {app.matchDetails.missingSkills.slice(0, 3).map(s => (
                          <span key={s} className="badge badge-red" style={{ fontSize: 10 }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Applied</span>
                    <span style={{ fontSize: 13 }}>{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  infoItem: { display: "flex", flexDirection: "column", gap: 4 },
  infoLabel: { fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 },
};
