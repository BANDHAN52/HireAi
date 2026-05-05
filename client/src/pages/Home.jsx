// src/pages/Home.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  const categories = [
    { icon: "⚛️", label: "Frontend", query: "React" },
    { icon: "🖥️", label: "Backend", query: "Node.js" },
    { icon: "📱", label: "Mobile", query: "React Native" },
    { icon: "☁️", label: "DevOps", query: "AWS" },
    { icon: "🤖", label: "AI / ML", query: "Machine Learning" },
    { icon: "🎨", label: "UI/UX", query: "Figma" },
    { icon: "🔒", label: "Security", query: "Cybersecurity" },
    { icon: "📊", label: "Data", query: "Data Science" },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={styles.badge}> AI-Powered Job Matching</div>
          {/* ✨ */}
          <h1 style={styles.heroTitle}>
            Find Your <span style={{ color: "var(--accent)" }}>Dream Job</span><br />
            Smarter & Faster
          </h1>
          <p style={styles.heroSub}>
            AI analyzes your profile and matches you with the best opportunities.<br />
            Know your match score before you apply.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" className="btn btn-primary" style={{ margin: 6, borderRadius: 10 }}>
               Search
            </button>
            {/* 🔍 */}
          </form>

          {/* Stats */}
          <div style={styles.stats}>
            {[["2.4k+", "Active Jobs"], ["840+", "Companies"], ["18k+", "Candidates"], ["94%", "Success Rate"]].map(([num, label]) => (
              <div key={label} style={styles.stat}>
                <div style={styles.statNum}>{num}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: "60px 0" }}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Browse by Category</h2>
          <div style={styles.categories}>
            {categories.map((c) => (
              <button
                key={c.label}
                onClick={() => navigate(`/jobs?search=${c.query}`)}
                style={styles.catCard}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <span style={{ fontSize: 28 }}>{c.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "0 0 80px" }}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Why HireAI?</h2>
          <div style={styles.features}>
            {[
              { title: "AI Skill Matching", desc: "AI compares your skills with job requirements and gives you a match % before you apply." },
              // icon: "🤖", 
              { title: "Resume Analyzer", desc: "Upload your resume and get instant AI feedback on missing skills and improvements." },
              // icon: "📄",
              { title: "Auto Skill Extract", desc: "Companies describe a job and AI automatically extracts the required technical skills." },
              //  icon: "⚡",
              { title: "Instant Notifications", desc: "Get email updates when your application status changes — shortlisted, reviewed, or hired." },
              //  icon: "📧", 
            ].map((f) => (
              <div key={f.title} className="card" style={styles.featureCard}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>{f.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={styles.cta}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Ready to get started?</h2>
            <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: 16 }}>Join thousands of developers finding their dream jobs with AI</p>
            <div className="flex-center gap-12">
              <Link to="/register" className="btn btn-primary btn-lg">Create Account →</Link>
              <Link to="/jobs" className="btn btn-outline btn-lg">Browse Jobs</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

const styles = {
  hero: { padding: "90px 0 70px", position: "relative", overflow: "hidden", textAlign: "center" },
  heroBg: { position: "absolute", top: -150, left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(124,111,255,0.12) 0%, transparent 65%)", pointerEvents: "none" },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124,111,255,0.12)", border: "1px solid rgba(124,111,255,0.25)", padding: "6px 16px", borderRadius: 100, fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 24 },
  heroTitle: { fontSize: "clamp(36px,5vw,60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 },
  heroSub: { color: "var(--muted)", fontSize: 17, lineHeight: 1.7, marginBottom: 36 },
  searchBox: { maxWidth: 580, margin: "0 auto 48px", display: "flex", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" },
  searchInput: { flex: 1, background: "transparent", border: "none", padding: "14px 18px", color: "var(--text)", fontSize: 15, outline: "none" },
  stats: { display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" },
  stat: { textAlign: "center" },
  statNum: { fontSize: 28, fontWeight: 800, letterSpacing: "-1px" },
  sectionTitle: { fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 28, textAlign: "center" },
  categories: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 },
  catCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transition: "border-color 0.2s", cursor: "pointer" },
  features: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 },
  featureCard: { transition: "transform 0.2s" },
  featureIcon: { fontSize: 32, marginBottom: 14 },
  cta: { background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "80px 0" },
};
