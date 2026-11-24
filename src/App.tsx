import { useState, useEffect } from "react";
import { FiniteBroadsheet } from "./components/FiniteBroadsheet";
import { MirandaNewspaper } from "./components/MirandaNewspaper";
import { LiquidGlassNavbar } from "./components/navigation/LiquidGlassNavbar";
import { CinematicIntroOverlay } from "./components/motion/CinematicIntroOverlay";

export default function App() {
  const [viewMode, setViewMode] = useState<"3d" | "miranda">("miranda");
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  // Interactive ambient desk spotlight tracking mouse
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: viewMode === "miranda" ? "auto" : "100vh",
        minHeight: "100vh",
        overflowX: "hidden",
        overflowY: viewMode === "miranda" ? "auto" : "hidden",
        backgroundColor: "#0d0b09",
      }}
    >
      {/* Cinematic Linotype Stamp Awakening on Initial Landing */}
      <CinematicIntroOverlay />

      {/* Interactive Ambient Desk Lamp (Follows mouse behind paper with warm gold glow) */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(235, 175, 95, 0.055), transparent 75%)`,
        }}
      />

      {/* Apple Liquid Glass Floating Capsule Navbar */}
      <LiquidGlassNavbar viewMode={viewMode} onViewChange={setViewMode} />

      {/* Main Experience View */}
      <div className="relative z-10 pt-10 sm:pt-12">
        {viewMode === "3d" ? <FiniteBroadsheet /> : <MirandaNewspaper />}
      </div>
    </div>
  );
}
