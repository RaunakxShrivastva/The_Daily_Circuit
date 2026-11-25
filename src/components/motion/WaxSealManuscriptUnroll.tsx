import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, ArrowDown } from "lucide-react";

interface WaxSealManuscriptUnrollProps {
  scrollProgress: number; // 0 (tightly rolled) to 1 (fully unrolled)
  onBreakSeal: () => void;
  maxRollTravel?: number; // Distance in pixels the cylinder rolls down
}

export function WaxSealManuscriptUnroll({
  scrollProgress,
  onBreakSeal,
  maxRollTravel = 740,
}: WaxSealManuscriptUnrollProps) {
  const [isBroken, setIsBroken] = useState(false);
  const [hasSparked, setHasSparked] = useState(false);

  // Progressive unroll phases:
  // p = 0.00 to 0.18: Wax seal breaks and separates
  // p = 0.18 to 0.95: Cylinder physically rolls down from top to maxRollTravel
  // p >= 0.95: Cylinder flattens into paper
  const p = Math.min(1, Math.max(0, scrollProgress));

  // Trigger seal break when scrollProgress passes 0.06
  useEffect(() => {
    if (p > 0.06 && !isBroken) {
      setIsBroken(true);
      if (!hasSparked) {
        setHasSparked(true);
        try {
          confetti({
            particleCount: 36,
            spread: 60,
            startVelocity: 20,
            ticks: 85,
            origin: { x: 0.5, y: 0.4 },
            colors: ["#b91c1c", "#ef4444", "#f59e0b", "#d97706", "#fef08a"],
          });
        } catch {
          // ignore
        }
      }
    } else if (p <= 0.02 && isBroken) {
      setIsBroken(false);
    }
  }, [p, isBroken, hasSparked]);

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

  // Unroll ratio (0 when seal breaking, 0 -> 1 as cylinder rolls down)
  const unrollRatio = Math.min(1, Math.max(0, (p - 0.14) / 0.82));

  // Current Y position of the rolling cylinder
  const cylinderY = unrollRatio * maxRollTravel;

  // Rotation of cylinder (spins as it rolls down)
  const cylinderRotation = unrollRatio * 720;

  // Seal physics
  const sealSplitX = isBroken ? Math.min(95, p * 120 + 20) : 0;
  const sealRotate = isBroken ? Math.min(26, p * 30 + 5) : 0;
  const sealOpacity = Math.max(0, 1 - p * 2.8);

  // Cylinder visibility: fades out only when fully unrolled
  const cylinderOpacity = unrollRatio >= 0.98 ? Math.max(0, (1 - unrollRatio) / 0.02) : 1;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-30 overflow-visible font-mono select-none"
      style={{
        perspective: "1600px",
      }}
    >
      {/* ======================================================== */}
      {/* 3D ROLLING PARCHMENT CYLINDER (Moves down as user scrolls) */}
      {/* ======================================================== */}
      {cylinderOpacity > 0.01 && (
        <div
          className="absolute left-0 right-0 w-full transition-transform duration-75 ease-out will-change-transform"
          style={{
            transform: `translateY(${cylinderY}px)`,
            opacity: cylinderOpacity,
          }}
        >
          {/* Main Cylindrical Paper Tube */}
          <div 
            className="relative h-[46px] w-full rounded-full shadow-[0_18px_42px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.6)]"
            style={{
              background: "linear-gradient(to bottom, #b8ad9b 0%, #ded4c3 22%, #fbf6ec 48%, #cfc4b1 78%, #786e5c 100%)",
              border: "1px solid rgba(120, 105, 85, 0.5)",
              transform: `rotateX(${cylinderRotation}deg)`,
              transformOrigin: "center center",
            }}
          >
            {/* Paper texture ribbing / mechanical linotype lines that spin */}
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
              className="absolute -left-3 top-0 bottom-0 w-6 rounded-full border border-black/30"
              style={{
                background: "radial-gradient(ellipse at center, #8a7e6b 0%, #5a5142 60%, #221d15 100%)",
                boxShadow: "inset 0 0 6px rgba(0,0,0,0.9)",
              }}
            >
              {/* Concentric spiral rings */}
              <div className="absolute inset-1 rounded-full border border-amber-200/20 opacity-70" />
              <div className="absolute inset-2 rounded-full border border-amber-200/30 opacity-80" />
            </div>

            {/* Right paper coil spiral edge */}
            <div 
              className="absolute -right-3 top-0 bottom-0 w-6 rounded-full border border-black/30"
              style={{
                background: "radial-gradient(ellipse at center, #8a7e6b 0%, #5a5142 60%, #221d15 100%)",
                boxShadow: "inset 0 0 6px rgba(0,0,0,0.9)",
              }}
            >
              {/* Concentric spiral rings */}
              <div className="absolute inset-1 rounded-full border border-amber-200/20 opacity-70" />
              <div className="absolute inset-2 rounded-full border border-amber-200/30 opacity-80" />
            </div>
          </div>

          {/* Paper curl shadow casting onto the revealed broadsheet above it */}
          <div 
            className="absolute left-0 right-0 -top-8 h-8 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(12, 10, 8, 0.6) 0%, transparent 100%)",
            }}
          />

          {/* Paper curl shadow casting onto the dark space below it */}
          <div 
            className="absolute left-0 right-0 -bottom-10 h-10 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, rgba(8, 6, 5, 0.75) 0%, transparent 100%)",
            }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* INTERACTIVE CRIMSON WAX SEAL STAMP                       */}
      {/* (Initially locks the rolled newspaper cylinder shut)    */}
      {/* ======================================================== */}
      {sealOpacity > 0.02 && (
        <div 
          onClick={handleSealClick}
          className="absolute top-6 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 group z-40 pointer-events-auto"
          style={{
            opacity: sealOpacity,
          }}
          title="Click to break wax seal & unroll broadsheet"
        >
          {/* Ambient Crimson Halo Glow */}
          <div 
            className="absolute -inset-8 rounded-full opacity-60 group-hover:opacity-90 transition-opacity blur-xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(220, 38, 38, 0.75) 0%, rgba(185, 28, 28, 0.35) 50%, transparent 75%)",
            }}
          />

          {/* Left Seal Half */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-y-1/2 transition-transform duration-500 ease-out origin-right"
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

          {/* Right Seal Half */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-y-1/2 transition-transform duration-500 ease-out origin-left"
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

          {/* Center Golden Fissure Crack Line (Appears on break) */}
          {isBroken && (
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-24 bg-amber-300 shadow-[0_0_14px_#fde047] pointer-events-none animate-pulse"
            />
          )}

          {/* Floating Pill Prompt under Seal */}
          <div className="absolute top-[115%] left-1/2 -translate-x-1/2 whitespace-nowrap pt-2 pointer-events-none">
            <div className="px-4 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-amber-400/45 text-[9.5px] font-bold uppercase tracking-widest text-amber-300 shadow-2xl flex items-center gap-2 group-hover:border-amber-400 transition-colors">
              <Sparkles size={11} className="text-amber-400 animate-spin" />
              <span>{isBroken ? "UNROLLING BROADSHEET..." : "SCROLL TO BREAK SEAL & UNROLL"}</span>
              <ArrowDown size={11} className="animate-bounce" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
