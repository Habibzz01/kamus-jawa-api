// ErrorBoundary — menangkap error render agar tidak tampil mentah
import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: any): State {
    return { hasError: true, message: err?.message || String(err) };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ paddingTop: 80, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.8rem" }}>Terjadi kesalahan</h1>
          <p style={{ color: "var(--body)" }}>
            {this.state.message || "Terjadi kesalahan yang tidak terduga."}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: 8 }}
          >
            Muat ulang halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
