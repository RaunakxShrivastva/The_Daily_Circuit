import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Sparkles, ArrowDown } from "lucide-react";

interface WaxSealManuscriptUnrollProps {
  scrollProgress: number; // 0 (tightly rolled) to 1 (fully unrolled) - continuously lerped
  onBreakSeal: () => void;
  maxRollTravel?: number; // Distance in pixels the cylinder rolls down
}

export function WaxSealManuscriptUnroll({
  scrollProgress,
  onBreakSeal,
  maxRollTravel = 740,
}: WaxSealManuscriptUnrollProps) {
  const [hasSparked, setHasSparked] = useState(false);
  const p = Math.min(1, Math.max(0, scrollProgress));

  // Phase 1: Seal Strain & Fracture (p: 0.00 to 0.28)
  // Tension builds up as user scrolls from 0.00 to 0.08
  const tension = Math.min(1, p / 0.08);
  const strainVibration = p > 0.02 && p < 0.12 ? Math.sin(p * 80) * 1.8 * tension : 0;

  // Crack progress (0 to 1 as p goes from 0.06 to 0.26)
  const crackProgress = Math.min(1, Math.max(0, (p - 0.06) / 0.20));

  // Trigger confetti sparks once when crack opens past 40%
  useEffect(() => {
    if (crackProgress > 0.4 && !hasSparked) {
      setHasSparked(true);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          startVelocity: 18,
          ticks: 90,
          origin: { x: 0.5, y: 0.42 },
          colors: ["#b91c1c", "#ef4444", "#f59e0b", "#d97706", "#fef08a"],
        });
      } catch {
        // ignore
      }
    } else if (p <= 0.02 && hasSparked) {
      setHasSparked(false);
    }
  }, [crackProgress, hasSparked, p]);

  const handleSealClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      confetti({
        particleCount: 48,
        spread: 70,
        startVelocity: 22,
        origin: { x: 0.5, y: 0.45 },
        colors: ["#b91c1c", "#ef4444", "#f59e0b", "#d97706", "#ffffff"],
      });
    } catch {
      // ignore
    }
    onBreakSeal();
  };

  // Phase 2: Cylinder Roll-Down (p: 0.22 to 0.96)
  const unrollRatio = Math.min(1, Math.max(0, (p - 0.22) / 0.74));

  // Current Y position of the rolling cylinder
  const cylinderY = unrollRatio * maxRollTravel;

  // Rotation of cylinder (spins physically as it rolls down)
  const cylinderRotation = unrollRatio * 720;

  // Direct scrubbed separation of seal halves (in pixels and degrees)
  const sealSplitX = crackProgress * 110;
  const sealRotate = crackProgress * 28;
  const sealOpacity = Math.max(0, 1 - Math.min(1, p / 0.32));

  // Cylinder visibility: fades out only when fully unrolled at the end
  const cylinderOpacity = unrollRatio >= 0.98 ? Math.max(0, (1 - unrollRatio) / 0.02) : 1;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-30 overflow-visible font-mono select-none"
      style={{
        perspective: "1600px",
      }}
    >
      {/* ======================================================== */}
      {/* 3D ROLLING PARCHMENT CYLINDER (Moves down with scroll)   */}
      {/* ======================================================== */}
      {cylinderOpacity > 0.01 && (
        <div
          className="absolute left-0 right-0 w-full will-change-transform"
          style={{
            transform: `translateY(${cylinderY}px)`,
            opacity: cylinderOpacity,
          }}
        >
          {/* Main Cylindrical Paper Tube */}
          <div 
            className="relative h-[48px] w-full rounded-full shadow-[0_20px_48px_rgba(0,0,0,0.85),0_4px_14px_rgba(0,0,0,0.65)]"
            style={{
              background: "linear-gradient(to bottom, #b8ad9b 0%, #ded4c3 22%, #fbf6ec 48%, #cfc4b1 78%, #786e5c 100%)",
              border: "1px solid rgba(120, 105, 85, 0.55)",
              transform: `rotateX(${cylinderRotation}deg)`,
              transformOrigin: "center center",
            }}
          >
            {/* Paper texture ribbing lines that spin as cylinder rolls */}
            <div 
              className="w-full h-full opacity-35 rounded-full"
              style={{
                backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 16px, rgba(0,0,0,0.14) 16px, rgba(0,0,0,0.14) 17px)",
              }}
            />

            {/* Top specular paper sheen highlight */}
            <div 
              className="absolute inset-x-4 top-1 h-2 rounded-full opacity-60 pointer-events-none"
              style={{
                background: "linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, transparent 100%)",
              }}
            />

            {/* Left paper coil spiral edge */}
            <div 
              className="absolute -left-3.5 top-0 bottom-0 w-7 rounded-full border border-black/40"
              style={{
                background: "radial-gradient(ellipse at center, #8a7e6b 0%, #5a5142 60%, #221d15 100%)",
                boxShadow: "inset 0 0 7px rgba(0,0,0,0.9)",
              }}
            >
              {/* Concentric spiral rings */}
              <div className="absolute inset-1 rounded-full border border-amber-200/25 opacity-70" />
              <div className="absolute inset-2.5 rounded-full border border-amber-200/35 opacity-80" />
            </div>

            {/* Right paper coil spiral edge */}
            <div 
              className="absolute -right-3.5 top-0 bottom-0 w-7 rounded-full border border-black/40"
              style={{
                background: "radial-gradient(ellipse at center, #8a7e6b 0%, #5a5142 60%, #221d15 100%)",
                boxShadow: "inset 0 0 7px rgba(0,0,0,0.9)",
              }}
            >
              {/* Concentric spiral rings */}
              <div className="absolute inset-1 rounded-full border border-amber-200/25 opacity-70" />
              <div className="absolute inset-2.5 rounded-full border border-amber-200/35 opacity-80" />
            </div>
          </div>

          {/* Paper curl shadow casting onto the revealed broadsheet above it */}
          <div 
            className="absolute left-0 right-0 -top-10 h-10 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(12, 10, 8, 0.65) 0%, transparent 100%)",
            }}
          />

          {/* Paper curl shadow casting onto the dark stage below it */}
          <div 
            className="absolute left-0 right-0 -bottom-12 h-12 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, rgba(8, 6, 5, 0.8) 0%, transparent 100%)",
            }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* INTERACTIVE CRIMSON WAX SEAL STAMP                       */}
      {/* Scrubbed directly by scroll position                    */}
      {/* ======================================================== */}
      {sealOpacity > 0.01 && (
        <div 
          onClick={handleSealClick}
          className="absolute top-6 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95 group z-40 pointer-events-auto"
          style={{
            opacity: sealOpacity,
            transform: `translate(calc(-50% + ${strainVibration}px), -50%)`,
          }}
          title="Scroll down to break wax seal & unroll broadsheet"
        >
          {/* Ambient Crimson Halo Glow */}
          <div 
            className="absolute -inset-8 rounded-full opacity-60 group-hover:opacity-90 transition-opacity blur-xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(220, 38, 38, 0.75) 0%, rgba(185, 28, 28, 0.35) 50%, transparent 75%)",
            }}
          />

          {/* Left Seal Half (Separates with scroll) */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-y-1/2 origin-right will-change-transform"
            style={{
              transform: `translateX(calc(-100% - ${sealSplitX}px)) rotate(-${sealRotate}deg)`,
              width: "56px",
              height: "112px",
              overflow: "hidden",
            }}
          >
            <div 
              className="w-[112px] h-[112px] rounded-full relative"
              style={{
                background: "radial-gradient(circle at 35% 30%, #f87171 0%, #dc2626 28%, #991b1b 65%, #450a0a 100%)",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.85), inset 0 2px 5px rgba(255, 255, 255, 0.55), inset 0 -4px 8px rgba(0, 0, 0, 0.75)",
                border: "2px solid rgba(254, 202, 202, 0.35)",
              }}
            >
              {/* Molten Wax Rim Contour */}
              <div className="absolute inset-2 rounded-full border border-red-950/60 opacity-60" />
              {/* Embossed Left Seal Ring */}
              <div className="absolute inset-3.5 rounded-full border border-amber-300/40 flex items-center justify-center">
                <span className="font-serif font-black text-amber-100 text-lg tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pr-1.5 select-none">
                  D
                </span>
              </div>
            </div>
          </div>

          {/* Right Seal Half (Separates with scroll) */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-y-1/2 origin-left will-change-transform"
            style={{
              transform: `translateX(${sealSplitX}px) rotate(${sealRotate}deg)`,
              width: "56px",
              height: "112px",
              overflow: "hidden",
            }}
          >
            <div 
              className="w-[112px] h-[112px] rounded-full relative -ml-[56px]"
              style={{
                background: "radial-gradient(circle at 35% 30%, #f87171 0%, #dc2626 28%, #991b1b 65%, #450a0a 100%)",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.85), inset 0 2px 5px rgba(255, 255, 255, 0.55), inset 0 -4px 8px rgba(0, 0, 0, 0.75)",
                border: "2px solid rgba(254, 202, 202, 0.35)",
              }}
            >
              {/* Molten Wax Rim Contour */}
              <div className="absolute inset-2 rounded-full border border-red-950/60 opacity-60" />
              {/* Embossed Right Seal Ring */}
              <div className="absolute inset-3.5 rounded-full border border-amber-300/40 flex items-center justify-center">
                <span className="font-serif font-black text-amber-100 text-lg tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pl-1.5 select-none">
                  C
                </span>
              </div>
            </div>
          </div>

          {/* Center Golden Fissure Crack Line (Grows with scroll tension) */}
          {crackProgress > 0.05 && (
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 bg-amber-300 shadow-[0_0_14px_#fde047] pointer-events-none"
              style={{
                height: `${Math.min(100, crackProgress * 110)}px`,
                opacity: Math.min(1, crackProgress * 2.5),
              }}
            />
          )}

          {/* Interactive Floating Status Pill under Seal */}
          <div className="absolute top-[118%] left-1/2 -translate-x-1/2 whitespace-nowrap pt-2 pointer-events-none">
            <div className="px-4 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-amber-400/45 text-[9.5px] font-bold uppercase tracking-widest text-amber-300 shadow-2xl flex items-center gap-2 group-hover:border-amber-400 transition-colors">
              <Sparkles size={11} className="text-amber-400 animate-spin" />
              <span>
                {crackProgress > 0.6
                  ? "UNROLLING BROADSHEET..."
                  : crackProgress > 0.08
                  ? "SEAL CRACKING · KEEP SCROLLING"
                  : "SCROLL TO BREAK SEAL & UNROLL"}
              </span>
              <ArrowDown size={11} className="animate-bounce" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
