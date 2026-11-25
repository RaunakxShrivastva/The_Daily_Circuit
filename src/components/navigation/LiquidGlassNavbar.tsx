import React, { useState, useEffect } from "react";
import { Sparkles, Layers, Volume2, VolumeX, Compass, ChevronUp } from "lucide-react";

interface LiquidGlassNavbarProps {
  viewMode: "3d" | "miranda";
  onViewChange: (mode: "3d" | "miranda") => void;
  startExpandedTrigger?: boolean;
}

export function LiquidGlassNavbar({ viewMode, onViewChange }: LiquidGlassNavbarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioHovered, setIsAudioHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Live clock formatted exactly like Mac status bar (e.g., "5:34")
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Track scroll position: At top -> Solid Mac Notch; When scrolled -> Apple Liquid Glass
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrolled = scrollY > 25;
      setIsScrolled(scrolled);
      // Reset manual toggle on significant scroll change
      setManualExpanded(null);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((scrollY / totalHeight) * 100)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine if navbar is expanded into Liquid Glass or collapsed as Solid Mac Notch
  const isExpanded = manualExpanded !== null ? manualExpanded : isScrolled;

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
      {/* Container morphing between Solid Mac Notch & Liquid Glass Capsule */}
      <nav
        onClick={() => {
          if (!isExpanded) setManualExpanded(true);
        }}
        className={`relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExpanded
            ? "w-[94vw] max-w-[890px] mt-2.5 px-3.5 py-2 rounded-full cursor-default"
            : "w-[180px] sm:w-[200px] h-[34px] px-4 py-0 flex items-center justify-center rounded-b-[18px] rounded-t-none cursor-pointer hover:opacity-95 group"
        }`}
        style={{
          // Solid pure black at start (Mac Notch), Apple Liquid Glass on scroll
          background: isExpanded ? "rgba(18, 16, 13, 0.78)" : "#000000",
          backdropFilter: isExpanded ? "blur(28px) saturate(200%)" : "none",
          WebkitBackdropFilter: isExpanded ? "blur(28px) saturate(200%)" : "none",
          border: isExpanded ? "1px solid rgba(255, 255, 255, 0.18)" : "none",
          boxShadow: isExpanded
            ? "0 20px 48px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 0 rgba(0, 0, 0, 0.6)"
            : "0 4px 16px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Authentic Mac Notch Side Concave Ears (Only visible in Solid Notch mode) */}
        <div 
          className={`transition-opacity duration-300 pointer-events-none ${
            isExpanded ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Left Concave Ear */}
          <svg 
            className="absolute -left-[12px] top-0 w-[12px] h-[12px] fill-black" 
            viewBox="0 0 12 12"
          >
            <path d="M0 0 C 6 0, 12 6, 12 12 L 12 0 Z" />
          </svg>

          {/* Right Concave Ear */}
          <svg 
            className="absolute -right-[12px] top-0 w-[12px] h-[12px] fill-black" 
            viewBox="0 0 12 12"
          >
            <path d="M12 0 C 6 0, 0 6, 0 12 L 0 0 Z" />
          </svg>
        </div>

        {/* Specular Liquid Sheen Sweep (Active in Liquid Glass expanded mode) */}
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
        {/* STATE A: SOLID MAC NOTCH (Exact look of the user's image) */}
        {/* ======================================================== */}
        {!isExpanded ? (
          <div className="w-full flex items-center justify-center text-white tracking-normal animate-fadeIn">
            <span className="text-[13px] font-sans font-medium text-white/95 select-none text-center">
              {currentTime || "5:34"}
            </span>
          </div>
        ) : (
          /* ======================================================== */
          /* STATE B: APPLE LIQUID GLASS EXPANDED CAPSULE NAVBAR       */
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
                  <span className="text-[10px] font-bold text-neutral-200 tracking-wider">
                    {currentTime ? `${currentTime} IST` : "06:00 IST"}
                  </span>
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
                onClick={(e) => {
                  e.stopPropagation();
                  onViewChange("3d");
                }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onViewChange("miranda");
                }}
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
                onClick={(e) => {
                  e.stopPropagation();
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

            {/* Right Section: 60s Voice Brief, Reading Progress & Collapse Toggle */}
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

              {/* Collapse to Solid Mac Notch Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setManualExpanded(false);
                }}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 flex items-center justify-center text-neutral-400 hover:text-amber-300 transition-all duration-200"
                title="Collapse into solid Mac Notch"
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
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </header>
  );
}
