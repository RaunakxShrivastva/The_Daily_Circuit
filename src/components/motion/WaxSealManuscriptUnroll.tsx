import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, ArrowDown } from "lucide-react";

interface WaxSealManuscriptUnrollProps {
  scrollProgress: number; // 0 (closed) to 1 (fully unrolled)
  onBreakSeal: () => void;
}

export function WaxSealManuscriptUnroll({
  scrollProgress,
  onBreakSeal,
}: WaxSealManuscriptUnrollProps) {
  const [isBroken, setIsBroken] = useState(false);
  const [hasSparked, setHasSparked] = useState(false);

  // Trigger seal break when scrollProgress passes 0.12
  useEffect(() => {
    if (scrollProgress > 0.12 && !isBroken) {
      setIsBroken(true);
      if (!hasSparked) {
        setHasSparked(true);
        try {
          confetti({
            particleCount: 32,
            spread: 55,
            startVelocity: 18,
            ticks: 80,
            origin: { x: 0.5, y: 0.4 },
            colors: ["#b91c1c", "#ef4444", "#f59e0b", "#d97706", "#fef08a"],
          });
        } catch {
          // ignore
        }
      }
    } else if (scrollProgress <= 0.04 && isBroken) {
      setIsBroken(false);
    }
  }, [scrollProgress, isBroken, hasSparked]);

  const handleSealClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBroken(true);
    try {
      confetti({
        particleCount: 45,
        spread: 65,
        startVelocity: 22,
        origin: { x: 0.5, y: 0.45 },
        colors: ["#b91c1c", "#ef4444", "#f59e0b", "#d97706", "#ffffff"],
      });
    } catch {
      // ignore
    }
    onBreakSeal();
  };

  // Progress clamp 0 to 1
  const p = Math.min(1, Math.max(0, scrollProgress));
  
  // Seal separation distance & physics
  const sealSplitX = isBroken ? Math.min(85, p * 90) : 0;
  const sealRotate = isBroken ? Math.min(22, p * 24) : 0;
  const sealOpacity = Math.max(0, 1 - p * 1.3);

  // Parchment 3D roll cylinder depth
  const rollHeight = Math.max(0, (1 - p) * 44);
  const rollCurlShadow = (1 - p) * 0.75;
  const perspectiveAngle = (1 - p) * -22;

  return (
    <div 
      className="relative w-full max-w-[1260px] mx-auto z-20 pointer-events-auto select-none font-mono my-2"
      style={{
        perspective: "1400px",
      }}
    >
      {/* ======================================================== */}
      {/* 3D PARCHMENT ROLL CYLINDER (Visual top edge of manuscript)*/}
      {/* ======================================================== */}
      <div
        className="w-full transition-all duration-300 ease-out flex items-center justify-center relative overflow-visible"
        style={{
          height: `${rollHeight}px`,
          opacity: rollHeight > 1 ? 1 : 0,
          transform: `rotateX(${perspectiveAngle}deg)`,
          transformOrigin: "top center",
        }}
      >
        {/* Roll Cylinder Body */}
        <div 
          className="absolute inset-x-0 h-full rounded-full shadow-[0_14px_36px_rgba(0,0,0,0.7)]"
          style={{
            background: "linear-gradient(to bottom, #d6cdbe 0%, #f4ede2 28%, #e2d8c7 60%, #a89d89 95%)",
            border: "1px solid rgba(138, 122, 102, 0.45)",
          }}
        >
          {/* Paper ribbing / linotype texture highlights */}
          <div 
            className="w-full h-full opacity-25 rounded-full"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(0,0,0,0.12) 18px, rgba(0,0,0,0.12) 19px)",
            }}
          />
        </div>

        {/* Left paper coil curl edge */}
        <div 
          className="absolute -left-2.5 top-0 bottom-0 w-5 rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, #9e917d 0%, #6e6454 80%, #3e382e 100%)",
            boxShadow: "inset 0 0 5px rgba(0,0,0,0.85)",
          }}
        />

        {/* Right paper coil curl edge */}
        <div 
          className="absolute -right-2.5 top-0 bottom-0 w-5 rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, #9e917d 0%, #6e6454 80%, #3e382e 100%)",
            boxShadow: "inset 0 0 5px rgba(0,0,0,0.85)",
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE CRIMSON WAX SEAL STAMP                       */}
      {/* ======================================================== */}
      {sealOpacity > 0.02 && (
        <div 
          onClick={handleSealClick}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 group z-30"
          style={{
            opacity: sealOpacity,
          }}
          title="Click to break wax seal & unroll broadsheet"
        >
          {/* Ambient Crimson Halo Glow */}
          <div 
            className="absolute -inset-6 rounded-full opacity-50 group-hover:opacity-85 transition-opacity blur-lg pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(220, 38, 38, 0.65) 0%, rgba(185, 28, 28, 0.3) 50%, transparent 75%)",
            }}
          />

          {/* Left Seal Half */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-y-1/2 transition-transform duration-500 ease-out origin-right"
            style={{
              transform: `translateX(calc(-100% - ${sealSplitX}px)) rotate(-${sealRotate}deg)`,
              width: "52px",
              height: "104px",
              overflow: "hidden",
            }}
          >
            <div 
              className="w-[104px] h-[104px] rounded-full relative"
              style={{
                background: "radial-gradient(circle at 35% 30%, #f87171 0%, #dc2626 28%, #991b1b 65%, #450a0a 100%)",
                boxShadow: "0 14px 32px rgba(0, 0, 0, 0.8), inset 0 2px 5px rgba(255, 255, 255, 0.5), inset 0 -4px 8px rgba(0, 0, 0, 0.7)",
                border: "2px solid rgba(254, 202, 202, 0.3)",
              }}
            >
              {/* Molten Wax Rim Contour */}
              <div className="absolute inset-1.5 rounded-full border border-red-950/60 opacity-60" />
              {/* Embossed Left Seal Ring */}
              <div className="absolute inset-3 rounded-full border border-amber-300/40 flex items-center justify-center">
                <span className="font-serif font-black text-amber-100 text-base tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pr-1.5 select-none">
                  D
                </span>
              </div>
            </div>
          </div>

          {/* Right Seal Half */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-y-1/2 transition-transform duration-500 ease-out origin-left"
            style={{
              transform: `translateX(${sealSplitX}px) rotate(${sealRotate}deg)`,
              width: "52px",
              height: "104px",
              overflow: "hidden",
            }}
          >
            <div 
              className="w-[104px] h-[104px] rounded-full relative -ml-[52px]"
              style={{
                background: "radial-gradient(circle at 35% 30%, #f87171 0%, #dc2626 28%, #991b1b 65%, #450a0a 100%)",
                boxShadow: "0 14px 32px rgba(0, 0, 0, 0.8), inset 0 2px 5px rgba(255, 255, 255, 0.5), inset 0 -4px 8px rgba(0, 0, 0, 0.7)",
                border: "2px solid rgba(254, 202, 202, 0.3)",
              }}
            >
              {/* Molten Wax Rim Contour */}
              <div className="absolute inset-1.5 rounded-full border border-red-950/60 opacity-60" />
              {/* Embossed Right Seal Ring */}
              <div className="absolute inset-3 rounded-full border border-amber-300/40 flex items-center justify-center">
                <span className="font-serif font-black text-amber-100 text-base tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pl-1.5 select-none">
                  C
                </span>
              </div>
            </div>
          </div>

          {/* Center Golden Fissure Crack Line (Appears on break) */}
          {isBroken && (
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-20 bg-amber-300 shadow-[0_0_12px_#fde047] pointer-events-none animate-pulse"
            />
          )}

          {/* Floating Pill Prompt under Seal */}
          <div className="absolute top-[110%] left-1/2 -translate-x-1/2 whitespace-nowrap pt-2 pointer-events-none">
            <div className="px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-amber-400/40 text-[9px] font-bold uppercase tracking-widest text-amber-300 shadow-2xl flex items-center gap-1.5 group-hover:border-amber-400 transition-colors">
              <Sparkles size={11} className="text-amber-400 animate-spin" />
              <span>{isBroken ? "UNROLLING MANUSCRIPT" : "BREAK SEAL TO UNROLL"}</span>
              <ArrowDown size={11} className="animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Unroll Shadow Gradient falling onto broadsheet top */}
      <div 
        className="w-full h-8 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: rollCurlShadow,
          background: "linear-gradient(to bottom, rgba(10, 8, 6, 0.45) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
