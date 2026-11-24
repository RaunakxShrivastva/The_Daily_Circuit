import React, { useEffect, useState, useRef } from "react";

export function ScrollCircuitPath() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const sparkRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let targetProgress = 0;
    let currentProgress = 0;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        targetProgress = Math.min(1, Math.max(0, window.scrollY / scrollHeight));
      }
    };

    // Buttery smooth lerp render loop for scroll line drawing
    const updateLoop = () => {
      currentProgress += (targetProgress - currentProgress) * 0.12;
      setScrollProgress(currentProgress);

      if (pathRef.current && sparkRef.current) {
        const totalLen = pathRef.current.getTotalLength();
        const currentLen = currentProgress * totalLen;
        const point = pathRef.current.getPointAtLength(currentLen);
        
        sparkRef.current.setAttribute("cx", point.x.toString());
        sparkRef.current.setAttribute("cy", point.y.toString());
      }

      animationFrameId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    animationFrameId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <aside 
      className="hidden xl:block fixed left-6 top-0 bottom-0 w-12 z-30 pointer-events-none select-none"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 48 1000"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Intense Neon Amber & Copper Glow Filter */}
          <filter id="circuit-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Copper to Amber Linear Gradient */}
          <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
            <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#ef4444" stopOpacity="1" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Background Trace Guide Track (Faint PCB copper silhouette) */}
        <path
          d="M 24,0 L 24,180 L 12,210 L 12,380 L 36,430 L 36,620 L 16,670 L 16,840 L 28,880 L 28,1000"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Active Animated Drawn Path (Linked precisely to scroll depth) */}
        <path
          ref={pathRef}
          d="M 24,0 L 24,180 L 12,210 L 12,380 L 36,430 L 36,620 L 16,670 L 16,840 L 28,880 L 28,1000"
          fill="none"
          stroke="url(#circuit-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - scrollProgress}
          filter="url(#circuit-glow)"
          style={{
            transition: "stroke-dashoffset 40ms linear",
          }}
        />

        {/* Traveling High-Voltage Spark Node at Path Head */}
        <circle
          ref={sparkRef}
          cx="24"
          cy="0"
          r="4.5"
          fill="#fff"
          stroke="#f59e0b"
          strokeWidth="2"
          filter="url(#circuit-glow)"
          style={{
            opacity: scrollProgress > 0.005 ? 1 : 0,
            transition: "opacity 200ms ease",
          }}
        />

        {/* Secondary Ambient Halo around Spark */}
        {scrollProgress > 0.005 && (
          <circle
            cx={sparkRef.current?.getAttribute("cx") || "24"}
            cy={sparkRef.current?.getAttribute("cy") || "0"}
            r="9"
            fill="none"
            stroke="rgba(245, 158, 11, 0.6)"
            strokeWidth="1"
            className="animate-ping"
          />
        )}
      </svg>
    </aside>
  );
}
