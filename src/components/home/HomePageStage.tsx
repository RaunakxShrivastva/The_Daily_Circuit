import React, { useEffect, useRef } from "react";
import { ArrowDown, Sparkles, Compass } from "lucide-react";

interface HomePageStageProps {
  onScrollToNewspaper: () => void;
}

export function HomePageStage({ onScrollToNewspaper }: HomePageStageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);

  // Subtle 3D mouse parallax via direct DOM rAF (zero React re-renders, auto-paused offscreen)
  useEffect(() => {
    let isVisible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);

    let rafId = 0;
    let mx = 0;
    let my = 0;

    const applyParallax = () => {
      rafId = 0;
      if (artworkRef.current) {
        artworkRef.current.style.transform = `translate3d(${(mx * -14).toFixed(1)}px, ${(my * -10).toFixed(1)}px, 0) scale(1.02)`;
      }
      if (foregroundRef.current) {
        foregroundRef.current.style.transform = `translate3d(${(mx * 6).toFixed(1)}px, ${(my * 4).toFixed(1)}px, 0)`;
      }
    };

    const handleMove = (e: MouseEvent) => {
      if (!isVisible) return;
      const { innerWidth, innerHeight } = window;
      mx = (e.clientX / innerWidth - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
      if (!rafId) rafId = requestAnimationFrame(applyParallax);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("mousemove", handleMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Ensure all Home stage elements are immediately visible when returning from 3D mode
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".assemble-target");
    targets.forEach((el) => {
      el.classList.add("assembled");
    });
    const titleEl = document.getElementById("home-title-text");
    if (titleEl && (!titleEl.textContent || titleEl.textContent.trim() === "")) {
      titleEl.textContent = "THE DAILY CIRCUIT";
    }
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="home-stage"
      className="relative min-h-screen w-full flex flex-col justify-between px-4 sm:px-8 pt-24 pb-12 font-mono select-none overflow-hidden"
      style={{
        backgroundImage: "url('/images/main_bg.jpg')",
        backgroundPosition: "center center",
        backgroundSize: "cover",
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
        ref={artworkRef}
        id="home-artwork"
        className="assemble-target absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden will-change-transform"
        style={{
          transform: "translate3d(0px, 0px, 0) scale(1.02)",
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
        ref={foregroundRef}
        className="relative z-10 max-w-5xl mx-auto w-full text-center space-y-4 pt-4 will-change-transform"
      >
        {/* Apple Liquid Glass Pill Badge */}
        <div 
          id="home-pill"
          className="assemble-target inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-white shadow-2xl"
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
          id="home-title"
          className="assemble-target text-5xl sm:text-7xl md:text-8xl font-serif font-black text-white tracking-tight leading-none min-h-[1.1em]"
          style={{
            textShadow: `
              0 4px 12px rgba(0, 0, 0, 0.95),
              0 18px 42px rgba(0, 0, 0, 0.85),
              0 0 60px rgba(255, 255, 255, 0.45)
            `,
          }}
        >
          <span id="home-title-text">THE DAILY CIRCUIT</span>
          <span id="home-title-caret" className="inline-block w-1.5 h-[0.75em] bg-[#E04834] ml-2 align-middle animate-pulse" style={{ display: "none" }} />
        </h1>

        <p 
          id="home-subtitle"
          className="assemble-target max-w-2xl mx-auto font-serif italic text-base sm:text-xl text-neutral-100 leading-snug"
          style={{
            textShadow: "0 2px 14px rgba(0,0,0,0.95), 0 8px 24px rgba(0,0,0,0.8)",
          }}
        >
          "A calm, finite sanctuary for AI architecture, open computing, and thoughtful engineering."
        </p>

        {/* One-Click Action to Enter Broadsheet */}
        <div id="home-cta" className="assemble-target pt-4">
          <button
            onClick={onScrollToNewspaper}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-neutral-950 transition-all duration-300 shadow-[0_16px_36px_rgba(0,0,0,0.7)] hover:-translate-y-0.5 cursor-pointer hover:bg-amber-400"
            style={{
              background: "rgba(18, 16, 13, 0.85)",
              backdropFilter: "blur(24px) saturate(190%)",
              WebkitBackdropFilter: "blur(24px) saturate(190%)",
              border: "1px solid rgba(245, 158, 11, 0.55)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            <span>Open Today's 24H Broadsheet</span>
            <ArrowDown size={14} className="text-amber-400 group-hover:text-neutral-950 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Hint Banner before Broadsheet */}
      <div id="home-hint" className="assemble-target relative z-10 max-w-5xl mx-auto w-full text-center pb-4">
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
