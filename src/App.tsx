import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { MirandaNewspaper } from "./components/MirandaNewspaper";
import { LiquidGlassNavbar } from "./components/navigation/LiquidGlassNavbar";
import { CinematicIntroOverlay } from "./components/motion/CinematicIntroOverlay";
import { CursorAssemblyEngine } from "./components/motion/CursorAssemblyEngine";

const InkyMascot = lazy(() =>
  import("./components/InkyMascot").then((m) => ({ default: m.InkyMascot }))
);
const InkyLiquidGlassChat = lazy(() =>
  import("./components/chat/InkyLiquidGlassChat").then((m) => ({
    default: m.InkyLiquidGlassChat,
  }))
);

export default function App() {
  const [viewMode, setViewMode] = useState<"3d" | "miranda">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "3d") return "3d";
      if (params.get("mode") === "2d") return "miranda";
    }
    return "miranda";
  });
  const [introDone, setIntroDone] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Always reset and start from the top of the Home page on refresh/reload
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const handleViewChange = useCallback((mode: "3d" | "miranda") => {
    setViewMode(mode);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
  }, []);

  // Zero-re-render ambient desk spotlight tracking mouse via rAF + direct DOM style
  useEffect(() => {
    let rafId = 0;
    let latestX = -1000;
    let latestY = -1000;

    const updateSpotlight = () => {
      rafId = 0;
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(750px circle at ${latestX}px ${latestY}px, rgba(255, 230, 180, 0.08), transparent 75%)`;
      }
    };

    const handleMove = (e: MouseEvent) => {
      latestX = e.clientX;
      latestY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(updateSpotlight);
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "auto",
        minHeight: "100vh",
        overflowX: "clip",
        backgroundColor: "#0d0b09",
      }}
    >
      {/* Cinematic Linotype Stamp Awakening on Initial Landing */}
      <CinematicIntroOverlay onComplete={handleIntroComplete} />

      {/* 5 Autonomous AI Editors Multiplayer Cursor Assembly Engine */}
      <CursorAssemblyEngine active={introDone} />

      {/* Impressionist Botanical Oil Painting Background - GPU-composited fixed layer without backgroundAttachment:fixed repaint */}
      {viewMode !== "3d" && (
        <div
          className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-opacity duration-500 will-change-transform"
          style={{
            backgroundImage: "url('/images/main_bg.jpg')",
            opacity: 0.88,
          }}
        />
      )}

      {/* Soft Vignette Overlay for Depth & High-Contrast Reading */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 25%, rgba(13, 11, 9, 0.2) 0%, rgba(13, 11, 9, 0.55) 60%, rgba(13, 11, 9, 0.85) 100%)",
        }}
      />

      {/* Interactive Ambient Desk Lamp (Direct DOM rAF update — zero React re-renders) */}
      <div
        ref={spotlightRef}
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      />

      {/* Dynamic Mac Notch / Apple Liquid Glass Floating Capsule Navbar */}
      <LiquidGlassNavbar
        viewMode={viewMode}
        onViewChange={handleViewChange}
        startExpandedTrigger={introDone}
      />

      {/* Autonomous Editorial Inky Mascot & Liquid Glass Chatbot (Code-split) */}
      <Suspense fallback={null}>
        <InkyMascot defaultTheme="obsidian" />
        <InkyLiquidGlassChat />
      </Suspense>

      {/* Main Experience View (Full bleed, unified page flow for both 2D and 3D modes) */}
      <div className="relative z-10">
        <MirandaNewspaper viewMode={viewMode} />
      </div>
    </div>
  );
}
