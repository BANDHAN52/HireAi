// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_COLORS = { pending: "#7c6fff", reviewing: "#ffc94d", shortlisted: "#00d68f", rejected: "#ff6b8a", hired: "#00b4d8" };

// ── Profile Modal ──
function ProfileModal({ app, onClose }) {
  if (!app) return null;
  const c = app.applicant;

  const openLink = (url) => {
    if (!url) return;
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:18, padding:28, width:"100%", maxWidth:560, maxHeight:"85vh", overflowY:"auto" }}>

        {/* Header */}
        <div style={{ display:"flex", gap:16, alignItems:"flex-start", marginBottom:20, position:"relative" }}>
          <div style={{ width:56, height:56, borderRadius:12, background:"linear-gradient(135deg,var(--accent),var(--accent2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"white", flexShrink:0 }}>
            {c?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:20, marginBottom:2 }}>{c?.name}</div>
            <div style={{ color:"var(--muted)", fontSize:13 }}>{c?.email}</div>
            {c?.location && <div style={{ color:"var(--muted)", fontSize:13 }}>📍 {c.location}</div>}
          </div>
          <button onClick={onClose} style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8, color:"var(--muted)", fontSize:14, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>✕ Close</button>
        </div>

        {/* Experience & Education */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
          <div style={{ background:"var(--surface2)", borderRadius:10, padding:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:4 }}>Experience</div>
            <div style={{ fontSize:13, fontWeight:600 }}>{c?.experience || "Not specified"}</div>
          </div>
          <div style={{ background:"var(--surface2)", borderRadius:10, padding:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:4 }}>Education</div>
            <div style={{ fontSize:13, fontWeight:600 }}>{c?.education || "Not specified"}</div>
          </div>
        </div>

        {/* Bio */}
        {c?.bio && (
          <div style={{ marginBottom:16, padding:12, background:"var(--surface2)", borderRadius:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:6 }}>Bio</div>
            <div style={{ fontSize:13, lineHeight:1.6 }}>{c.bio}</div>
          </div>
        )}

        {/* Skills */}
        {c?.skills?.length > 0 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:8 }}>Skills</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {c.skills.map(s => (
                <span key={s} style={{ padding:"4px 10px", background:"rgba(124,111,255,0.12)", border:"1px solid rgba(124,111,255,0.2)", borderRadius:6, fontSize:12, color:"var(--accent)", fontWeight:500 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {(c?.resumeUrl || c?.githubUrl || c?.linkedinUrl) && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:10 }}>Links & Portfolio</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {c?.resumeUrl && (
                <button onClick={() => openLink(c.resumeUrl)}
                  style={{ padding:"9px 16px", background:"rgba(0,214,143,0.12)", color:"var(--green)", borderRadius:8, fontSize:13, fontWeight:600, border:"1px solid rgba(0,214,143,0.25)", cursor:"pointer", fontFamily:"inherit" }}>
                  📄 View Resume
                </button>
              )}
              {c?.githubUrl && (
                <button onClick={() => openLink(c.githubUrl)}
                  style={{ padding:"9px 16px", background:"rgba(124,111,255,0.12)", color:"var(--accent)", borderRadius:8, fontSize:13, fontWeight:600, border:"1px solid rgba(124,111,255,0.25)", cursor:"pointer", fontFamily:"inherit" }}>
                  🐙 GitHub
                </button>
              )}
              {c?.linkedinUrl && (
                <button onClick={() => openLink(c.linkedinUrl)}
                  style={{ padding:"9px 16px", background:"rgba(10,102,194,0.12)", color:"#0a66c2", borderRadius:8, fontSize:13, fontWeight:600, border:"1px solid rgba(10,102,194,0.25)", cursor:"pointer", fontFamily:"inherit" }}>
                  💼 LinkedIn
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Match */}
        <div style={{ padding:16, background:"var(--surface2)", borderRadius:10, marginBottom:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"auto 1fr 1fr", gap:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:4 }}>AI Match</div>
              <div style={{ fontSize:32, fontWeight:800, color: app.matchScore >= 80 ? "var(--green)" : app.matchScore >= 50 ? "var(--yellow)" : "var(--muted)" }}>{app.matchScore}%</div>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:6 }}>Matched Skills</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                {app.matchDetails?.matchedSkills?.map(s => (
                  <span key={s} style={{ padding:"2px 8px", background:"rgba(0,214,143,0.12)", color:"var(--green)", borderRadius:6, fontSize:11 }}>{s}</span>
                ))}
                {!app.matchDetails?.matchedSkills?.length && <span style={{ fontSize:12, color:"var(--muted)" }}>None</span>}
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:6 }}>Missing Skills</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                {app.matchDetails?.missingSkills?.map(s => (
                  <span key={s} style={{ padding:"2px 8px", background:"rgba(255,107,138,0.12)", color:"var(--accent2)", borderRadius:6, fontSize:11 }}>{s}</span>
                ))}
                {!app.matchDetails?.missingSkills?.length && <span style={{ fontSize:12, color:"var(--muted)" }}>None</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Cover Letter */}
        {app.coverLetter && (
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:6 }}>Cover Letter</div>
            <div style={{ fontSize:13, lineHeight:1.6, padding:12, background:"var(--surface2)", borderRadius:8 }}>{app.coverLetter}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, chartRes, jobsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/applications-chart"),
          api.get("/jobs/company/my-jobs"),
        ]);
        setStats(statsRes.data.stats);
        setChartData(chartRes.data.chartData);
        setJobs(jobsRes.data.jobs);
        if (jobsRes.data.jobs.length > 0) {
          fetchApplicants(jobsRes.data.jobs[0]._id);
          setSelectedJob(jobsRes.data.jobs[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fetchApplicants = async (jobId) => {
    try {
      setApplicants([]);
      setSelectedJob(jobId);
      const { data } = await api.get(`/applications/job/${jobId}`);
      setApplicants(data.applications);
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
    } catch (err) { console.error(err); }
  };

  const pieData = Object.entries(
    applicants.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="container" style={{ padding: "32px 24px" }}>
      <ProfileModal app={selectedApp} onClose={() => setSelectedApp(null)} />

      <div className="flex-between" style={{ marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px" }}>Dashboard</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{user?.companyName || user?.name}</p>
        </div>
        <Link to="/post-job" className="btn btn-primary">+ Post New Job</Link>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: "Active Jobs", value: stats?.activeJobs ?? 0, icon: "💼", color: "var(--accent)" },
          { label: "Total Applications", value: stats?.totalApplications ?? 0, icon: "📨", color: "var(--green)" },
          { label: "Shortlisted", value: stats?.shortlisted ?? 0, icon: "⭐", color: "var(--yellow)" },
          { label: "Hired", value: stats?.hired ?? 0, icon: "🎉", color: "var(--accent2)" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card" style={styles.statCard}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color, letterSpacing: "-1px", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        <div className="card">
          <h3 style={styles.cardTitle}>Applications (Last 7 Days)</h3>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>Daily application volume</p>
          {chartData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)", fontSize: 14 }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={styles.cardTitle}>Application Status</h3>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>Current pipeline</p>
          {pieData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)", fontSize: 14 }}>No applications yet</div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <PieChart width={130} height={130}>
                <Pie data={pieData} cx={60} cy={60} innerRadius={35} outerRadius={60} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || "#555"} />)}
                </Pie>
              </PieChart>
              <div>
                {pieData.map(({ name, value }) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLORS[name] || "#555" }} />
                    <span style={{ fontSize: 12, textTransform: "capitalize" }}>{name}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applicants */}
      <div className="card" id="applicants-section" style={{ marginTop: 20 }}>
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <h3 style={styles.cardTitle}>Applicants</h3>
          {jobs.length > 0 && (
            <select className="form-input" style={{ width: "auto", fontSize: 13 }}
              value={selectedJob || ""}
              onChange={(e) => fetchApplicants(e.target.value)}>
              {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
          )}
        </div>

        {applicants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No applicants yet</h3>
            <p>Applications will appear here when candidates apply</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Candidate</th>
                  <th style={styles.th}>Skills</th>
                  <th style={styles.th}>AI Match</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((app) => (
                  <tr key={app._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{app.applicant?.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{app.applicant?.email}</div>
                      {app.applicant?.experience && <div style={{ fontSize: 11, color: "var(--muted)" }}>{app.applicant.experience}</div>}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4, maxWidth:200 }}>
                        {app.applicant?.skills?.slice(0, 4).map(s => (
                          <span key={s} style={{ padding: "2px 7px", background: "var(--surface2)", borderRadius: 4, fontSize: 10, color: "var(--muted)" }}>{s}</span>
                        ))}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: "4px 10px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                        background: app.matchScore >= 80 ? "rgba(0,214,143,0.12)" : app.matchScore >= 50 ? "rgba(255,201,77,0.12)" : "var(--surface2)",
                        color: app.matchScore >= 80 ? "var(--green)" : app.matchScore >= 50 ? "var(--yellow)" : "var(--muted)",
                      }}>
                        {app.matchScore}%
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: `${STATUS_COLORS[app.status]}22`, color: STATUS_COLORS[app.status], textTransform: "capitalize" }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelectedApp(app)}>
                          View Profile
                        </button>
                        <select
                          style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 8px", color: "var(--text)", fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}
                          value={app.status}
                          onChange={(e) => updateStatus(app._id, e.target.value)}>
                          {["pending", "reviewing", "shortlisted", "rejected", "hired"].map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* My Jobs */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <h3 style={styles.cardTitle}>My Job Posts</h3>
          <Link to="/post-job" className="btn btn-outline btn-sm">+ New Job</Link>
        </div>
        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <h3>No jobs posted</h3>
            <p>Post your first job to start receiving applications</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {jobs.map(j => (
              <div key={j._id} style={styles.jobRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{j.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{j.jobType} · {j.location} · {j.applicationCount} applicants</div>
                </div>
                <button
                  onClick={async () => {
                    await fetchApplicants(j._id);
                    document.getElementById("applicants-section").scrollIntoView({ behavior: "smooth" });
                  }}
                  className="btn btn-outline btn-sm">
                  View Applicants
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 },
  statCard: { textAlign: "center" },
  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  cardTitle: { fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { borderBottom: "1px solid var(--border)" },
  th: { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 },
  tr: { borderBottom: "1px solid var(--border)" },
  td: { padding: "12px", fontSize: 13, verticalAlign: "middle" },
  jobRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" },
};
