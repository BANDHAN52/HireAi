// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "seeker", companyName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user);
      if (data.user.role === "company") navigate("/dashboard");
      else navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authStyles.page}>
      <div style={{ ...authStyles.card, maxWidth: 480 }} className="card">
        <div style={authStyles.header}>
          <h1 style={authStyles.title}>Create Account</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Join HireAI — free forever</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Role Toggle */}
        <div style={styles.roleToggle}>
          {["seeker", "company"].map((r) => (
            <button key={r} type="button"
              onClick={() => setForm({ ...form, role: r })}
              style={{ ...styles.roleBtn, ...(form.role === r ? styles.roleBtnActive : {}) }}>
              {r === "seeker" ? "👤 Job Seeker" : "🏢 Company"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Your full name"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          {form.role === "company" && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="form-input" placeholder="Your company name"
                value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating...</> : "Create Account →"}
          </button>
        </form>

        <p style={authStyles.footer}>
          Already have an account? <Link to="/login" style={{ color: "var(--accent)" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  roleToggle: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20, background: "var(--surface2)", padding: 4, borderRadius: 12 },
  roleBtn: { padding: "10px", borderRadius: 10, border: "none", background: "transparent", color: "var(--muted)", fontSize: 14, fontWeight: 600, transition: "all 0.2s" },
  roleBtnActive: { background: "var(--card)", color: "var(--text)", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
};

export const authStyles = {
  page: { minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" },
  card: { width: "100%", maxWidth: 420 },
  header: { textAlign: "center", marginBottom: 28 },
  title: { fontSize: 28, fontWeight: 800, letterSpacing: "-1px", marginBottom: 6 },
  footer: { textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--muted)" },
};
