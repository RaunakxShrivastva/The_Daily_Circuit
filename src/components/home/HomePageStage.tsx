import React, { useState, useEffect } from "react";
import { ArrowDown, Sparkles, BookOpen, Volume2, Plus, Compass } from "lucide-react";

interface HomePageStageProps {
  onScrollToNewspaper: () => void;
}

export function HomePageStage({ onScrollToNewspaper }: HomePageStageProps) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Subtle 3D mouse parallax tracking for deep spatial layering
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMouseOffset({ x, y });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <section 
      id="home-stage"
      className="relative min-h-[95vh] sm:min-h-screen w-full flex flex-col justify-between px-4 sm:px-8 pt-24 pb-16 font-mono select-none overflow-hidden"
      style={{
        backgroundImage: "url('/images/main_bg.jpg')",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Layer 1: Ambient Garden Tint Wash */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 50% 30%, rgba(10, 8, 6, 0.2) 0%, rgba(10, 8, 6, 0.5) 75%, rgba(10, 8, 6, 0.8) 100%)",
        }}
      />

      {/* Layer 2: Grand Scale Renaissance Philosophers Artwork (Middleground with 3D Parallax) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mouseOffset.x * -14}px, ${mouseOffset.y * -10}px) scale(1.02)`,
        }}
      >
        <img 
          src="/images/philosophers_laptop.jpg" 
          alt="Philosophers debating AI laptop"
          className="w-full h-full object-cover object-center transition-all duration-700"
          style={{
            mixBlendMode: "screen",
            opacity: 0.86,
            filter: "contrast(1.15) saturate(1.15)",
            maskImage: "radial-gradient(ellipse 92% 82% at 50% 52%, black 45%, transparent 95%)",
            WebkitMaskImage: "radial-gradient(ellipse 92% 82% at 50% 52%, black 45%, transparent 95%)",
          }}
        />
      </div>

      {/* Layer 3: Atmospheric Chiaroscuro Depth Scrim (Creates strong spatial depth between artwork & text) */}
      <div 
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `
            radial-gradient(ellipse 75% 55% at 50% 34%, rgba(8, 7, 5, 0.72) 0%, rgba(8, 7, 5, 0.3) 65%, transparent 100%),
            linear-gradient(to bottom, rgba(5, 4, 3, 0.4) 0%, transparent 40%, rgba(5, 4, 3, 0.6) 100%)
          `,
        }}
      />

      {/* Layer 4: Foreground Hero Typography & Controls (Elevated in 3D Space) */}
      <div 
        className="relative z-10 max-w-5xl mx-auto w-full text-center space-y-4 pt-4 transition-transform duration-200 ease-out"
        style={{
          transform: `translate(${mouseOffset.x * 6}px, ${mouseOffset.y * 4}px)`,
        }}
      >
        {/* Apple Liquid Glass Pill Badge */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-white shadow-2xl"
          style={{
            background: "rgba(18, 16, 13, 0.75)",
            backdropFilter: "blur(24px) saturate(190%)",
            WebkitBackdropFilter: "blur(24px) saturate(190%)",
            border: "1px solid rgba(255, 255, 255, 0.35)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          <Sparkles size={12} className="text-amber-300" />
          <span className="font-bold">Home Space · The Digital Garden</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Master Nameplate Title with Deep Multi-Layered Drop Shadows */}
        <h1 
          className="text-5xl sm:text-7xl md:text-8xl font-serif font-black text-white tracking-tight leading-none"
          style={{
            textShadow: `
              0 4px 12px rgba(0, 0, 0, 0.95),
              0 18px 42px rgba(0, 0, 0, 0.85),
              0 0 60px rgba(255, 255, 255, 0.45)
            `,
          }}
        >
          THE DAILY CIRCUIT
        </h1>

        <p 
          className="max-w-2xl mx-auto font-serif italic text-base sm:text-xl text-neutral-100 leading-snug"
          style={{
            textShadow: "0 2px 14px rgba(0,0,0,0.95), 0 8px 24px rgba(0,0,0,0.8)",
          }}
        >
          "A calm, finite sanctuary for AI architecture, open computing, and thoughtful engineering."
        </p>

        {/* One-Click Action to Enter Broadsheet */}
        <div className="pt-2">
          <button
            onClick={onScrollToNewspaper}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-neutral-950 transition-all duration-300 shadow-[0_16px_36px_rgba(0,0,0,0.7)] hover:-translate-y-0.5 cursor-pointer"
            style={{
              background: "rgba(18, 16, 13, 0.85)",
              backdropFilter: "blur(24px) saturate(190%)",
              WebkitBackdropFilter: "blur(24px) saturate(190%)",
              border: "1px solid rgba(245, 158, 11, 0.55)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            <span>Open Today's 24H Broadsheet</span>
            <ArrowDown size={14} className="text-amber-400 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Layer 5: Bento Grid Cards (Heavy Liquid Glass with Deep Refraction) */}
      <div 
        className="relative z-10 max-w-6xl mx-auto w-full my-8 grid grid-cols-1 md:grid-cols-3 gap-6 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mouseOffset.x * 4}px, ${mouseOffset.y * 3}px)`,
        }}
      >
        {/* Card 1: 24-Hour Broadsheet Portal */}
        <div 
          onClick={onScrollToNewspaper}
          className="group cursor-pointer rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between min-h-[220px]"
          style={{
            background: "rgba(18, 16, 13, 0.72)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: "1px solid rgba(255, 255, 255, 0.28)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0,0,0,0.6)",
          }}
        >
          <div>
            <div className="flex items-center justify-between text-amber-400 mb-3">
              <BookOpen size={20} />
              <span className="text-[9px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full text-white">
                PAGE 01–08
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
              24-Hour Broadsheet
            </h3>
            <p className="text-xs text-neutral-200 leading-relaxed font-sans">
              Continuous zero-doomscroll morning edition with 8 curated pages: Front Wire, GPU Weather, Post-Mortems, and Hardware.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[10.5px] text-amber-300 font-bold group-hover:translate-x-1 transition-transform">
            <span>Scroll down to read newspaper</span> ↓
          </div>
        </div>

        {/* Card 2: 60-Second Audio Digest */}
        <div 
          className="rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between min-h-[220px]"
          style={{
            background: "rgba(18, 16, 13, 0.72)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: "1px solid rgba(255, 255, 255, 0.28)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0,0,0,0.6)",
          }}
        >
          <div>
            <div className="flex items-center justify-between text-emerald-400 mb-3">
              <Volume2 size={20} />
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded-full text-emerald-300">
                AUDIO COMPANION
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">
              60-Second Audio Digest
            </h3>
            <p className="text-xs text-neutral-200 leading-relaxed font-sans">
              Synthesized AI broadcaster voice summarizing today's key breakthroughs for quick morning commute listening.
            </p>
          </div>
          <div className="mt-4 text-[10px] text-emerald-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Docked on right margin (Click Audio tab)</span>
          </div>
        </div>

        {/* Card 3: Custom Canvas Slot */}
        <div 
          className="rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col items-center justify-center text-center group cursor-pointer min-h-[220px]"
          style={{
            background: "rgba(18, 16, 13, 0.72)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: "1px solid rgba(255, 255, 255, 0.28)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0,0,0,0.6)",
          }}
        >
          <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-amber-500/20 flex items-center justify-center mb-3 transition-colors border border-white/20 group-hover:border-amber-400/50">
            <Plus size={22} className="text-white group-hover:text-amber-300 transition-colors" />
          </div>
          <h3 className="font-serif text-lg font-bold text-white mb-1">
            Build Your Home Space
          </h3>
          <p className="text-xs text-neutral-200 max-w-xs font-sans">
            Yahan aap apna custom dashboard, projects, personal notes ya portfolio widgets add kar sakte hain.
          </p>
          <span className="mt-3 text-[9px] uppercase tracking-widest text-amber-400 font-bold">
            [ Custom Slot Ready ]
          </span>
        </div>
      </div>

      {/* Bottom Hint Banner before Broadsheet */}
      <div className="relative z-10 max-w-5xl mx-auto w-full text-center pt-2">
        <button
          onClick={onScrollToNewspaper}
          className="text-[10px] uppercase tracking-widest text-white/80 hover:text-amber-300 transition-colors inline-flex items-center gap-2 font-bold cursor-pointer"
        >
          <span>Scroll down to enter printed broadsheet</span>
          <ArrowDown size={12} className="animate-bounce text-amber-400" />
        </button>
      </div>
    </section>
  );
}
