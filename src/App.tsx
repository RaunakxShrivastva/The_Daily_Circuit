import { useState, useEffect, useCallback } from "react";
import { MirandaNewspaper } from "./components/MirandaNewspaper";
import { LiquidGlassNavbar } from "./components/navigation/LiquidGlassNavbar";
import { CinematicIntroOverlay } from "./components/motion/CinematicIntroOverlay";
import { CursorAssemblyEngine } from "./components/motion/CursorAssemblyEngine";
import { InkyMascot } from "./components/InkyMascot";
import { InkyLiquidGlassChat } from "./components/chat/InkyLiquidGlassChat";

export default function App() {
  const [viewMode, setViewMode] = useState<"3d" | "miranda">("miranda");
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [introDone, setIntroDone] = useState(false);

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
        height: "auto",
        minHeight: "100vh",
        overflowX: "hidden",
        overflowY: "auto",
        backgroundColor: "#0d0b09",
      }}
    >
      {/* Cinematic Linotype Stamp Awakening on Initial Landing */}
      <CinematicIntroOverlay onComplete={handleIntroComplete} />

      {/* 5 Autonomous AI Editors Multiplayer Cursor Assembly Engine */}
      <CursorAssemblyEngine active={introDone} />

      {/* Impressionist Botanical Oil Painting Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/main_bg.jpg')",
          backgroundAttachment: "fixed",
          opacity: 0.88,
        }}
      />

      {/* Soft Vignette Overlay for Depth & High-Contrast Reading */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 25%, rgba(13, 11, 9, 0.2) 0%, rgba(13, 11, 9, 0.55) 60%, rgba(13, 11, 9, 0.85) 100%)",
        }}
      />

      {/* Interactive Ambient Desk Lamp (Follows mouse behind paper with warm gold glow) */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 230, 180, 0.08), transparent 75%)`,
        }}
      />

      {/* Dynamic Mac Notch / Apple Liquid Glass Floating Capsule Navbar */}
      <LiquidGlassNavbar 
        viewMode={viewMode} 
        onViewChange={handleViewChange} 
        startExpandedTrigger={introDone}
      />

      {/* Autonomous Editorial Inky Mascot with Physics & Perch */}
      <InkyMascot defaultTheme="obsidian" />

      {/* Apple HIG / macOS Tahoe Liquid Glass Inky Chatbot */}
      <InkyLiquidGlassChat />

      {/* Main Experience View (Full bleed, unified page flow for both 2D and 3D modes) */}
      <div className="relative z-10">
        <MirandaNewspaper viewMode={viewMode} />
      </div>
    </div>
  );
}
