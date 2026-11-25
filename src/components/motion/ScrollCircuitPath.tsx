import React, { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  isRed: boolean;
}

export function ScrollCircuitPath() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const railPathRef = useRef<SVGPathElement>(null);
  const echoPathRef = useRef<SVGPathElement>(null);
  const primaryPathRef = useRef<SVGPathElement>(null);
  const waypointsGroupRef = useRef<SVGGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);

  const hudProgressRef = useRef<HTMLSpanElement>(null);
  const hudVelocityRef = useRef<HTMLSpanElement>(null);
  const hudBarsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    // Snappy, responsive damping so line never lags behind user scroll
    const DAMPING = 0.20;
    const ECHO_DAMPING = 0.09;

    let targetScroll = window.scrollY;
    let currentScroll = window.scrollY;
    let prevScroll = window.scrollY;
    let scrollVelocity = 0;
    let scrollProgress = 0;
    let echoProgress = 0;
    let maxScroll = 1;
    let totalPathLength = 1;
    let pathStartY = 120;
    let pathEndY = 5000;

    let waypointRatios = [0.01, 0.26, 0.52, 0.77, 0.96];
    let waypointNodes: SVGGElement[] = [];
    const particles: Particle[] = [];

    // Helper to get true document-level absolute position
    const getAbsoluteTop = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY;
    };

    // 1. Build Responsive Multi-Curve Bézier Path & Waypoints
    const buildPath = () => {
      const w = window.innerWidth;
      const h = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight * 2
      );

      maxScroll = Math.max(1, h - window.innerHeight);

      if (svgRef.current) {
        svgRef.current.setAttribute("viewBox", `0 0 ${w} ${h}`);
        svgRef.current.style.width = `${w}px`;
        svgRef.current.style.height = `${h}px`;
      }

      // Resize canvas for crisp HiDPI rendering
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Identify major section anchor Y coordinates using true document absoluteTop
      const secSelectors = ["#home-stage", "#page-01", "#page-03", "#page-05", "#page-08"];
      const anchorY = secSelectors.map((sel, idx) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (el) {
          return getAbsoluteTop(el) + el.offsetHeight * 0.42;
        }
        return (idx / (secSelectors.length - 1)) * h;
      });

      const cx = w * 0.5;
      const leftSweep = w < 768 ? w * 0.08 : w * 0.12;
      const rightSweep = w < 768 ? w * 0.92 : w * 0.88;

      const p0 = { x: cx, y: Math.max(120, anchorY[0] + 100) };
      const p1 = { x: leftSweep, y: Math.max(anchorY[1], p0.y + 350) };
      const p2 = { x: rightSweep, y: Math.max(anchorY[2], p1.y + 400) };
      const p3 = { x: leftSweep + (w * 0.05), y: Math.max(anchorY[3], p2.y + 450) };
      const p4 = { x: cx, y: Math.min(h - 120, Math.max(anchorY[4], p3.y + 400)) };

      pathStartY = p0.y;
      pathEndY = p4.y;

      // Organic winding cubic Bézier path
      const d = [
        `M ${p0.x} ${p0.y}`,
        `C ${cx} ${p0.y + 220}, ${leftSweep} ${p1.y - 240}, ${p1.x} ${p1.y}`,
        `C ${leftSweep} ${p1.y + 260}, ${rightSweep} ${p2.y - 260}, ${p2.x} ${p2.y}`,
        `C ${rightSweep} ${p2.y + 240}, ${p3.x} ${p3.y - 240}, ${p3.x} ${p3.y}`,
        `C ${p3.x} ${p3.y + 240}, ${cx} ${p4.y - 220}, ${p4.x} ${p4.y}`,
      ].join(" ");

      if (railPathRef.current) railPathRef.current.setAttribute("d", d);
      if (echoPathRef.current) echoPathRef.current.setAttribute("d", d);
      if (primaryPathRef.current) {
        primaryPathRef.current.setAttribute("d", d);
        totalPathLength = primaryPathRef.current.getTotalLength() || 1;
        primaryPathRef.current.style.strokeDasharray = `${totalPathLength}`;
      }
      if (echoPathRef.current) {
        echoPathRef.current.style.strokeDasharray = `${totalPathLength}`;
      }

      // Build 5 Waypoint Nodes
      const pts = [p0, p1, p2, p3, p4];
      if (waypointsGroupRef.current) {
        waypointsGroupRef.current.innerHTML = "";
        waypointNodes = [];

        pts.forEach((pt, idx) => {
          const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
          g.setAttribute("class", "waypoint-node");
          g.setAttribute("data-index", String(idx));

          const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          ring.setAttribute("cx", String(pt.x));
          ring.setAttribute("cy", String(pt.y));
          ring.setAttribute("r", "10");
          ring.setAttribute("fill", "none");
          ring.setAttribute("stroke", "#ff3b2f");
          ring.setAttribute("stroke-width", "1.5");
          ring.setAttribute("class", "waypoint-ring");

          const outer = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          outer.setAttribute("cx", String(pt.x));
          outer.setAttribute("cy", String(pt.y));
          outer.setAttribute("r", "8");
          outer.setAttribute("fill", "#070708");
          outer.setAttribute("stroke", "rgba(255,255,255,0.28)");
          outer.setAttribute("stroke-width", "1.2");

          const core = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          core.setAttribute("cx", String(pt.x));
          core.setAttribute("cy", String(pt.y));
          core.setAttribute("r", "3.5");
          core.setAttribute("fill", "rgba(255,255,255,0.5)");
          core.setAttribute("class", "waypoint-core");

          g.appendChild(ring);
          g.appendChild(outer);
          g.appendChild(core);
          waypointsGroupRef.current?.appendChild(g);
          waypointNodes.push(g);
        });
      }

      waypointRatios = [0.01, 0.26, 0.52, 0.77, 0.96];
    };

    // 2. Velocity-Reactive Particle System
    const spawnSparks = (x: number, y: number, speed: number) => {
      const count = Math.min(6, Math.floor(speed * 0.22));
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const mag = 0.6 + Math.random() * Math.min(4.2, speed * 0.14);
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * mag,
          vy: Math.sin(angle) * mag,
          life: 1,
          decay: 0.025 + Math.random() * 0.03,
          size: 1.1 + Math.random() * 2.1,
          isRed: Math.random() > 0.35,
        });
      }
    };

    const renderCanvasTipAndSparks = (tipX: number, tipY: number, speed: number, progress: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // When resting at origin (scroll = 0), line is docked inside starting node with no flare
      if (progress <= 0.0005) {
        particles.length = 0;
        return;
      }

      // Smooth opacity ramp as line emerges from starting point
      const tipAlpha = Math.min(1, progress * 80);

      if (speed > 1.2 && tipY > -40 && tipY < window.innerHeight + 40) {
        spawnSparks(tipX, tipY, speed);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.isRed
          ? `rgba(255, 59, 47, ${p.life * 0.9 * tipAlpha})`
          : `rgba(255, 255, 255, ${p.life * 0.85 * tipAlpha})`;
        ctx.fill();
      }

      // Draw Luminous Leading Tip Orb & Reticle
      if (tipY > -60 && tipY < window.innerHeight + 60) {
        const glowRadius = 18 + Math.min(20, speed * 0.6);
        const grad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, glowRadius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${tipAlpha})`);
        grad.addColorStop(0.3, `rgba(255, 59, 47, ${0.75 * tipAlpha})`);
        grad.addColorStop(1, "rgba(255, 59, 47, 0)");

        ctx.beginPath();
        ctx.arc(tipX, tipY, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(tipX, tipY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${tipAlpha})`;
        ctx.fill();
      }
    };

    // 3. Main 60 FPS Render Loop
    const animate = () => {
      targetScroll = window.scrollY;
      prevScroll = currentScroll;
      // Snappy physics tracking
      currentScroll += (targetScroll - currentScroll) * DAMPING;

      if (Math.abs(targetScroll - currentScroll) < 0.05) {
        currentScroll = targetScroll;
      }
      if (currentScroll < 12) {
        currentScroll = 0;
      }

      scrollVelocity = currentScroll - prevScroll;
      const absVel = Math.abs(scrollVelocity);

      // Total path length
      const totalLen = primaryPathRef.current?.getTotalLength() || totalPathLength || 1;

      // Dynamic Active Viewport Tracking:
      // At scroll 0 (Home stage): Line rests completely docked inside starting node (progress = 0)
      // As user scrolls: Line emerges from starting point and dynamically leads ahead down the screen
      // On reverse scroll: Line smoothly retracts all the way back into the starting node (progress -> 0)
      const winH = window.innerHeight || 900;
      let targetProgress = 0;

      if (currentScroll > 12) {
        const scrollFactor = Math.min(1, currentScroll / 450);
        const leadOffset = winH * (scrollFactor * 0.92);
        const viewportTargetY = currentScroll + leadOffset;
        const rawProgress = (viewportTargetY - pathStartY) / (pathEndY - pathStartY);
        targetProgress = Math.max(0, Math.min(1, rawProgress));
      }

      scrollProgress += (targetProgress - scrollProgress) * DAMPING;
      if (currentScroll === 0 || (targetProgress === 0 && scrollProgress < 0.015)) {
        scrollProgress = 0;
      }
      scrollProgress = Math.max(0, Math.min(1, scrollProgress));

      echoProgress += (scrollProgress - echoProgress) * (targetProgress === 0 ? 0.35 : ECHO_DAMPING);
      if (scrollProgress === 0 || (targetProgress === 0 && echoProgress < 0.015)) {
        echoProgress = 0;
      }
      echoProgress = Math.max(0, Math.min(1, echoProgress));

      const primaryDrawLen = totalLen * scrollProgress;
      const echoDrawLen = totalLen * echoProgress;

      if (primaryPathRef.current) {
        primaryPathRef.current.style.strokeDashoffset = `${totalLen - primaryDrawLen}`;
      }
      if (echoPathRef.current) {
        echoPathRef.current.style.strokeDashoffset = `${totalLen - echoDrawLen}`;
      }
      if (railPathRef.current) {
        railPathRef.current.style.opacity = scrollProgress > 0.002 ? "1" : "0";
      }

      // Convert path coordinates to viewport coordinates
      if (primaryPathRef.current) {
        try {
          const tipPt = primaryPathRef.current.getPointAtLength(primaryDrawLen);
          const viewportTipY = tipPt.y - currentScroll;
          renderCanvasTipAndSparks(tipPt.x, viewportTipY, absVel, scrollProgress);
        } catch {
          // ignore
        }
      }

      // Ignite Waypoints: only ignite starting node (idx 0) once scroll begins
      waypointRatios.forEach((ratio, idx) => {
        let isReached = false;
        if (idx === 0) {
          isReached = scrollProgress > 0.005;
        } else {
          isReached = scrollProgress >= ratio - 0.02;
        }
        if (waypointNodes[idx]) {
          waypointNodes[idx].classList.toggle("ignited", isReached);
        }
      });

      // Update Telemetry HUD
      if (hudProgressRef.current) {
        hudProgressRef.current.textContent = `${(scrollProgress * 100).toFixed(1).padStart(4, "0")}%`;
      }
      if (hudVelocityRef.current) {
        hudVelocityRef.current.textContent = `${absVel.toFixed(1)} px/f`;
      }

      const normSpeed = Math.min(100, Math.max(15, absVel * 4.2));
      hudBarsRef.current.forEach((bar, i) => {
        if (bar) {
          const h = Math.max(14, Math.min(100, normSpeed * (0.45 + (i / 6) * 0.75)));
          bar.style.height = `${h.toFixed(0)}%`;
        }
      });

      animFrameId = requestAnimationFrame(animate);
    };

    // Ambient Cursor Glow Listener
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.transform = `translate3d(${e.clientX - 170}px, ${e.clientY - 170}px, 0)`;
      }
    };

    buildPath();
    animFrameId = requestAnimationFrame(animate);

    window.addEventListener("resize", buildPath);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Periodic path check for dynamically loaded elements
    const pathCheckInterval = setInterval(buildPath, 3000);

    return () => {
      cancelAnimationFrame(animFrameId);
      clearInterval(pathCheckInterval);
      window.removeEventListener("resize", buildPath);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <style>{`
        .waypoint-ring {
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
          transform: scale(0.4);
          transition: opacity 0.4s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .waypoint-node.ignited .waypoint-ring {
          opacity: 0.85;
          transform: scale(2.4);
          animation: signalPulseRing 2.2s ease-out infinite;
        }
        .waypoint-core {
          transition: fill 0.35s ease, r 0.35s ease;
        }
        .waypoint-node.ignited .waypoint-core {
          fill: #ff3b2f;
        }
        @keyframes signalPulseRing {
          0% { transform: scale(0.8); opacity: 0.85; }
          100% { transform: scale(2.9); opacity: 0; }
        }
      `}</style>

      {/* Desktop Magnetic Cursor Ambient Glow */}
      <div
        ref={cursorGlowRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-[340px] h-[340px] rounded-full pointer-events-none z-30 will-change-transform hidden md:block"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 59, 47, 0.08) 0%, rgba(255, 255, 255, 0.015) 40%, transparent 70%)",
          transform: "translate3d(-500px, -500px, 0)",
        }}
      />

      {/* Fixed Full-Viewport HTML5 Canvas for Leading Tip Orb & Velocity Particle Sparks */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-30"
      />

      {/* FULL-PAGE MULTI-STRAND MOVING LINE SVG OVERLAY */}
      <svg
        ref={svgRef}
        className="absolute top-0 left-0 w-full pointer-events-none z-10 overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Primary Luminous Beam Gradient (#ffffff -> #ffd0cc -> #ff3b2f) */}
          <linearGradient id="beamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#ffd0cc" />
            <stop offset="100%" stopColor="#ff3b2f" />
          </linearGradient>

          {/* Soft Luminous Bloom Filter */}
          <filter id="beamGlow" x="-25%" y="-10%" width="150%" height="120%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Strand 3: Background Architectural Rail */}
        <path
          ref={railPathRef}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
          strokeDasharray="4 8"
          style={{ transition: "opacity 0.35s ease", opacity: 0 }}
        />

        {/* Strand 2: Velocity-Lagged Harmonic Echo */}
        <path
          ref={echoPathRef}
          fill="none"
          stroke="#ff3b2f"
          strokeOpacity="0.45"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Strand 1: Primary Luminous Beam */}
        <path
          ref={primaryPathRef}
          fill="none"
          stroke="url(#beamGrad)"
          strokeWidth="2.6"
          strokeLinecap="round"
          filter="url(#beamGlow)"
        />

        {/* 5 Igniting Geometric Waypoint Nodes */}
        <g ref={waypointsGroupRef} />
      </svg>

      {/* Floating Fixed Telemetry HUD (Bottom-Right Glassmorphic Pill) */}
      <aside
        aria-label="Scroll Physics Telemetry"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-3.5 px-4 py-2.5 rounded-full backdrop-blur-xl bg-black/75 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)] pointer-events-auto select-none"
      >
        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">Progress</span>
          <span ref={hudProgressRef} className="font-mono text-xs font-bold text-zinc-100 tabular-nums">
            00.0%
          </span>
        </div>

        <div className="w-px h-6 bg-white/15" />

        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">Velocity</span>
          <span ref={hudVelocityRef} className="font-mono text-xs font-bold text-[#ff3b2f] tabular-nums">
            0.0 px/f
          </span>
        </div>

        {/* Live Velocity Sparkline Bars */}
        <div className="hidden sm:flex items-end gap-[2px] h-6 w-12 px-1" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              ref={(el) => {
                hudBarsRef.current[i] = el;
              }}
              className={`w-1 rounded-full transition-all duration-75 ${i === 5 ? "bg-[#ff3b2f]" : "bg-white/25"}`}
              style={{ height: "20%" }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Smooth Scroll to Top"
          aria-label="Return to Origin"
          className="w-7 h-7 rounded-full border border-white/15 hover:border-[#ff3b2f] hover:bg-[#ff3b2f]/15 flex items-center justify-center text-zinc-200 hover:text-white transition group"
        >
          <svg className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </aside>
    </>
  );
}