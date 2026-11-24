import React, { useState, useEffect, useRef, useCallback } from "react";
import { Radio, Zap } from "lucide-react";

interface CinematicIntroOverlayProps {
  onComplete?: () => void;
}

export function CinematicIntroOverlay({ onComplete }: CinematicIntroOverlayProps) {
  const [phase, setPhase] = useState<"idle" | "hands" | "trace" | "stamp" | "unveil" | "done">("idle");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const finishIntro = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase("done");
    if (onComplete) onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Stage 1: Artwork hands and constellation illuminate softly (150ms)
    timersRef.current.push(setTimeout(() => setPhase("hands"), 150));
    // Stage 2: Electric synapse spark bridges the fingertips (1100ms)
    timersRef.current.push(setTimeout(() => setPhase("trace"), 1100));
    // Stage 3: Heavy Linotype letterpress punch down (2300ms)
    timersRef.current.push(setTimeout(() => setPhase("stamp"), 2300));
    // Stage 4: Overlay dissolves smoothly into the live newspaper (4000ms)
    timersRef.current.push(setTimeout(() => setPhase("unveil"), 4000));
    // Stage 5: Unmount completely (4700ms)
    timersRef.current.push(setTimeout(() => {
      finishIntro();
    }, 4700));

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        finishIntro();
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      window.removeEventListener("keydown", handleKey);
    };
  }, [finishIntro]);

  if (phase === "done") return null;

  return (
    <div
      onClick={finishIntro}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none cursor-pointer font-mono transition-opacity duration-700 ${
        phase === "unveil" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundColor: "#050403",
      }}
    >
      {/* User's Stippled Creation of Intelligence Artwork Background */}
      <div 
        className="absolute inset-0 bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/images/intro_bg.jpg')",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          opacity: phase === "idle" ? 0 : 0.9,
          transform: phase === "idle" ? "scale(1.08)" : "scale(1.0)",
          transition: "transform 4.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.4s ease-out",
        }}
      />

      {/* Subtle Vignette & Dark Overlay for Text Legibility & Contrast */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(5, 4, 3, 0.45) 0%, rgba(5, 4, 3, 0.88) 75%, #050403 100%)",
        }}
      />

      {/* Center Hero Stage */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Stage 2: Electric Sparkline bridging the fingertips */}
        <div className="relative w-80 h-[2px] bg-white/10 mb-8 overflow-hidden rounded-full">
          <div
            className={`h-full bg-gradient-to-r from-amber-400 via-white to-amber-300 transition-all duration-1000 ease-out ${
              phase === "idle" || phase === "hands" 
                ? "w-0 opacity-0" 
                : "w-full opacity-100 shadow-[0_0_24px_rgba(255,255,255,0.95),0_0_12px_rgba(245,158,11,0.9)]"
            }`}
          />
        </div>

        {/* Top Telegraph Tag */}
        <div
          className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] font-bold text-amber-400/90 mb-4 transition-all duration-700 ${
            phase === "idle" || phase === "hands" 
              ? "opacity-0 -translate-y-3" 
              : "opacity-100 translate-y-0"
          }`}
        >
          <Radio size={12} className="animate-pulse text-amber-400" />
          <span>PRESS EMBARGO LIFTED · 06:00 IST</span>
        </div>

        {/* Stage 3: Heavy Letterpress Typography Stamp */}
        <div
          className={`transition-all duration-700 ${
            phase === "stamp" || phase === "unveil"
              ? "opacity-100 scale-100 filter blur-0"
              : "opacity-0 scale-108 filter blur-[6px]"
          }`}
        >
          <h1 
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight text-[#fbf5e8] uppercase leading-none"
            style={{
              textShadow: "0 0 32px rgba(251, 245, 232, 0.4), 0 8px 24px rgba(0,0,0,0.95)",
            }}
          >
            THE DAILY CIRCUIT
          </h1>

          <p className="mt-4 text-xs sm:text-sm font-serif italic text-neutral-200 tracking-wide">
            "The Finite Broadsheet of the Intelligence Age"
          </p>
        </div>

        {/* Stage 4: Finite 24H Badge */}
        <div
          className={`mt-8 flex items-center gap-3 transition-all duration-700 delay-200 ${
            phase === "stamp" || phase === "unveil"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 shadow-2xl">
            <Zap size={11} className="text-amber-400" />
            <span className="text-[9px] uppercase tracking-widest text-neutral-200 font-bold">
              ZERO-DOOMSCROLL · FINITE 24H EDITION
            </span>
          </div>
        </div>
      </div>

      {/* Skip Button Bottom Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          finishIntro();
        }}
        className="absolute bottom-6 right-8 text-[9px] uppercase tracking-widest text-neutral-400 hover:text-white transition-colors border border-white/20 hover:border-amber-400 px-3.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm"
      >
        Skip [Esc] →
      </button>
    </div>
  );
}
