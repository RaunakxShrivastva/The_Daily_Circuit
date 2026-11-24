import { useState, useEffect } from "react";
import { Sparkles, Radio, Zap } from "lucide-react";

interface CinematicIntroOverlayProps {
  onComplete?: () => void;
}

export function CinematicIntroOverlay({ onComplete }: CinematicIntroOverlayProps) {
  const [phase, setPhase] = useState<"idle" | "trace" | "stamp" | "unveil" | "done">("idle");

  useEffect(() => {
    // Stage 1: Electric circuit trace fires (0ms)
    const t1 = setTimeout(() => setPhase("trace"), 100);
    // Stage 2: Heavy Linotype letterpress stamp punches down (550ms)
    const t2 = setTimeout(() => setPhase("stamp"), 650);
    // Stage 3: Broadside paper reveals and overlay dissolves (1300ms)
    const t3 = setTimeout(() => setPhase("unveil"), 1400);
    // Stage 4: Overlay unmounts completely (1850ms)
    const t4 = setTimeout(() => {
      setPhase("done");
      if (onComplete) onComplete();
    }, 1850);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPhase("done");
        if (onComplete) onComplete();
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      onClick={() => {
        setPhase("done");
        if (onComplete) onComplete();
      }}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none cursor-pointer font-mono transition-opacity duration-500 ${
        phase === "unveil" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundColor: "#0d0b09",
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(200, 62, 43, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 40%)
        `,
      }}
    >
      {/* Background Micro-Noise Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Center Hero Stage */}
      <div className="relative flex flex-col items-center text-center px-6 max-w-xl">
        {/* Stage 1: Glowing Copper Circuit Trace Line */}
        <div className="relative w-72 h-[2px] bg-neutral-800 mb-8 overflow-hidden rounded-full">
          <div
            className={`h-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-300 transition-all duration-700 ease-out ${
              phase === "idle" ? "w-0 opacity-0" : "w-full opacity-100 shadow-[0_0_16px_rgba(245,158,11,0.8)]"
            }`}
          />
        </div>

        {/* Top Telegraph Tag */}
        <div
          className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-amber-500/90 mb-3 transition-all duration-500 ${
            phase === "idle" ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          <Radio size={12} className="animate-pulse text-amber-400" />
          <span>PRESS EMBARGO LIFTED · 06:00 IST</span>
        </div>

        {/* Stage 2: Heavy Letterpress Typography Stamp */}
        <div
          className={`transition-all duration-300 ${
            phase === "stamp" || phase === "unveil"
              ? "opacity-100 scale-100"
              : "opacity-0 scale-110 filter blur-[4px]"
          }`}
          style={{
            transform: phase === "stamp" ? "scale(1)" : undefined,
          }}
        >
          <h1 
            className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-[#f5ebd7] uppercase leading-none drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)]"
            style={{
              textShadow: "0 0 24px rgba(245, 235, 215, 0.35), 0 4px 12px rgba(0,0,0,0.8)",
            }}
          >
            THE DAILY CIRCUIT
          </h1>

          <p className="mt-3 text-xs sm:text-sm font-serif italic text-neutral-300 tracking-wide">
            "The Finite Broadsheet of the Intelligence Age"
          </p>
        </div>

        {/* Stage 3: Circular Wax Seal Stamp & Anti-Doomscroll Badge */}
        <div
          className={`mt-8 flex items-center gap-3 transition-all duration-500 delay-150 ${
            phase === "stamp" || phase === "unveil"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c1813] border border-amber-500/40 shadow-lg">
            <Zap size={11} className="text-amber-400" />
            <span className="text-[9px] uppercase tracking-widest text-neutral-300 font-bold">
              ZERO-DOOMSCROLL · FINITE 24H EDITION
            </span>
          </div>
        </div>
      </div>

      {/* Skip Button Bottom Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setPhase("done");
          if (onComplete) onComplete();
        }}
        className="absolute bottom-6 right-8 text-[9px] uppercase tracking-widest text-neutral-500 hover:text-amber-400 transition-colors border border-neutral-800 hover:border-amber-500/40 px-3 py-1.5 rounded-lg bg-black/40"
      >
        Skip [Esc] →
      </button>
    </div>
  );
}
