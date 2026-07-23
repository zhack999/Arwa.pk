import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";

// ─── Smooth Scroll ──────────────────────────────────────────────────────────
// IMPORTANT: Lenis (unlike some smooth-scroll libraries) scrolls the real
// document and keeps window.scrollY accurate — it just interpolates the
// motion between scroll events. This matters here specifically because
// Root.tsx's navbar hide/show logic reads window.scrollY directly. A
// transform-based smooth scroller (one that moves a wrapper div instead of
// the page) would silently break that navbar logic. Lenis does not.
//
// Respects prefers-reduced-motion: people who've asked their OS for reduced
// motion get instant native scrolling, not smoothed — this isn't just a
// nicety, smoothed scrolling can trigger vestibular discomfort for the
// people that setting exists to protect.
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return; // native scroll, no Lenis instance created

    const lenis = new Lenis({
      duration: 1.1,           // slightly slower than default — reads as "buttery," not sluggish
      easing: t => Math.min(1, 1 - Math.pow(2, -10 * t)), // exponential ease-out
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;
    // Exposed so other components (e.g. a "back to top" button) can hand
    // their scroll calls to Lenis instead of native window.scrollTo — mixing
    // the two fights over scroll position and produces a stutter.
    (window as any).__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      (window as any).__lenis = null;
    };
  }, []);

  // Anchor links (<a href="#section">) need to go through Lenis too, or
  // they'll jump instantly while everything else glides — this catches
  // clicks on in-page anchors anywhere in the app and hands them to Lenis.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href")?.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { offset: -90 }); // clears the fixed navbar
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return <>{children}</>;
}
