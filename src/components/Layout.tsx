import { NavLink, Link, Outlet } from "react-router-dom";
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
    <header className="nav-header">
      <div className="container nav-row">
        <Link to="/" className="nav-logo" onClick={() => setOpen(false)}>
          <span className="nav-mark">ꦛ</span>
          <span>
            Kamus <span className="nav-accent">Jawa</span> API
          </span>
        </Link>

        <nav className={"nav-links" + (open ? " open" : "")}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="btn btn-primary nav-cta"
          onClick={() => window.open("/api/meta", "_blank")}
          style={{ whiteSpace: "nowrap" }}
        >
          GET /api
        </button>

        <button
          className={"nav-burger" + (open ? " open" : "")}
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--hairline-strong)", marginTop: 80, padding: "28px 0" }}>
      <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", color: "var(--muted)", fontSize: "0.85rem" }}>
        <span>Kamus Lengkap Basa Jawa · Ngoko · Krama · Krama Inggil</span>
        <span style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
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
