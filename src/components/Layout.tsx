import { NavLink, Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const links = [
  { to: "/", label: "Beranda" },
  { to: "/docs", label: "Dokumentasi" },
  { to: "/test", label: "API Tester" },
  { to: "/explore", label: "Jelajah Kata" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.86)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--hairline-strong)",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", gap: 18, height: 64 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink)" }}>
          <span
            style={{
              width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center",
              background: "var(--primary)", color: "#ffffff",
              fontFamily: "var(--sans)", fontWeight: 700, fontSize: 17,
            }}
          >
            ꦛ
          </span>
          <span style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 16 }}>
            Kamus <span style={{ color: "var(--text-link)" }}>Jawa</span> API
          </span>
        </Link>

        <nav style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              style={({ isActive }) => ({
                padding: "8px 14px", borderRadius: 8, fontSize: "0.875rem", fontWeight: 500,
                color: isActive ? "var(--ink)" : "var(--body)",
                background: isActive ? "var(--surface-strong)" : "transparent",
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="btn btn-primary"
          onClick={() => window.open("/api/meta", "_blank")}
          style={{ display: "inline-flex", whiteSpace: "nowrap" }}
        >
          GET /api
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--hairline)", marginTop: 80, padding: "28px 0" }}>
      <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", color: "var(--muted)", fontSize: "0.85rem" }}>
        <span>Kamus Lengkap Basa Jawa · Ngoko · Krama · Krama Inggil</span>
        <span style={{ display: "flex", gap: 16 }}>
          <a href="/docs">Dokumentasi</a>
          <a href="/test">Tester</a>
          <a href="/api/openapi" target="_blank" rel="noreferrer">OpenAPI</a>
        </span>
      </div>
    </footer>
  );
}

export function Shell() {
  return (
    <>
      <Nav />
      <main style={{ minHeight: "70vh" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
