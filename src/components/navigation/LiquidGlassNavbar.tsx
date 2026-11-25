import React, { useState, useEffect } from "react";
import { Sparkles, Layers, Volume2, VolumeX, Compass, ChevronDown, ChevronUp } from "lucide-react";

interface LiquidGlassNavbarProps {
  viewMode: "3d" | "miranda";
  onViewChange: (mode: "3d" | "miranda") => void;
  startExpandedTrigger?: boolean;
}

export function LiquidGlassNavbar({ viewMode, onViewChange, startExpandedTrigger }: LiquidGlassNavbarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioHovered, setIsAudioHovered] = useState(false);
  
  // Mac Notch State: Starts collapsed as a sleek Mac Notch, then expands upon starting
  const [isExpanded, setIsExpanded] = useState(false);

  // Trigger expansion when intro finishes (or fallback after 2200ms)
  useEffect(() => {
    if (startExpandedTrigger) {
      const timer = setTimeout(() => {
        setIsExpanded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [startExpandedTrigger]);

  // Fallback auto-expand in case intro was disabled or already seen
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setIsExpanded(true);
    }, 2800);
    return () => clearTimeout(fallbackTimer);
  }, []);

  // Track scroll depth percentage
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((window.scrollY / totalHeight) * 100)));
        setScrollProgress(progress);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Quick 60s broadcast toggle
  const toggleAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let audioEl = document.querySelector<HTMLAudioElement>('audio[src="/audio/daily_digest.mp3"]');
    if (!audioEl) {
      audioEl = new Audio("/audio/daily_digest.mp3");
      audioEl.id = "global-daily-circuit-audio";
      document.body.appendChild(audioEl);
    }

    if (isPlayingAudio) {
      audioEl.pause();
      setIsPlayingAudio(false);
    } else {
      audioEl.play().then(() => setIsPlayingAudio(true)).catch(console.error);
      audioEl.onended = () => setIsPlayingAudio(false);
    }
  };

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 z-50 select-none font-mono flex flex-col items-center pointer-events-auto">
      {/* Dynamic Mac Notch / Liquid Glass Expanding Capsule */}
      <nav
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
        className={`relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExpanded
            ? "w-[94vw] max-w-[890px] mt-2 sm:mt-2.5 px-3.5 py-2 rounded-full"
            : "w-[250px] sm:w-[270px] h-[35px] px-3.5 py-0 flex items-center justify-between rounded-b-2xl rounded-t-none cursor-pointer hover:border-amber-400/40 hover:shadow-[0_8px_24px_rgba(245,158,11,0.2)] hover:scale-[1.01] group"
        }`}
        style={{
          background: isExpanded ? "rgba(18, 16, 13, 0.78)" : "rgba(8, 7, 6, 0.95)",
          backdropFilter: "blur(28px) saturate(200%)",
          WebkitBackdropFilter: "blur(28px) saturate(200%)",
          border: isExpanded 
            ? "1px solid rgba(255, 255, 255, 0.18)" 
            : "1px solid rgba(255, 255, 255, 0.15)",
          borderTop: isExpanded ? undefined : "none",
          boxShadow: isExpanded
            ? "0 20px 48px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 0 rgba(0, 0, 0, 0.6)"
            : "0 12px 28px rgba(0, 0, 0, 0.85), inset 0 -1px 0 rgba(255, 255, 255, 0.15)",
        }}
      >
        {/* Specular Liquid Sheen Sweep (Active in expanded mode) */}
        {isExpanded && (
          <div 
            className="absolute inset-0 rounded-full pointer-events-none opacity-20 overflow-hidden"
            style={{
              background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)",
              backgroundSize: "200% 100%",
              animation: "liquidSheen 8s infinite ease-in-out",
            }}
          />
        )}

        {/* ======================================================== */}
        {/* STATE A: COLLAPSED MAC NOTCH VIEW (Compact MacBook Notch) */}
        {/* ======================================================== */}
        {!isExpanded ? (
          <div className="w-full flex items-center justify-between text-neutral-300">
            {/* Left: Brand Monogram + Clock */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm">
                <span className="font-serif font-black text-[7.5px] text-neutral-950">DC</span>
              </div>
              <span className="text-[9px] font-bold tracking-wider text-neutral-200">06:00</span>
            </div>

            {/* Center: MacBook FaceTime Camera Aperture + Indicator LED */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/70 border border-white/10 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0a] border border-neutral-700/80 flex items-center justify-center relative shadow-inner">
                <div className="w-1 h-1 rounded-full bg-neutral-800" />
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            </div>

            {/* Right: Audio / Read Status + Expand Chevron */}
            <div className="flex items-center gap-1 text-neutral-400 group-hover:text-amber-300 transition-colors">
              {isPlayingAudio ? (
                <div className="flex items-center gap-1 text-[8px] text-emerald-400 font-bold">
                  <Volume2 size={10} className="animate-pulse" />
                  <span>ON</span>
                </div>
              ) : (
                <span className="text-[8px] font-semibold tracking-wider text-neutral-400 group-hover:text-amber-300">
                  {scrollProgress > 0 ? `${scrollProgress}%` : "NOTCH"}
                </span>
              )}
              <ChevronDown size={11} className="transition-transform group-hover:translate-y-0.5 text-amber-400" />
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* STATE B: EXPANDED LIQUID GLASS FLOATING CAPSULE NAVBAR    */
          /* ======================================================== */
          <div className="flex items-center justify-between w-full animate-fadeIn transition-opacity duration-300">
            {/* Left Section: Brand & 24H Live Telemetry */}
            <div className="flex items-center gap-2.5 pl-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md border border-amber-300/40">
                <span className="font-serif font-black text-[10px] text-neutral-950">DC</span>
              </div>

              <div className="hidden sm:flex flex-col text-left leading-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-bold text-neutral-200 tracking-wider">06:00 IST</span>
                </div>
                <span className="text-[7.5px] uppercase tracking-widest text-neutral-400 mt-0.5">
                  EDITION NO. 1,428
                </span>
              </div>
            </div>

            {/* Center Section: View Mode Liquid Switcher */}
            <div 
              className="flex items-center gap-1 p-1 rounded-full border border-white/10"
              style={{ background: "rgba(0, 0, 0, 0.45)" }}
            >
              <button
                onClick={() => onViewChange("3d")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  viewMode === "3d"
                    ? "bg-[#c83e2b] text-white shadow-[0_2px_12px_rgba(200,62,43,0.5)] border border-red-400/30"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
                title="3D tactile 8-page broadsheet with realistic 3D page flips"
              >
                <Sparkles size={11} className={viewMode === "3d" ? "text-amber-300" : ""} />
                <span>3D Paper</span>
              </button>

              <button
                onClick={() => onViewChange("miranda")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  viewMode === "miranda"
                    ? "bg-[#c83e2b] text-white shadow-[0_2px_12px_rgba(200,62,43,0.5)] border border-red-400/30"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
                title="Awwwards-style Miranda continuous editorial broadsheet"
              >
                <Layers size={11} className={viewMode === "miranda" ? "text-amber-300" : ""} />
                <span>Miranda Editorial</span>
              </button>

              <button
                onClick={() => {
                  if (viewMode !== "miranda") {
                    onViewChange("miranda");
                    setTimeout(() => {
                      const el = document.getElementById("home-stage");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }, 120);
                  } else {
                    const el = document.getElementById("home-stage");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Scroll to full-screen Home Garden space"
              >
                <Compass size={11} className="text-emerald-400" />
                <span className="hidden sm:inline">Home Space</span>
              </button>
            </div>

            {/* Right Section: 60s Voice Brief, Progress & Collapse Notch Toggle */}
            <div className="flex items-center gap-1.5 pr-1">
              {/* Quick Voice Broadcast Pill */}
              <button
                onClick={toggleAudio}
                onMouseEnter={() => setIsAudioHovered(true)}
                onMouseLeave={() => setIsAudioHovered(false)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9.5px] font-bold border transition-all duration-200 ${
                  isPlayingAudio
                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    : "bg-white/5 hover:bg-white/10 border-white/15 text-neutral-300 hover:text-amber-400"
                }`}
                title="Play / Pause 60-second synthesized audio digest"
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX size={11} className="text-emerald-400 animate-pulse" />
                    <span className="hidden md:inline">Playing</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={11} className={isAudioHovered ? "text-amber-400" : "text-neutral-400"} />
                    <span className="hidden md:inline">60s Voice</span>
                  </>
                )}
              </button>

              {/* Reading Depth Progress Badge */}
              {viewMode === "miranda" && (
                <div 
                  className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-neutral-300"
                  title="Continuous broadsheet reading completion percentage"
                >
                  <Compass size={10} className="text-amber-400" />
                  <span>{scrollProgress}% Read</span>
                </div>
              )}

              {/* Collapse back to Mac Notch Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 flex items-center justify-center text-neutral-400 hover:text-amber-300 transition-all duration-200"
                title="Collapse into compact Mac Notch"
              >
                <ChevronUp size={13} />
              </button>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @keyframes liquidSheen {
          0% { background-position: -200% 0; }
          50% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </header>
  );
}
