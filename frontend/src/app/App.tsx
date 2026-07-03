import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { StoreProvider } from "./store";
import { router } from "./routes";
import { GLOBAL_CSS, C } from "./shared";
import { ErrorBoundary } from "./components/ErrorBoundary";

function PageLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: C.green }}>
      <div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 700, color: C.gold, textAlign: "center", letterSpacing: "0.15em" }}>AB</div>
        <div style={{ height: 1, width: 120, overflow: "hidden", backgroundColor: "rgba(201,168,76,0.2)", marginTop: 12 }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`, backgroundSize: "200% 100%", animation: "shimmerBar 1.6s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <ErrorBoundary>
        <StoreProvider>
          <Suspense fallback={<PageLoader />}>
            <RouterProvider router={router} />
          </Suspense>
        </StoreProvider>
      </ErrorBoundary>
    </>
  );
}
