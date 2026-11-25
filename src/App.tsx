import { useState, useEffect, useCallback } from "react";
import { FiniteBroadsheet } from "./components/FiniteBroadsheet";
import { MirandaNewspaper } from "./components/MirandaNewspaper";
import { LiquidGlassNavbar } from "./components/navigation/LiquidGlassNavbar";
import { CursorAssemblyEngine } from "./components/motion/CursorAssemblyEngine";

export default function App() {
  const [viewMode, setViewMode] = useState<"3d" | "miranda">("miranda");
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [introDone, setIntroDone] = useState(false);

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
        height: viewMode === "miranda" ? "auto" : "100vh",
        minHeight: "100vh",
        overflowX: "hidden",
        overflowY: viewMode === "miranda" ? "auto" : "hidden",
        backgroundColor: "#0d0b09",
      }}
    >
      {/* 5 Autonomous AI Editors Multiplayer Cursor Assembly Engine */}
      <CursorAssemblyEngine />

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
        onViewChange={setViewMode} 
        startExpandedTrigger={introDone}
      />

      {/* Main Experience View (Full bleed, no top padding gap) */}
      <div className="relative z-10">
        {viewMode === "3d" ? <FiniteBroadsheet /> : <MirandaNewspaper />}
      </div>
    </div>
  );
}
