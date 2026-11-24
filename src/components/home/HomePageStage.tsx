import React from "react";
import { ArrowUp, Sparkles, BookOpen, Volume2, Code2, Globe, Heart, Compass, Plus } from "lucide-react";

interface HomePageStageProps {
  onScrollToNewspaper: () => void;
}

export function HomePageStage({ onScrollToNewspaper }: HomePageStageProps) {
  return (
    <section 
      id="home-stage"
      className="relative min-h-screen w-full flex flex-col justify-between px-4 sm:px-8 py-20 font-mono select-none"
    >
      {/* Top Welcome Anchor */}
      <div className="max-w-5xl mx-auto w-full pt-10 text-center space-y-4">
        {/* Floating Liquid Glass Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl text-[10px] uppercase tracking-widest text-white/90">
          <Sparkles size={12} className="text-amber-300" />
          <span>Home Space · The Digital Garden</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Master Home Title */}
        <h1 
          className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-white tracking-tight leading-none drop-shadow-[0_12px_36px_rgba(0,0,0,0.8)]"
          style={{
            textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.3)"
          }}
        >
          THE DAILY CIRCUIT
        </h1>

        <p className="max-w-xl mx-auto font-serif italic text-base sm:text-lg text-white/90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          "A calm, finite sanctuary for AI architecture, open computing, and thoughtful engineering."
        </p>

        {/* One-Click Return to Newspaper Button */}
        <div className="pt-2">
          <button
            onClick={onScrollToNewspaper}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1b1713]/85 hover:bg-[#2c2620] text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400 shadow-[0_12px_28px_rgba(0,0,0,0.7)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 text-xs font-bold"
          >
            <ArrowUp size={14} className="text-amber-400 animate-bounce" />
            <span>Read Today's 24H Broadsheet</span>
          </button>
        </div>
      </div>

      {/* Bento Grid: Liquid Glass Modular Cards (Ready for User to Build) */}
      <div className="max-w-6xl mx-auto w-full my-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Broadsheet Quick Telemetry */}
        <div 
          onClick={onScrollToNewspaper}
          className="group cursor-pointer rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          style={{
            background: "rgba(18, 16, 13, 0.65)",
            backdropFilter: "blur(24px) saturate(190%)",
            WebkitBackdropFilter: "blur(24px) saturate(190%)",
            border: "1px solid rgba(255, 255, 255, 0.22)",
            boxShadow: "0 20px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          <div className="flex items-center justify-between text-amber-400 mb-4">
            <BookOpen size={20} />
            <span className="text-[9px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full text-white">
              PAGE 01–08
            </span>
          </div>
          <h3 className="font-serif text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
            24-Hour Broadsheet
          </h3>
          <p className="text-xs text-neutral-200/90 leading-relaxed font-sans">
            Continuous zero-doomscroll morning edition with 8 curated pages: Front Wire, GPU Weather, Post-Mortems, and Hardware.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-amber-300 font-bold">
            <span>Scroll up to read</span> →
          </div>
        </div>

        {/* Card 2: 60s Voice Briefing Deck */}
        <div 
          className="rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          style={{
            background: "rgba(18, 16, 13, 0.65)",
            backdropFilter: "blur(24px) saturate(190%)",
            WebkitBackdropFilter: "blur(24px) saturate(190%)",
            border: "1px solid rgba(255, 255, 255, 0.22)",
            boxShadow: "0 20px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          <div className="flex items-center justify-between text-emerald-400 mb-4">
            <Volume2 size={20} />
            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded-full text-emerald-300">
              AUDIO COMPANION
            </span>
          </div>
          <h3 className="font-serif text-xl font-bold text-white mb-2">
            60-Second Audio Digest
          </h3>
          <p className="text-xs text-neutral-200/90 leading-relaxed font-sans">
            Synthesized AI broadcaster voice summarizing today's key breakthroughs for quick morning commute listening.
          </p>
          <div className="mt-4 text-[10px] text-emerald-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Docked on right margin</span>
          </div>
        </div>

        {/* Card 3: Custom Canvas Slot (For User's Future Widgets) */}
        <div 
          className="rounded-3xl p-6 border-2 border-dashed border-white/30 hover:border-amber-400/80 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer"
          style={{
            background: "rgba(18, 16, 13, 0.45)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-amber-500/20 flex items-center justify-center mb-3 transition-colors border border-white/20 group-hover:border-amber-400/50">
            <Plus size={22} className="text-white group-hover:text-amber-300 transition-colors" />
          </div>
          <h3 className="font-serif text-lg font-bold text-white mb-1">
            Build Your Home Space
          </h3>
          <p className="text-xs text-neutral-300/80 max-w-xs font-sans">
            Yahan aap apna custom dashboard, projects, personal notes ya portfolio widgets add kar sakte hain.
          </p>
          <span className="mt-3 text-[9px] uppercase tracking-widest text-amber-400 font-bold">
            [ Custom Slot Ready ]
          </span>
        </div>
      </div>

      {/* Footer Colophon on Garden Canvas */}
      <footer className="max-w-5xl mx-auto w-full pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/80 gap-3">
        <div className="flex items-center gap-2">
          <span className="font-serif font-black text-white">THE DAILY CIRCUIT</span>
          <span>· PUBLISHED AT 06:00 IST</span>
        </div>
        <div className="flex items-center gap-4 text-white/90">
          <button onClick={onScrollToNewspaper} className="hover:text-amber-300 underline">
            Back to Top (Newspaper) ↑
          </button>
          <span>© 2026 DIGITAL GARDEN ARCHIVE</span>
        </div>
      </footer>
    </section>
  );
}
