import { useState } from "react";
import { FiniteBroadsheet } from "./components/FiniteBroadsheet";
import { MirandaNewspaper } from "./components/MirandaNewspaper";
import { Sparkles, Layers } from "lucide-react";

export default function App() {
  const [viewMode, setViewMode] = useState<"3d" | "miranda">("miranda");

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: viewMode === "miranda" ? "auto" : "100vh",
        minHeight: "100vh",
        overflowX: "hidden",
        overflowY: viewMode === "miranda" ? "auto" : "hidden",
      }}
    >
      {/* Top Centered Floating View Switcher Pill */}
      <div 
        style={{
          position: "fixed",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          gap: 6,
          background: "rgba(18, 16, 13, 0.94)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          padding: "4px 6px",
          borderRadius: 30,
          boxShadow: "0 12px 36px rgba(0,0,0,0.75)"
        }}
      >
        <button
          onClick={() => setViewMode("3d")}
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10.5,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 15px",
            borderRadius: 20,
            background: viewMode === "3d" ? "#c83e2b" : "transparent",
            color: viewMode === "3d" ? "#ffffff" : "rgba(255,255,255,0.75)",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            transition: "all 160ms ease"
          }}
          title="3D tactile 8-page broadsheet with realistic 3D flip animation"
        >
          <Sparkles size={12} /> 3D Broadsheet
        </button>

        <button
          onClick={() => setViewMode("miranda")}
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10.5,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 15px",
            borderRadius: 20,
            background: viewMode === "miranda" ? "#c83e2b" : "transparent",
            color: viewMode === "miranda" ? "#ffffff" : "rgba(255,255,255,0.75)",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            transition: "all 160ms ease"
          }}
          title="Awwwards-style Miranda scrollytelling editorial"
        >
          <Layers size={12} /> Miranda Editorial
        </button>
      </div>

      {viewMode === "3d" ? <FiniteBroadsheet /> : <MirandaNewspaper />}
    </div>
  );
}
