import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Arwa Botaniqs] Uncaught error:", error, info);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24, backgroundColor: "#f5f0e8" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "3rem", color: "#c9a84c", marginBottom: 8 }}>500</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: "#1a3d2b", marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#5a7a5a", maxWidth: 420, lineHeight: 1.7, marginBottom: 28 }}>
            We apologise for the inconvenience. Please refresh the page or contact us if the issue persists.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => window.location.reload()}
              style={{ padding: "11px 28px", backgroundColor: "#1a3d2b", color: "#f5f0e8", fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
              Refresh Page
            </button>
            <a href="/"
              style={{ padding: "11px 28px", border: "1px solid rgba(26,61,43,0.3)", color: "#1a3d2b", fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none", display: "inline-block" }}>
              Go Home
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
