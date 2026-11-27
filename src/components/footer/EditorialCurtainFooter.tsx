import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function EditorialCurtainFooter() {
  const [soundOn, setSoundOn] = useState(true);
  const [countdown, setCountdown] = useState("--h --m --s");
  const [istClock, setIstClock] = useState("--:--:-- IST");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Elastic String Refs
  const elasticZoneRef = useRef<HTMLDivElement>(null);
  const elasticSvgRef = useRef<SVGSVGElement>(null);
  const elasticPathRef = useRef<SVGPathElement>(null);
  const elasticGlowPathRef = useRef<SVGPathElement>(null);
  const stringHintRef = useRef<HTMLSpanElement>(null);

  // Spotlight & Canvas Refs
  const wordmarkStageRef = useRef<HTMLDivElement>(null);
  const spotMaskGradRef = useRef<SVGRadialGradientElement>(null);
  const spotFillGradRef = useRef<SVGRadialGradientElement>(null);
  const spotRimGradRef = useRef<SVGRadialGradientElement>(null);
  const dotCanvasRef = useRef<HTMLCanvasElement>(null);
  const crowdCanvasRef = useRef<HTMLCanvasElement>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2400);
  };

  // 1. Web Audio Pluck & Click
  const ensureAudio = () => {
    if (!soundOn) return null;
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (Ctx) audioCtxRef.current = new Ctx();
      }
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  const playClick = (freq = 560) => {
    const ctx = ensureAudio();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.03);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  };

  const playStringPluck = (intensity = 0.5) => {
    const ctx = ensureAudio();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const baseFreq = 195 + Math.min(140, intensity * 120);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.88, now + 0.18);
      gain.gain.setValueAtTime(Math.min(0.055, 0.018 + intensity * 0.035), now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  };

  // 2. Live 06:00 IST Countdown & Jaipur / IST Digital Clock
  useEffect(() => {
    const tick = () => {
      const istOffsetMs = 5.5 * 3600 * 1000;
      const nowIst = new Date(Date.now() + istOffsetMs);
      const ch = String(nowIst.getUTCHours()).padStart(2, "0");
      const cm = String(nowIst.getUTCMinutes()).padStart(2, "0");
      const cs = String(nowIst.getUTCSeconds()).padStart(2, "0");
      setIstClock(`${ch}:${cm}:${cs} IST`);

      const nextPress = new Date(nowIst.getTime());
      nextPress.setUTCHours(6, 0, 0, 0);
      if (nowIst.getTime() >= nextPress.getTime()) {
        nextPress.setUTCDate(nextPress.getUTCDate() + 1);
      }
      const diffSec = Math.max(0, Math.floor((nextPress.getTime() - nowIst.getTime()) / 1000));
      const dh = String(Math.floor(diffSec / 3600)).padStart(2, "0");
      const dm = String(Math.floor((diffSec % 3600) / 60)).padStart(2, "0");
      const ds = String(diffSec % 60).padStart(2, "0");
      setCountdown(`${dh}h ${dm}m ${ds}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // 3. Guitar-String Elastic Tension Border Physics
  useEffect(() => {
    const zone = elasticZoneRef.current;
    const svg = elasticSvgRef.current;
    const path = elasticPathRef.current;
    const glowPath = elasticGlowPathRef.current;
    const hint = stringHintRef.current;
    if (!zone || !svg || !path || !glowPath) return;

    const str = {
      w: window.innerWidth,
      h: 64,
      midY: 32,
      cx: window.innerWidth * 0.5,
      cy: 32,
      targetX: window.innerWidth * 0.5,
      targetY: 32,
      vy: 0,
      pulling: false,
      lastPluckTime: 0,
    };

    const resize = () => {
      const rect = zone.getBoundingClientRect();
      str.w = Math.max(300, rect.width);
      str.h = rect.height || 64;
      str.midY = str.h * 0.5;
      svg.setAttribute("viewBox", `0 0 ${str.w} ${str.h}`);
      if (!str.pulling) {
        str.targetX = str.w * 0.5;
        str.targetY = str.midY;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const onPointerMove = (e: PointerEvent) => {
      const rect = zone.getBoundingClientRect();
      const relX = Math.max(24, Math.min(rect.width - 24, e.clientX - rect.left));
      const relY = e.clientY - rect.top;
      const deltaY = Math.max(-30, Math.min(30, (relY - str.midY) * 1.45));
      str.pulling = true;
      str.targetX = relX;
      str.targetY = str.midY + deltaY;
      if (hint) hint.style.opacity = "0";
    };

    const releaseString = () => {
      if (!str.pulling) return;
      const deflection = Math.abs(str.cy - str.midY);
      str.pulling = false;
      str.targetY = str.midY;
      const now = performance.now();
      if (deflection > 6 && now - str.lastPluckTime > 160) {
        str.lastPluckTime = now;
        playStringPluck(Math.min(1, deflection / 28));
      }
    };

    zone.addEventListener("pointermove", onPointerMove);
    zone.addEventListener("pointerleave", releaseString);
    zone.addEventListener("pointerup", releaseString);

    let rafId: number;
    const step = () => {
      if (str.pulling) {
        str.cx += (str.targetX - str.cx) * 0.25;
        str.cy += (str.targetY - str.cy) * 0.28;
        str.vy = 0;
      } else {
        const stiffness = 0.16;
        const damping = 0.84;
        const forceY = (str.midY - str.cy) * stiffness;
        str.vy = (str.vy + forceY) * damping;
        str.cy += str.vy;
        str.cx += (str.w * 0.5 - str.cx) * 0.08;
      }

      const d = `M 0 ${str.midY} Q ${str.cx.toFixed(1)} ${str.cy.toFixed(1)} ${str.w} ${str.midY}`;
      path.setAttribute("d", d);
      glowPath.setAttribute("d", d);

      const tension = Math.min(1, Math.abs(str.cy - str.midY) / 24);
      glowPath.setAttribute("opacity", (tension * 0.92).toFixed(3));

      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", resize);
      zone.removeEventListener("pointermove", onPointerMove);
      zone.removeEventListener("pointerleave", releaseString);
      zone.removeEventListener("pointerup", releaseString);
      cancelAnimationFrame(rafId);
    };
  }, [soundOn]);

  // 4. Spotlight Wordmark & Halftone Dot Canvas
  useEffect(() => {
    const stage = wordmarkStageRef.current;
    const dotCanvas = dotCanvasRef.current;
    if (!stage || !dotCanvas) return;
    const dotCtx = dotCanvas.getContext("2d");
    if (!dotCtx) return;

    const spot = {
      hovering: false,
      tx: 0.5,
      ty: 0.5,
      x: 0.5,
      y: 0.5,
      tr: 205,
      r: 205,
      phase: 0,
    };

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dotCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
      dotCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
      dotCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onPointerMove = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      spot.hovering = true;
      spot.tx = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
      spot.ty = Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height)));
      spot.tr = 285;
    };

    const onPointerLeave = () => {
      spot.hovering = false;
      spot.tr = 195;
    };

    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);

    let rafId: number;
    const step = () => {
      spot.phase += 0.008;
      if (!spot.hovering) {
        spot.tx = 0.5 + Math.sin(spot.phase) * 0.34;
        spot.ty = 0.5 + Math.cos(spot.phase * 0.7) * 0.14;
      }
      spot.x += (spot.tx - spot.x) * 0.1;
      spot.y += (spot.ty - spot.y) * 0.1;
      spot.r += (spot.tr - spot.r) * 0.08;

      const svgX = (spot.x * 1200).toFixed(1);
      const svgY = (spot.y * 154).toFixed(1);
      const svgR = spot.r.toFixed(1);

      [spotMaskGradRef.current, spotFillGradRef.current, spotRimGradRef.current].forEach((grad) => {
        if (grad) {
          grad.setAttribute("cx", svgX);
          grad.setAttribute("cy", svgY);
          grad.setAttribute("r", svgR);
        }
      });

      const w = stage.clientWidth;
      const h = stage.clientHeight;
      dotCtx.clearRect(0, 0, w, h);

      const gap = w < 640 ? 18 : 22;
      const cx = spot.x * w;
      const cy = spot.y * h;
      const radius = Math.max(140, w * 0.22);

      for (let y = gap * 0.5; y < h; y += gap) {
        for (let x = gap * 0.5; x < w; x += gap) {
          const dist = Math.hypot(x - cx, y - cy);
          const proximity = Math.max(0, 1 - dist / radius);
          const alpha = 0.03 + proximity * proximity * (spot.hovering ? 0.32 : 0.16);
          const dotR = 0.85 + proximity * 1.15;

          dotCtx.beginPath();
          dotCtx.arc(x, y, dotR, 0, Math.PI * 2);
          if (proximity > 0.52) {
            dotCtx.fillStyle = `rgba(255, 69, 58, ${(alpha * 0.9).toFixed(3)})`;
          } else {
            dotCtx.fillStyle = `rgba(245, 245, 247, ${alpha.toFixed(3)})`;
          }
          dotCtx.fill();
        }
      }

      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", resize);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // 5. Open Peeps Walking Crowd Animation (from adxy.dev / minima)
  useEffect(() => {
    const canvas = crowdCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = {
      src: "/images/open-peeps-sheet.avif",
      rows: 15,
      cols: 7,
    };

    const randomRange = (min: number, max: number) => min + Math.random() * (max - min);
    const randomIndex = (array: unknown[]) => (randomRange(0, array.length) | 0);
    const removeRandomFromArray = <T,>(array: T[]): T => array.splice(randomIndex(array), 1)[0];
    const removeItemFromArray = <T,>(array: T[], item: T) => {
      const idx = array.indexOf(item);
      if (idx !== -1) array.splice(idx, 1);
    };

    class Peep {
      image: HTMLImageElement;
      rect: [number, number, number, number];
      width: number;
      height: number;
      drawArgs: [HTMLImageElement, number, number, number, number, number, number, number, number];
      x = 0;
      y = 0;
      anchorY = 0;
      scaleX = 1;
      walk: gsap.core.Timeline | null = null;

      constructor({ image, rect }: { image: HTMLImageElement; rect: [number, number, number, number] }) {
        this.image = image;
        this.rect = rect;
        this.width = rect[2];
        this.height = rect[3];
        this.drawArgs = [this.image, ...rect, 0, 0, this.width, this.height];
      }

      render(targetCtx: CanvasRenderingContext2D) {
        let scaleY = 0.58;
        if (targetCtx.canvas.clientWidth < 960) scaleY = 0.42;
        if (targetCtx.canvas.clientWidth < 480) scaleY = 0.3;

        targetCtx.save();
        targetCtx.translate(this.x, this.y);
        targetCtx.scale(this.scaleX, scaleY);
        targetCtx.drawImage(...this.drawArgs);
        targetCtx.restore();
      }
    }

    const stage = { width: 0, height: 0 };
    const allPeeps: Peep[] = [];
    const availablePeeps: Peep[] = [];
    const crowd: Peep[] = [];

    const resetPeep = ({ stage: st, peep }: { stage: typeof stage; peep: Peep }) => {
      let offsetVarA = 80;
      let offsetVarB = 160;
      let scaleX = 0.58;

      if (window.innerWidth < 960) {
        offsetVarA = 120;
        offsetVarB = 110;
        scaleX = 0.42;
      }
      if (window.innerWidth < 480) {
        offsetVarA = 140;
        offsetVarB = 80;
        scaleX = 0.3;
      }

      const direction = Math.random() > 0.5 ? 1 : -1;
      const offsetY = offsetVarA - offsetVarB * gsap.parseEase("power2.in")(Math.random());
      const startY = st.height - peep.height * scaleX + offsetY;
      let startX: number;
      let endX: number;

      if (direction === 1) {
        startX = -peep.width * scaleX;
        endX = st.width;
        peep.scaleX = scaleX;
      } else {
        startX = st.width + peep.width * scaleX;
        endX = -peep.width * scaleX;
        peep.scaleX = -1 * scaleX;
      }

      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;

      return { startX, startY, endX };
    };

    const normalWalk = ({ peep, props }: { peep: Peep; props: { startX: number; startY: number; endX: number } }) => {
      const { startY, endX } = props;
      const xDuration = randomRange(14, 24);
      const yDuration = 0.28;

      const tl = gsap.timeline();
      tl.timeScale(randomRange(0.7, 1.3));
      tl.to(peep, { duration: xDuration, x: endX, ease: "none" }, 0);
      tl.to(peep, { duration: yDuration, repeat: Math.floor(xDuration / yDuration), yoyo: true, y: startY - 12 }, 0);
      return tl;
    };

    let killed = false;

    const addPeepToCrowd = () => {
      if (killed || !availablePeeps.length) return null;
      const peep = removeRandomFromArray(availablePeeps);
      const walk = normalWalk({
        peep,
        props: resetPeep({ stage, peep }),
      }).eventCallback("onComplete", () => {
        if (killed) return;
        removeItemFromArray(crowd, peep);
        availablePeeps.push(peep);
        addPeepToCrowd();
      });

      peep.walk = walk;
      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);
      return peep;
    };

    const resizeCrowd = () => {
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = stage.width * dpr;
      canvas.height = stage.height * dpr;

      crowd.forEach((p) => p.walk?.kill());
      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);

      while (availablePeeps.length > 0) {
        const p = addPeepToCrowd();
        if (p?.walk) {
          p.walk.progress(Math.random());
        }
      }
    };

    const img = new Image();
    img.src = config.src;
    img.onload = () => {
      if (killed) return;
      const { rows, cols } = config;
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const total = rows * cols;
      const rectWidth = width / rows;
      const rectHeight = height / cols;

      for (let i = 0; i < total; i++) {
        allPeeps.push(
          new Peep({
            image: img,
            rect: [
              (i % rows) * rectWidth,
              ((i / rows) | 0) * rectHeight,
              rectWidth,
              rectHeight,
            ],
          })
        );
      }

      resizeCrowd();
      window.addEventListener("resize", resizeCrowd);
    };

    const renderLoop = () => {
      if (killed) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      crowd.forEach((p) => p.render(ctx));
      ctx.restore();
    };

    gsap.ticker.add(renderLoop);

    return () => {
      killed = true;
      gsap.ticker.remove(renderLoop);
      window.removeEventListener("resize", resizeCrowd);
      crowd.forEach((p) => p.walk?.kill());
    };
  }, []);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      playClick(320);
      return;
    }
    setSubscribed(true);
    playClick(620);
    showToast("Morning Wire confirmed for 06:00 IST");
  };

  return (
    <>
      <style>{`
        /* Architectural Curtain Reveal Footer Styling */
        .curtain-sheet {
          position: relative;
          z-index: 20;
          background-color: #0D0D10;
          background-image:
            radial-gradient(ellipse 70% 55% at 50% 0%, rgba(255, 69, 58, 0.065) 0%, transparent 65%),
            linear-gradient(rgba(255, 255, 255, 0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.022) 1px, transparent 1px);
          background-size: 100% 100%, 72px 72px, 72px 72px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 36px 90px rgba(0, 0, 0, 0.92);
        }

        .mag-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #A1A1A6;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: -0.01em;
          padding: 4px 0;
          transition: color 0.25s ease;
          cursor: pointer;
        }
        .mag-link:hover {
          color: #F5F5F7;
        }
        .mag-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 1px;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, #FF453A, rgba(245, 245, 247, 0.65));
          transform: scaleX(0);
          transform-origin: right center;
          transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mag-link:hover::after {
          transform: scaleX(1);
          transform-origin: left center;
        }
        .mag-link .link-arrow {
          font-size: 11px;
          opacity: 0;
          transform: translateX(-5px);
          color: #FF453A;
          transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mag-link:hover .link-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        @keyframes scrollDrop {
          0% { transform: translateY(-100%); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(220%); opacity: 0; }
        }
        .scroll-drop-bar {
          animation: scrollDrop 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }

        #crowd-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          opacity: 0.88;
        }
      `}</style>

      {/* =========================================================================
           1. ARCHITECTURAL CURTAIN PREVIEW SECTION (FULL PAGE 1)
           ========================================================================= */}
      <section
        id="curtainSection"
        className="curtain-sheet w-full min-h-screen flex flex-col justify-between px-6 sm:px-12 py-10 sm:py-12 text-zinc-100 select-none"
      >
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF453A] shadow-[0_0_10px_#FF453A]" />
            <span className="font-mono text-[11px] font-semibold tracking-[0.22em] uppercase text-[#F5F5F7]">
              THE DAILY CIRCUIT
            </span>
          </div>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#8E8E93]">
            ISSUE #142 · FINITE BROADSHEET
          </span>
        </div>

        <div className="max-w-4xl w-full mx-auto text-center my-auto py-12 flex flex-col items-center justify-center">
          <p className="font-mono text-[11.5px] uppercase tracking-[0.28em] text-[#FF453A] font-semibold mb-4">
            END OF TODAY&apos;S SIGNAL
          </p>
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-serif leading-[0.98] tracking-tight text-[#F5F5F7] font-normal">
            Zero infinite feeds.<br />
            <span className="italic text-white/65">Go build something real.</span>
          </h2>
          <p className="mt-6 max-w-lg mx-auto text-sm sm:text-base text-[#8E8E93] leading-relaxed">
            Scroll down to draw back the curtain and experience the elastic tension border, live press telemetry, and crowd spotlight wordmark.
          </p>

          <div className="mt-10 flex flex-col items-center gap-6">
            <button
              type="button"
              onClick={() => {
                playClick(620);
                document.getElementById("editorialFooter")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-[#F5F5F7] text-black font-mono text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#FF453A] hover:text-white transition-all shadow-[0_12px_36px_rgba(255,69,58,0.22)] cursor-pointer active:scale-95"
            >
              <span>Jump to Footer</span>
              <span>↓</span>
            </button>

            <div className="flex flex-col items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8E8E93]">
                Scroll to experience the Curtain Reveal ↓
              </span>
              <div className="w-px h-10 bg-white/15 relative overflow-hidden">
                <div className="w-full h-4 bg-gradient-to-b from-transparent via-[#FF453A] to-white scroll-drop-bar" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl w-full mx-auto flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
          <span>PAGE 08 / 08 COMPLETE</span>
          <span>CURTAIN REVEAL ACTIVE</span>
        </div>
      </section>

      {/* =========================================================================
           2. CENTERPIECE: ULTRA-MINIMAL ANIMATED EDITORIAL FOOTER (FULL PAGE 2)
           ========================================================================= */}
      <footer
        id="editorialFooter"
        className="w-full min-h-screen flex flex-col justify-between bg-[#08080A] text-[#F5F5F7] pt-2 pb-8 relative z-10"
      >
        {/* SIGNATURE ANIMATION 1: ELASTIC TENSION STRING TOP BORDER */}
        <div
          ref={elasticZoneRef}
          className="relative w-full h-[64px] -mt-4 cursor-crosshair select-none overflow-visible"
          aria-hidden="true"
        >
          <svg
            ref={elasticSvgRef}
            className="w-full h-full block overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="stringIdleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
                <stop offset="20%" stopColor="rgba(255,255,255,0.16)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.28)" />
                <stop offset="80%" stopColor="rgba(255,255,255,0.16)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
              </linearGradient>
              <linearGradient id="stringGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,69,58,0)" />
                <stop offset="50%" stopColor="rgba(255,69,58,0.95)" />
                <stop offset="100%" stopColor="rgba(255,69,58,0)" />
              </linearGradient>
            </defs>
            <path
              ref={elasticGlowPathRef}
              fill="none"
              stroke="url(#stringGlowGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0"
              style={{ filter: "blur(4px)" }}
            />
            <path
              ref={elasticPathRef}
              fill="none"
              stroke="url(#stringIdleGrad)"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
          <span
            ref={stringHintRef}
            className="pointer-events-none absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/25 transition-opacity duration-500 hidden sm:inline"
          >
            PLUCK BORDER
          </span>
        </div>

        {/* SIGNATURE ANIMATION 2: MINIMAL 3-COLUMN EDITORIAL MASTHEAD ROW */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-8 pb-12 sm:pt-12 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* LEFT COLUMN: LIVE PRESS TELEMETRY */}
            <div className="lg:col-span-4 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
                <span className="w-2 h-2 rounded-full bg-[#FF453A] animate-pulse" />
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#F5F5F7]">
                  PRESS ONLINE · ISSUE #142
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8E8E93]">
                    NEXT 06:00 IST PRESS RUN
                  </div>
                  <div className="font-mono text-2xl sm:text-[26px] font-medium tracking-tight text-[#F5F5F7] tabular-nums mt-1">
                    {countdown}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-white/[0.07] font-mono text-[11px] text-[#8E8E93]">
                  <div className="flex items-center gap-2">
                    <span className="text-white/35">LOC</span>
                    <span className="text-[#F5F5F7]/85">JAIPUR · IST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/35">CLK</span>
                    <span className="text-[#F5F5F7]/85 tabular-nums">{istClock}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#8E8E93]/80 leading-relaxed max-w-xs">
                Automated 24-hour AI models, systems engineering repos, and verified benchmarks. Compiled once daily. Never infinite.
              </p>
            </div>

            {/* CENTER COLUMN: MAGNETIC EDITORIAL LINKS */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-8">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 mb-5">
                  DAILY DISPATCH
                </div>
                <ul className="space-y-2.5">
                  {["Front Page", "Top AI Models", "GitHub 24h", "Research Papers"].map((link) => (
                    <li key={link}>
                      <a
                        href="#curtainSection"
                        onClick={(e) => {
                          e.preventDefault();
                          playClick(540);
                          showToast(`Navigating to ${link}`);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="mag-link"
                      >
                        <span>{link}</span>
                        <span className="link-arrow">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 mb-5">
                  ARCHITECTURE
                </div>
                <ul className="space-y-2.5">
                  {["3D Broadsheet", "Archive Stack", "Signal Methodology", "RSS / JSON"].map((link) => (
                    <li key={link}>
                      <a
                        href="#curtainSection"
                        onClick={(e) => {
                          e.preventDefault();
                          playClick(540);
                          showToast(`Navigating to ${link}`);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="mag-link"
                      >
                        <span>{link}</span>
                        <span className="link-arrow">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN: LIQUID GLASS MORNING WIRE */}
            <div className="lg:col-span-4 space-y-5">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 mb-2">
                  MORNING WIRE
                </div>
                <p className="font-serif text-2xl sm:text-[26px] leading-tight text-[#F5F5F7]">
                  Get the <span className="italic text-white/75">06:00 IST</span> dispatch.
                </p>
              </div>

              <form onSubmit={handleSubscribeSubmit} className="space-y-2.5">
                <div
                  className={`rounded-full p-1.5 pl-4 flex items-center gap-2 border transition-all ${
                    subscribed
                      ? "border-[#30D158]/50 bg-[#30D158]/10 shadow-[0_0_24px_rgba(48,209,88,0.2)]"
                      : "border-white/15 bg-white/[0.045] backdrop-blur-xl focus-within:border-[#FF453A]/60"
                  }`}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    disabled={subscribed}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@domain.com"
                    className="w-full bg-transparent outline-none text-[13.5px] text-[#F5F5F7] placeholder:text-[#8E8E93]/75"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to Morning Wire"
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all shrink-0 cursor-pointer ${
                      subscribed
                        ? "bg-[#30D158] text-black"
                        : "bg-[#F5F5F7] text-black hover:bg-[#FF453A] hover:text-white"
                    }`}
                  >
                    {subscribed ? "✓" : "→"}
                  </button>
                </div>
                <p className="font-mono text-[10.5px] text-[#8E8E93] min-h-[16px] pl-1">
                  {subscribed
                    ? "Subscribed — See you at 06:00 IST"
                    : "One concise issue at 06:00 IST. Unsubscribe in one click."}
                </p>
              </form>

              {/* Social Circles */}
              <div className="flex items-center gap-3 pt-1">
                {[
                  { label: "GitHub", href: "https://github.com/RaunakxShrivastva/The_Daily_Circuit" },
                  { label: "X / Feed", href: "https://twitter.com" },
                  { label: "Mail", href: "mailto:press@thedailycircuit.dev" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => playClick(520)}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.035] border border-white/10 text-[#A1A1A6] hover:text-white hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer text-xs font-mono"
                    title={s.label}
                  >
                    {s.label[0]}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
             SIGNATURE ANIMATION 3: MASSIVE INTERACTIVE SPOTLIGHT WORDMARK
             + OPEN PEEPS WALKING CROWD ANIMATION (BEHIND THE TEXT)
             ========================================================================= */}
        <div
          ref={wordmarkStageRef}
          id="wordmarkStage"
          className="relative w-full py-4 overflow-hidden select-none cursor-default min-h-[220px] flex items-center justify-center"
        >
          {/* Layer 1: Open Peeps Walking Crowd Canvas (from adxy.dev / minima) */}
          <canvas ref={crowdCanvasRef} id="crowd-canvas" />

          {/* Layer 2: Halftone Dot Matrix Canvas */}
          <canvas
            ref={dotCanvasRef}
            id="dotMatrixCanvas"
            className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
          />

          {/* Layer 3: Edge-to-Edge SVG Wordmark with Radial Spotlight Mask */}
          <div className="max-w-[1440px] w-full mx-auto px-3 sm:px-8 relative z-[3]">
            <svg
              viewBox="0 0 1200 154"
              role="img"
              aria-label="THE DAILY CIRCUIT"
              className="w-full h-auto block"
            >
              <defs>
                <radialGradient
                  ref={spotMaskGradRef}
                  id="spotMaskGrad"
                  gradientUnits="userSpaceOnUse"
                  cx="600"
                  cy="77"
                  r="240"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="48%" stopColor="#ffffff" stopOpacity="0.72" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>

                <mask id="wordmarkSpotMask">
                  <rect x="0" y="0" width="1200" height="154" fill="black" />
                  <rect x="0" y="0" width="1200" height="154" fill="url(#spotMaskGrad)" />
                </mask>

                <radialGradient
                  ref={spotFillGradRef}
                  id="spotFillGrad"
                  gradientUnits="userSpaceOnUse"
                  cx="600"
                  cy="77"
                  r="240"
                >
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="52%" stopColor="#E5E5EA" />
                  <stop offset="100%" stopColor="#6E6E73" />
                </radialGradient>

                <radialGradient
                  ref={spotRimGradRef}
                  id="spotRimGrad"
                  gradientUnits="userSpaceOnUse"
                  cx="600"
                  cy="77"
                  r="250"
                >
                  <stop offset="0%" stopColor="#FF453A" stopOpacity="0.95" />
                  <stop offset="55%" stopColor="#FF6961" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FF453A" stopOpacity="0" />
                </radialGradient>

                <filter id="vermilionBloom" x="-10%" y="-25%" width="120%" height="150%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Layer 1: Dark-Chrome Hairline Outline (Always Visible) */}
              <text
                x="600"
                y="122"
                textAnchor="middle"
                fontFamily="'Playfair Display', Georgia, serif"
                fontWeight="800"
                fontSize="112"
                letterSpacing="-2.5"
                fill="rgba(255,255,255,0.03)"
                stroke="rgba(255,255,255,0.09)"
                strokeWidth="1"
              >
                THE DAILY CIRCUIT
              </text>

              {/* Layer 2: Vermilion Edge Bloom (Masked to Spotlight) */}
              <text
                x="600"
                y="122"
                textAnchor="middle"
                fontFamily="'Playfair Display', Georgia, serif"
                fontWeight="800"
                fontSize="112"
                letterSpacing="-2.5"
                fill="none"
                stroke="url(#spotRimGrad)"
                strokeWidth="2.2"
                mask="url(#wordmarkSpotMask)"
                filter="url(#vermilionBloom)"
              >
                THE DAILY CIRCUIT
              </text>

              {/* Layer 3: Crisp Illuminated Ivory Fill (Masked to Spotlight) */}
              <text
                x="600"
                y="122"
                textAnchor="middle"
                fontFamily="'Playfair Display', Georgia, serif"
                fontWeight="800"
                fontSize="112"
                letterSpacing="-2.5"
                fill="url(#spotFillGrad)"
                mask="url(#wordmarkSpotMask)"
              >
                THE DAILY CIRCUIT
              </text>
            </svg>
          </div>
        </div>

        {/* SIGNATURE ANIMATION 4: ULTRA-CLEAN BOTTOM COLOPHON BAR */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 mt-4">
          <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#8E8E93] text-center sm:text-left">
              &copy; 2026 THE DAILY CIRCUIT <span className="text-white/25 mx-1.5">&middot;</span> FINITE BY DESIGN
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setSoundOn((s) => !s)}
                className="px-3.5 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.09] font-mono text-[10.5px] uppercase tracking-wider text-[#8E8E93] hover:text-white transition cursor-pointer"
              >
                Sound: {soundOn ? "ON" : "OFF"}
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick(680);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-4 py-2 rounded-full bg-[#F5F5F7] text-black hover:bg-[#FF453A] hover:text-white font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] transition-all cursor-pointer active:scale-95"
              >
                ↑ BACK TO TOP
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Status Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] rounded-full px-4 py-2 font-mono text-[11px] text-[#F5F5F7] bg-[#121216]/90 backdrop-blur-md border border-white/15 shadow-2xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF453A]" />
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  );
}
