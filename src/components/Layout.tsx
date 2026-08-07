import { NavLink, Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, BookOpen, Code, Layers, GraduationCap, ArrowRightLeft, Share2 } from "./Icon";
import ErrorBoundary from "./ErrorBoundary";
import SpecularButton from "./reactbits/SpecularButton";

const LINKS = [
  { to: "/", label: "Beranda", icon: null },
  { to: "/docs", label: "Dokumentasi", icon: BookOpen },
  { to: "/test", label: "Tester", icon: Code },
  { to: "/terjemah", label: "Terjemah", icon: ArrowRightLeft },
  { to: "/tingkatan", label: "Tingkatan", icon: GraduationCap },
  { to: "/explore", label: "Jelajah", icon: Layers },
];

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document !== "undefined") {
      const saved = document.documentElement.getAttribute("data-theme");
      if (saved === "dark" || saved === "light") return saved;
    }
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("kamus-theme", theme);
    } catch {
      /* abaikan */
    }
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) };
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header className="nav-header">
      <div className="container nav-row">
        <Link to="/" className="nav-logo" onClick={() => setOpen(false)}>
          <span className="nav-mark">ꦛ</span>
          <span>
            Kamus <span className="nav-accent">Jawa</span> API
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="nav-desktop">
          {LINKS.map((l) => {
            const Ico = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                {Ico && <Ico size={15} style={{ verticalAlign: "-2px", marginRight: 5 }} />}
                {l.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Tombol Social Media Developer — di bawah item Jelajah */}
        <Link
          to="/devsoc"
          className="nav-link devsoc-link"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid var(--hairline-strong)", background: "var(--surface-card)" }}
        >
          <Share2 size={14} />
          Social Media Developer
        </Link>

        <SpecularButton
          className="nav-cta"
          size="sm"
          radius={8}
          textColor="#ffffff"
          lineColor="#ffffff"
          baseColor="#171717"
          tint="#ffffff"
          tintOpacity={0.08}
          intensity={1}
          shineSize={13}
          shineFade={44}
          thickness={1.1}
          followMouse
          proximity={220}
          onClick={() => window.open("/api/meta", "_blank")}
        >
          API
        </SpecularButton>

        {/* Toggle tema — ikon SVG, tanpa emoji */}
        <motion.button
          className="theme-toggle"
          onClick={toggle}
          aria-label={theme === "dark" ? "Mode terang" : "Mode gelap"}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.06 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.22 }}
              style={{ display: "inline-flex" }}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Burger */}
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

      {/* Nav mobile — animasi buka/tutup */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.65, 0.28, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="nav-mobile-inner">
              <div className="container" style={{ paddingTop: 8, paddingBottom: 12 }}>
                {LINKS.map((l, i) => {
                  const Ico = l.icon;
                  return (
                    <motion.div
                      key={l.to}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.28, ease: "easeOut" }}
                    >
                      <NavLink
                        to={l.to}
                        end={l.to === "/"}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                        style={{ display: "flex", alignItems: "center", gap: 10 }}
                      >
                        {Ico && <Ico size={17} />}
                        {l.label}
                      </NavLink>
                    </motion.div>
                  );
                })}
                <motion.div
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.28, ease: "easeOut" }}
                >
                  <Link
                    to="/devsoc"
                    onClick={() => setOpen(false)}
                    className="nav-link"
                    style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}
                  >
                    <Share2 size={17} />
                    Social Media Developer
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.36, duration: 0.25 }}
                  style={{ padding: "10px 4px 2px" }}
                >
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      window.open("/api/meta", "_blank");
                      setOpen(false);
                    }}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    API
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--hairline-strong)", marginTop: 80, padding: "28px 0" }}>
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "space-between",
          color: "var(--muted)",
          fontSize: "0.85rem",
        }}
      >
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
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
