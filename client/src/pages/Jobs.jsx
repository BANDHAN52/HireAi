// src/pages/Jobs.jsx — Browse all jobs with search + filter
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    jobType: "", location: "", experience: "", page: 1,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const { data } = await api.get(`/jobs?${params}`);
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  const getMatchColor = (score) => {
    if (score >= 80) return { color: "var(--green)", bg: "rgba(0,214,143,0.1)", border: "rgba(0,214,143,0.2)" };
    if (score >= 50) return { color: "var(--yellow)", bg: "rgba(255,201,77,0.1)", border: "rgba(255,201,77,0.2)" };
    return { color: "var(--muted)", bg: "var(--surface2)", border: "var(--border)" };
  };

  return (
    <div className="container" style={{ padding: "32px 24px" }}>
      {/* Header + Search */}
      <div style={styles.header}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px" }}>Browse Jobs</h1>
        <div style={styles.searchBar}>
          <input className="form-input" placeholder="🔍  Search jobs, skills..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            style={{ maxWidth: 340 }} />
        </div>
      </div>

      <div style={styles.layout}>
        {/* Filters Sidebar */}
        <aside className="card hide-mobile" style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Filters</h3>

          <div style={styles.filterGroup}>
            <div style={styles.filterLabel}>Job Type</div>
            {["", "full-time", "part-time", "remote", "contract", "internship"].map((t) => (
              <label key={t} style={styles.filterOption}>
                <input type="radio" name="jobType" value={t}
                  checked={filters.jobType === t}
                  onChange={() => updateFilter("jobType", t)} />
                {t === "" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
              </label>
            ))}
          </div>

          <div style={styles.filterGroup}>
            <div style={styles.filterLabel}>Experience</div>
            {["", "entry", "mid", "senior"].map((e) => (
              <label key={e} style={styles.filterOption}>
                <input type="radio" name="experience" value={e}
                  checked={filters.experience === e}
                  onChange={() => updateFilter("experience", e)} />
                {e === "" ? "Any Level" : e.charAt(0).toUpperCase() + e.slice(1) + " Level"}
              </label>
            ))}
          </div>

          <button className="btn btn-outline btn-sm btn-full"
            onClick={() => setFilters({ search: "", jobType: "", location: "", experience: "", page: 1 })}>
            Clear Filters
          </button>
        </aside>

        {/* Job List */}
        <main>
          {loading ? (
            <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No jobs found</h3>
              <p>Try different keywords or clear filters</p>
            </div>
          ) : (
            <>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>{jobs.length} jobs found</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {jobs.map((job) => <JobCard key={job._id} job={job} user={user} getMatchColor={getMatchColor} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button className="btn btn-outline btn-sm"
                    disabled={filters.page === 1}
                    onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>Page {filters.page} of {totalPages}</span>
                  <button className="btn btn-outline btn-sm"
                    disabled={filters.page === totalPages}
                    onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Job Card Component
function JobCard({ job, user, getMatchColor }) {
  // If user is a seeker with skills, show estimated match
  const matchScore = user?.role === "seeker" && user?.skills?.length > 0
    ? Math.round((user.skills.filter(s => job.requiredSkills?.some(r => r.toLowerCase() === s.toLowerCase())).length / Math.max(job.requiredSkills?.length, 1)) * 100)
    : null;

  const mc = matchScore !== null ? getMatchColor(matchScore) : null;

  return (
    <Link to={`/jobs/${job._id}`} style={{ textDecoration: "none" }}>
      <div className="card" style={styles.jobCard}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(124,111,255,0.4)"}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}>

        <div className="flex-between" style={{ marginBottom: 12 }}>
          <div className="flex gap-12" style={{ alignItems: "center" }}>
            <div style={{ ...styles.companyLogo, background: `hsl(${job.title?.charCodeAt(0) * 5 % 360},60%,20%)` }}>
              {(job.company?.companyName || job.company?.name || "?").charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{job.title}</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                {job.company?.companyName || job.company?.name} · {job.location}
              </div>
            </div>
          </div>

          {mc !== null && (
            <div style={{ padding: "5px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700, background: mc.bg, color: mc.color, border: `1px solid ${mc.border}`, whiteSpace: "nowrap" }}>
              ⚡ {matchScore}% Match
            </div>
          )}
        </div>

        <div className="flex gap-8" style={{ marginBottom: 12, flexWrap: "wrap" }}>
          <span className="badge badge-gray">{job.jobType}</span>
          <span className="badge badge-gray">{job.experience === "any" ? "Any Level" : job.experience}</span>
          {job.salary?.min > 0 && (
            <span className="badge badge-accent">
              {job.salary.currency} {job.salary.min.toLocaleString()} – {job.salary.max.toLocaleString()}
            </span>
          )}
        </div>

        {job.requiredSkills?.length > 0 && (
          <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
            {job.requiredSkills.slice(0, 5).map(s => (
              <span key={s} style={styles.skillTag}>{s}</span>
            ))}
            {job.requiredSkills.length > 5 && <span style={{ ...styles.skillTag, color: "var(--muted)" }}>+{job.requiredSkills.length - 5}</span>}
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            📅 {new Date(job.createdAt).toLocaleDateString()}
            {job.applicationCount > 0 && ` · ${job.applicationCount} applicants`}
          </span>
          <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>View Details →</span>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  searchBar: { display: "flex", gap: 8 },
  layout: { display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 },
  sidebar: { height: "fit-content", position: "sticky", top: 80 },
  sidebarTitle: { fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  filterGroup: { marginBottom: 20 },
  filterLabel: { fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  filterOption: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text)", marginBottom: 6, cursor: "pointer" },
  jobCard: { transition: "border-color 0.2s, transform 0.2s", cursor: "pointer" },
  companyLogo: { width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, flexShrink: 0, color: "white" },
  skillTag: { padding: "3px 10px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, color: "var(--muted)" },
  pagination: { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 32 },
};
