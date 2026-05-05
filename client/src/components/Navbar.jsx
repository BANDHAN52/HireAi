// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          Hire<span style={{ color: "brown" }}>A𝒾</span>
        </Link>

        {/* Hire<span style={{ color: "var(--accent2)" }}>AI</span> */}


        {/* Desktop Nav Links */}
        <div style={styles.links} className="hide-mobile">
          <Link to="/jobs" style={{ ...styles.link, ...(isActive("/jobs") ? styles.linkActive : {}) }}>
            Browse Jobs
          </Link>
          {user?.role === "company" && (
            <>
              <Link to="/post-job" style={{ ...styles.link, ...(isActive("/post-job") ? styles.linkActive : {}) }}>
                Post a Job
              </Link>
              <Link to="/dashboard" style={{ ...styles.link, ...(isActive("/dashboard") ? styles.linkActive : {}) }}>
                Dashboard
              </Link>
            </>
          )}
          {user?.role === "seeker" && (
            <Link to="/my-applications" style={{ ...styles.link, ...(isActive("/my-applications") ? styles.linkActive : {}) }}>
              My Applications
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div style={styles.auth} className="hide-mobile">
          {user ? (
            <div style={styles.userMenu}>
              <Link to="/profile" style={styles.avatar}>
                {user.name?.charAt(0).toUpperCase()}
              </Link>
              <div style={styles.userInfo}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</span>
                <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "capitalize" }}>{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ ...styles.hamburger, display: "none" }}
          className="mobile-menu-btn"
        >☰</button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/jobs" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
          {user?.role === "company" && <>
            <Link to="/post-job" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Post a Job</Link>
            <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
          </>}
          {user?.role === "seeker" && <Link to="/my-applications" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Applications</Link>}
          {user ? (
            <>
              <Link to="/profile" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ ...styles.mobileLink, background: "none", border: "none", textAlign: "left", color: "var(--accent2)", width: "100%" }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}



//  nav: { background: "var(--surface)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 100 },
const styles = {
  nav: { background: "var(--surface)", position: "sticky", top: 0, zIndex: 100 },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" },
  links: { display: "flex", alignItems: "center", gap: 4 },
  link: { padding: "6px 14px", borderRadius: 8, fontSize: 14, color: "var(--muted)", transition: "all 0.2s", fontWeight: 500 },
  linkActive: { color: "var(--text)", background: "var(--surface2)" },
  auth: { display: "flex", alignItems: "center", gap: 8 },
  userMenu: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "white" },
  userInfo: { display: "flex", flexDirection: "column" },
  hamburger: { background: "none", border: "none", color: "var(--text)", fontSize: 22, padding: 4 },
  mobileMenu: { background: "var(--surface2)", borderTop: "1px solid var(--border)", padding: "12px 24px", display: "flex", flexDirection: "column", gap: 4 },
  mobileLink: { padding: "10px 0", fontSize: 15, color: "var(--text)", borderBottom: "1px solid var(--border)", display: "block" },
};
