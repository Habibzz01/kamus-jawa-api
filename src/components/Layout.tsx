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
        background: "rgba(14,12,10,0.82)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--line-soft)",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", gap: 18, paddingTop: 12, paddingBottom: 12 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text)" }}>
          <span
            style={{
              width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center",
              background: "linear-gradient(135deg, var(--gold), var(--amber))", color: "#221404",
              fontFamily: "var(--serif)", fontWeight: 700, fontSize: 18,
            }}
          >
            ꦛ
          </span>
          <span style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 17 }}>
            Kamus <span style={{ color: "var(--gold)" }}>Jawa</span> API
          </span>
        </Link>

        <nav style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              style={({ isActive }) => ({
                padding: "8px 14px", borderRadius: 999, fontSize: "0.9rem", fontWeight: 500,
                color: isActive ? "var(--gold-2)" : "var(--text-2)",
                background: isActive ? "rgba(227,179,100,0.10)" : "transparent",
                border: isActive ? "1px solid var(--line)" : "1px solid transparent",
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
    <footer style={{ borderTop: "1px solid var(--line-soft)", marginTop: 80, padding: "28px 0" }}>
      <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", color: "var(--text-3)", fontSize: "0.85rem" }}>
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
