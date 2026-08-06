import { Link } from "react-router-dom";
import { AnimatedContent, GradientText } from "../components/reactbits";

export default function NotFound() {
  return (
    <div className="container" style={{ paddingTop: 90, textAlign: "center" }}>
      <AnimatedContent>
        <div style={{ fontFamily: "var(--serif)", fontSize: "6rem", fontWeight: 700, lineHeight: 1 }}>
          <GradientText>404</GradientText>
        </div>
        <h2 style={{ marginTop: 4 }}>Waduh, dalane kesasar.</h2>
        <p style={{ color: "var(--text-2)" }}>Halaman yang kamu cari tidak ditemukan.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>← Kembali ke Beranda</Link>
      </AnimatedContent>
    </div>
  );
}
