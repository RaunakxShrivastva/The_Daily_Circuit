import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import '../styles/iphone-duo.css';

interface IPhoneDuoStageProps {
  scrollProgress: number; // 0..1 from the scroll runway
  controlledSpread?: number;
  onSpreadChange?: (spread: number) => void;
}

const TOTAL_SPREADS = 4;

const SPREAD_INKY_NOTES = [
  "Spread 1: Beam MoE 501B with 23.4B active sparse routing. Living Ink canvas is live!",
  "Spread 2: Top GitHub velocity & 3 distilled frontier ArXiv papers.",
  "Spread 3: Hardware telemetry & local Python MoE router kernel.",
  "Spread 4: Complete the architecture quiz and stamp your edition!"
];

const MOE_PYTHON_SNIPPET = `import torch, torch.nn as nn

class BeamMoERouter(nn.Module):
    def __init__(self, d_model=4096, n_exp=64, k=4):
        super().__init__()
        self.gate = nn.Linear(d_model, n_exp, bias=False)
        self.k = k

    def forward(self, x):
        logits = self.gate(x)
        probs = torch.softmax(logits, dim=-1)
        weights, idx = torch.topk(probs, self.k, dim=-1)
        weights = weights / weights.sum(dim=-1, keepdim=True)
        return weights, idx  # 23.4B active / 501B total`;

export function IPhoneDuoStage({
  scrollProgress,
  controlledSpread,
  onSpreadChange,
}: IPhoneDuoStageProps) {
  const [currentSpread, setCurrentSpread] = useState(controlledSpread ?? 0);
  const [baseScale, setBaseScale] = useState(1.0);
  const [foldAngle, setFoldAngle] = useState(0); // 0° = closed, 180° = unfolded flat
  const [isManualScrub, setIsManualScrub] = useState(false);
  const [isStamped, setIsStamped] = useState(false);
  const [quizScore, setQuizScore] = useState<[boolean | null, boolean | null]>([null, null]);
  const [codeCopied, setCodeCopied] = useState(false);
  const [inkyMessage, setInkyMessage] = useState("Edition #143 is live — unfold Duo to explore all 8 pages!");
  const [showInkyBubble, setShowInkyBubble] = useState(true);
  const [istCountdown, setIstCountdown] = useState("--h --m --s");

  // Leaf angles for 3 physical double-sided sheets (0 = on right side, -180 = turned to left side)
  const [leafAngles, setLeafAngles] = useState<[number, number, number]>([0, 0, 0]);
  const leafAnglesRef = useRef<[number, number, number]>([0, 0, 0]);
  const leafTargetsRef = useRef<[number, number, number]>([0, 0, 0]);
  const leafVelsRef = useRef<[number, number, number]>([0, 0, 0]);

  // Drag tracking state
  const dragRef = useRef<{
    active: boolean;
    leafIdx: number;
    startX: number;
    startAngle: number;
  }>({ active: false, leafIdx: -1, startX: 0, startAngle: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inkyPupilLRef = useRef<SVGCircleElement | null>(null);
  const inkyPupilRRef = useRef<SVGCircleElement | null>(null);
  const inkyBtnRef = useRef<HTMLButtonElement | null>(null);

  // Sync external controlledSpread if provided
  useEffect(() => {
    if (controlledSpread !== undefined && controlledSpread !== currentSpread) {
      goToSpread(controlledSpread);
    }
  }, [controlledSpread]);

  // Responsive scaling to fit viewport cleanly
  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = Math.max(0.48, Math.min((w - 48) / 720, (h - 130) / 480, 1.15));
      setBaseScale(s);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Web Audio mechanical sound synthesis
  const playSound = useCallback((type: 'swish' | 'click' | 'thud') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'swish') {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.16, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.16);
        filter.Q.value = 1.4;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start();
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.24, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'thud') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.48, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch (_) {}
  }, []);

  // Countdown timer to 06:00 IST morning press
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const ist = new Date(utc + 5.5 * 3600000);
      const next = new Date(ist);
      next.setHours(6, 0, 0, 0);
      if (ist.getTime() >= next.getTime()) {
        next.setDate(next.getDate() + 1);
      }
      const diff = Math.max(0, next.getTime() - ist.getTime());
      const hh = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const mm = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setIstCountdown(`${hh}h ${mm}m ${ss}s`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Living Ink Halftone Canvas Animation (Page 01)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const render = () => {
      t += 0.035;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cols = 28;
      const rows = 6;
      const dx = w / cols;
      const dy = h / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c + 0.5) * dx;
          const y = (r + 0.5) * dy;
          const dist = Math.hypot(x - w * 0.35, y - h * 0.5);
          const wave = Math.sin(dist * 0.08 - t) * 0.5 + 0.5;
          const rad = Math.max(0.8, wave * 2.8);

          ctx.fillStyle = wave > 0.65 ? '#D63B24' : '#151412';
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Inky cursor eye tracking
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const btn = inkyBtnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width * 0.5);
      const dy = e.clientY - (r.top + r.height * 0.5);
      const ang = Math.atan2(dy, dx);
      const dist = Math.min(2.0, Math.hypot(dx, dy) / 60);
      const px = Math.cos(ang) * dist;
      const py = Math.sin(ang) * dist;

      if (inkyPupilLRef.current) {
        inkyPupilLRef.current.setAttribute('cx', (24 + px).toFixed(2));
        inkyPupilLRef.current.setAttribute('cy', (30 + py).toFixed(2));
      }
      if (inkyPupilRRef.current) {
        inkyPupilRRef.current.setAttribute('cx', (36 + px).toFixed(2));
        inkyPupilRRef.current.setAttribute('cy', (30 + py).toFixed(2));
      }
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Sync scroll runway with iPhone Duo Unfolding & Spread Page Turns
  useEffect(() => {
    if (isManualScrub) return;

    const p = Math.max(0, Math.min(1, scrollProgress));
    // Phase 1 (0..0.24): Unfolding from 0° -> 180°
    if (p < 0.24) {
      const t = p / 0.24;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setFoldAngle(Math.round(eased * 180));
    } else {
      setFoldAngle(180);
      // Phase 2 (0.24..0.96): Turn through spreads 0 -> 1 -> 2 -> 3
      const pTurn = (p - 0.24) / 0.72;
      const targetSpread = Math.min(3, Math.floor(pTurn * 4));
      if (targetSpread !== currentSpread) {
        goToSpread(targetSpread, true);
      }
    }
  }, [scrollProgress, isManualScrub, currentSpread]);

  // Spring physics loop for realistic paper-flipping
  useEffect(() => {
    let animId: number;
    const stepPhysics = () => {
      let changed = false;
      const nextAngles: [number, number, number] = [...leafAnglesRef.current];

      for (let i = 0; i < 3; i++) {
        if (dragRef.current.active && dragRef.current.leafIdx === i) continue;

        const target = leafTargetsRef.current[i];
        const diff = target - nextAngles[i];
        if (Math.abs(diff) > 0.08 || Math.abs(leafVelsRef.current[i]) > 0.08) {
          leafVelsRef.current[i] = (leafVelsRef.current[i] + diff * 0.14) * 0.72;
          nextAngles[i] += leafVelsRef.current[i];
          if (nextAngles[i] > 0) { nextAngles[i] = 0; leafVelsRef.current[i] = 0; }
          if (nextAngles[i] < -180) { nextAngles[i] = -180; leafVelsRef.current[i] = 0; }
          changed = true;
        } else {
          nextAngles[i] = target;
          leafVelsRef.current[i] = 0;
        }
      }

      if (changed || dragRef.current.active) {
        leafAnglesRef.current = nextAngles;
        setLeafAngles([...nextAngles]);
      }
      animId = requestAnimationFrame(stepPhysics);
    };
    animId = requestAnimationFrame(stepPhysics);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Jump to specific spread (0..3) with realistic sequential page flips
  const goToSpread = useCallback((targetSpread: number, silent = false) => {
    const clamped = Math.max(0, Math.min(3, targetSpread));
    setCurrentSpread(clamped);
    if (onSpreadChange) onSpreadChange(clamped);

    // Leaf 0 flips between Spread 0 and Spread 1
    // Leaf 1 flips between Spread 1 and Spread 2
    // Leaf 2 flips between Spread 2 and Spread 3
    leafTargetsRef.current[0] = clamped >= 1 ? -180 : 0;
    leafTargetsRef.current[1] = clamped >= 2 ? -180 : 0;
    leafTargetsRef.current[2] = clamped >= 3 ? -180 : 0;

    if (!silent) {
      playSound('swish');
      setInkyMessage(SPREAD_INKY_NOTES[clamped]);
      setShowInkyBubble(true);
    }
  }, [onSpreadChange, playSound]);

  // Handle Drag / Peel Interaction on Paper Sheets
  const handlePointerDown = (e: React.PointerEvent, leafIdx: number) => {
    e.stopPropagation();
    dragRef.current = {
      active: true,
      leafIdx,
      startX: e.clientX,
      startAngle: leafAnglesRef.current[leafIdx]
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const { leafIdx, startX, startAngle } = dragRef.current;
    const deltaX = e.clientX - startX;
    // Map ~300px drag to 180° rotation
    const degDelta = (deltaX / 300) * 180;
    const newAngle = Math.max(-180, Math.min(0, startAngle + degDelta));
    leafAnglesRef.current[leafIdx] = newAngle;
    setLeafAngles([...leafAnglesRef.current]);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const { leafIdx } = dragRef.current;
    dragRef.current.active = false;

    // Settle to either 0 or -180 based on threshold
    const curAngle = leafAnglesRef.current[leafIdx];
    const target = curAngle < -90 ? -180 : 0;
    leafTargetsRef.current[leafIdx] = target;

    // Recalculate active spread from leaf positions
    let s = 0;
    if (leafTargetsRef.current[0] === -180) s = 1;
    if (leafTargetsRef.current[1] === -180) s = 2;
    if (leafTargetsRef.current[2] === -180) s = 3;
    setCurrentSpread(s);
    if (onSpreadChange) onSpreadChange(s);
    playSound('swish');
  };

  // Stamp ritual with confetti
  const handleStamp = () => {
    if (isStamped) return;
    setIsStamped(true);
    playSound('thud');
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#D63B24', '#151412', '#9A6B16', '#F5F0E4']
    });
    setInkyMessage("Edition #143 Stamped! Go build something extraordinary.");
    setShowInkyBubble(true);
  };

  // Copy code snippet
  const handleCopyCode = () => {
    navigator.clipboard.writeText(MOE_PYTHON_SNIPPET);
    setCodeCopied(true);
    playSound('click');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Kinematic Transforms for 3D Hardware Geometry
  const { leftRotY, centerX, camRotY, camRotX } = useMemo(() => {
    const t = foldAngle / 180;
    return {
      leftRotY: 178 - t * 178,
      centerX: -170 + t * 170,
      camRotY: -12 * (1 - t),
      camRotX: 4 * (1 - t)
    };
  }, [foldAngle]);

  const isBookActive = foldAngle >= 155;

  return (
    <div className="duo-viewport-3d" aria-label="iPhone Duo 3D Stage">
      <div
        className="duo-stage-scaler"
        style={{
          transform: `scale(${baseScale.toFixed(4)})`,
        }}
      >
        <div
          className="duo-assembly"
          style={{
            transform: `rotateX(${camRotX.toFixed(2)}deg) rotateY(${camRotY.toFixed(2)}deg) translateX(${centerX.toFixed(2)}px)`,
          }}
        >
          {/* Central Titanium Spine (Hides when unfolded to ensure zero black line) */}
          <div
            className="duo-hinge-spine"
            style={{
              opacity: foldAngle >= 170 ? 0 : 1,
            }}
          />

          {/* =================================================================
              LEFT HALF: Cover Display on Outer Face, Inner Base Left on Inner Face
              ================================================================= */}
          <div
            className="duo-half duo-left-half"
            style={{
              transform: `rotateY(${leftRotY.toFixed(2)}deg)`,
            }}
          >
            <div className="duo-edge-wall duo-edge-outer-left" />
            <div className="duo-edge-wall duo-edge-top" />
            <div className="duo-edge-wall duo-edge-bottom" />

            {/* SWISS-EDITORIAL COVER OLED DISPLAY (0° FOLDED) */}
            <div className="duo-face duo-face-outer">
              <div className="duo-cover-bezel">
                <div className="duo-cover-oled">
                  {/* Top Wire Telemetry */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-[9px] font-semibold tracking-[0.14em] text-[#30D158]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] shadow-[0_0_8px_#30D158]" />
                      <span>06:00 IST · WIRE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] tracking-[0.12em] text-[#F5F3EE]/65">96.8% SIGNAL</span>
                      <div className="duo-punch-hole" />
                    </div>
                  </div>

                  {/* Double-Ruled Masthead */}
                  <div className="border-y border-white/20 py-2.5 text-center my-1">
                    <div className="font-mono text-[8px] tracking-[0.22em] text-[#F5F3EE]/50 uppercase">
                      VOL. XXIV · NO. 842 · EDITION #143
                    </div>
                    <div className="font-serif font-extrabold text-[23px] leading-tight tracking-tight text-[#F5F3EE] mt-0.5">
                      THE DAILY CIRCUIT
                    </div>
                    <div className="font-mono text-[7.5px] tracking-[0.18em] text-[#D9A84E] uppercase mt-0.5">
                      24H PHYSICAL &amp; DIGITAL INTELLIGENCE BROADSHEET
                    </div>
                  </div>

                  {/* 3-Column Telemetry Strip */}
                  <div className="grid grid-cols-3 gap-1.5 text-center py-1.5 border-b border-white/10 font-mono">
                    <div>
                      <div className="text-[11px] font-bold text-[#F5F3EE]">501B</div>
                      <div className="text-[7px] text-[#F5F3EE]/45 uppercase">PARAMS</div>
                    </div>
                    <div className="border-x border-white/10">
                      <div className="text-[11px] font-bold text-[#FF453A]">23.4B</div>
                      <div className="text-[7px] text-[#F5F3EE]/45 uppercase">ACTIVE</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[#D9A84E]">8</div>
                      <div className="text-[7px] text-[#F5F3EE]/45 uppercase">PAGES</div>
                    </div>
                  </div>

                  {/* Lead Dispatch Card */}
                  <div className="rounded-xl p-3 bg-white/[0.045] border border-white/12 my-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#FF453A]/20 border border-[#FF453A]/45 font-mono text-[7.5px] font-bold tracking-wider text-[#FF453A]">
                        LEAD DISPATCH
                      </span>
                      <span className="font-mono text-[8px] text-[#F5F3EE]/50">arXiv:2611.26350</span>
                    </div>
                    <h1 className="font-serif font-bold text-[14.5px] leading-[1.2] text-[#F5F3EE]">
                      Beam MoE Architecture Unveils 501B Sparse Parameters for Agent Workloads
                    </h1>
                    <p className="text-[9.2px] leading-snug text-[#F5F3EE]/65 mt-1.5">
                      Activates 23.4B parameters per forward pass with sub-12ms lookahead expert routing.
                    </p>
                    <div className="mt-2.5">
                      <div className="flex justify-between font-mono text-[7.5px] text-[#F5F3EE]/50 mb-1">
                        <span>ACTIVE COMPUTE RATIO</span>
                        <span className="text-[#30D158] font-semibold">4.67%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#FF453A] to-[#D9A84E]" style={{ width: '24%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Cover CTA */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setFoldAngle(180);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF453A]/20 hover:bg-[#FF453A]/35 border border-[#FF453A]/50 font-mono text-[9px] font-bold tracking-wide text-[#F5F3EE] transition cursor-pointer shadow-[0_0_16px_rgba(255,69,58,0.28)]"
                    >
                      <span>Unfold Duo to Read All 8 Pages</span>
                      <span>→</span>
                    </button>
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 font-mono text-[8px] tracking-[0.12em] text-white/70">
                      4 SPREADS
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inner Left Mirror Surface */}
            <div className="duo-face duo-face-inner">
              <div className="duo-inner-screen-clip paper-surface" />
            </div>
          </div>

          {/* =================================================================
              RIGHT HALF: Rear Matte Panel on Outer Face, Inner Base Right on Inner Face
              ================================================================= */}
          <div className="duo-half duo-right-half">
            <div className="duo-edge-wall duo-edge-outer-right" />
            <div className="duo-edge-wall duo-edge-top" />
            <div className="duo-edge-wall duo-edge-bottom" />

            {/* Rear Panel with Camera Pill */}
            <div className="duo-face duo-face-outer">
              <div className="duo-rear-panel">
                <div className="duo-rear-camera-pill">
                  <div className="duo-rear-lens"><div className="duo-rear-lens-inner" /></div>
                  <div className="duo-rear-lens"><div className="duo-rear-lens-inner" /></div>
                  <div className="ml-auto mr-1 flex flex-col items-center gap-2">
                    <div className="w-2.5 h-1 rounded-full bg-white/25" />
                    <div className="w-3 h-3 rounded-full bg-amber-100/80" />
                  </div>
                </div>
              </div>
            </div>

            {/* Inner Right Mirror Surface */}
            <div className="duo-face duo-face-inner">
              <div className="duo-inner-screen-clip paper-surface" />
            </div>
          </div>

          {/* =================================================================
              TRUE 8-PAGE 3D PAPER-FLIPPING BROADSHEET ENGINE
              Activates seamlessly when foldAngle >= 155°
              Zero Crease: flush subpixel joint at x=334px with no dark gutter shadow
              ================================================================= */}
          <div
            id="newspaperBook"
            className={isBookActive ? 'active' : ''}
            aria-label="The Daily Circuit 8-Page Broadsheet"
          >
            {/* BASE PAGE 1 (Leftmost base page - always visible on Spread 01) */}
            <div className="book-base-page book-base-left paper-surface">
              <div className="news-pad">
                <div>
                  <div className="flex items-center justify-between font-mono text-[7.8px] uppercase tracking-widest pb-1 border-b-2 news-rule-strong" style={{ color: 'var(--paper-muted)' }}>
                    <span>EDITION #143 · VOL. XXIV</span>
                    <span>06:00 IST WIRE</span>
                    <span>PAGE 01</span>
                  </div>
                  <div className="text-center py-1 border-b news-rule">
                    <div className="font-serif font-extrabold text-[20px] leading-none tracking-tight">THE DAILY CIRCUIT</div>
                  </div>
                  <div className="mt-1.5 inline-block px-1.5 py-0.5 rounded font-mono text-[7.2px] font-bold uppercase tracking-wider text-white" style={{ background: 'var(--paper-accent)' }}>
                    LEAD DISPATCH · arXiv:2611.26350
                  </div>
                  <h2 className="font-serif font-bold text-[14.5px] leading-[1.15] mt-1">
                    Beam MoE Unveils 501B Sparse Parameters for Agent Workloads
                  </h2>
                  <p className="text-[8.5px] leading-[1.35] mt-1" style={{ color: 'var(--paper-muted)' }}>
                    Reflection Team activates just 23.4B parameters per pass, cutting multi-step tool latency 3.4× with sub-12ms lookahead routing.
                  </p>
                </div>

                <div className="my-1 rounded-md overflow-hidden border news-rule relative" style={{ height: 56, background: '#121214' }}>
                  <canvas ref={canvasRef} className="w-full h-full block" width={298} height={56} />
                  <span className="absolute bottom-1 left-1.5 font-mono text-[6.5px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/75 text-white/85 pointer-events-none">
                    FIG 1. LIVING INK · SPARSE ROUTING TOPOLOGY
                  </span>
                </div>

                <div className="news-card p-2">
                  <div className="font-mono text-[7.2px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--paper-gold)' }}>
                    60-SECOND BRIEF
                  </div>
                  <ul className="space-y-0.5 text-[8px] leading-snug">
                    <li>• <strong>Beam-501B</strong> hits 84.6% SWE-Bench at 4.67% active compute.</li>
                    <li>• <strong>beam-moe/sparse-router</strong> surges +2,190★ in 24 hours.</li>
                    <li>• <strong>Apple M5 Max</strong> pushes 820 GB/s unified memory bandwidth.</li>
                  </ul>
                </div>

                <div className="pt-1 border-t news-rule flex justify-between font-mono text-[7.2px]" style={{ color: 'var(--paper-muted)' }}>
                  <span>96.8% SIGNAL RATIO</span>
                  <span className="text-[#D63B24] font-semibold cursor-pointer" onClick={() => goToSpread(1)}>CLICK RIGHT DOG-EAR →</span>
                </div>
              </div>
            </div>

            {/* BASE PAGE 8 (Rightmost base page - visible on Spread 04) */}
            <div className="book-base-page book-base-right paper-surface">
              <div className="news-pad">
                <div>
                  <div className="flex items-center justify-between font-mono text-[7.8px] uppercase tracking-widest pb-1 border-b news-rule" style={{ color: 'var(--paper-muted)' }}>
                    <span>BACK PAGE RITUAL</span>
                    <span>PAGE 08 / 08</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 mb-1.5">
                    <h2 className="font-serif font-bold text-[15px] leading-tight">Architecture Check</h2>
                    <span className="font-mono text-[8px] font-bold px-2 py-0.5 rounded-full border news-rule" style={{ color: 'var(--paper-gold)' }}>
                      SCORE: {(quizScore[0] !== null && quizScore[1] !== null) ? `${(quizScore[0] ? 1 : 0) + (quizScore[1] ? 1 : 0)}/2` : '0/2'}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-2">
                    <div className="news-card p-2">
                      <div className="text-[8px] font-semibold mb-1">1. How many parameters activate per pass in Beam MoE 501B?</div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => setQuizScore([false, quizScore[1]])}
                          className={`quiz-opt-btn ${quizScore[0] === false ? 'wrong' : ''}`}
                        >
                          A. 250B
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQuizScore([true, quizScore[1]]);
                            playSound('click');
                          }}
                          className={`quiz-opt-btn ${quizScore[0] === true ? 'correct' : ''}`}
                        >
                          B. 23.4B
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuizScore([false, quizScore[1]])}
                          className={`quiz-opt-btn ${quizScore[0] === false ? 'wrong' : ''}`}
                        >
                          C. 501B
                        </button>
                      </div>
                    </div>

                    <div className="news-card p-2">
                      <div className="text-[8px] font-semibold mb-1">2. What cuts 128k context VRAM usage by 72% in SparseKV?</div>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setQuizScore([quizScore[0], true]);
                            playSound('click');
                          }}
                          className={`quiz-opt-btn ${quizScore[1] === true ? 'correct' : ''}`}
                        >
                          A. Attention-sink eviction
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuizScore([quizScore[0], false])}
                          className={`quiz-opt-btn ${quizScore[1] === false ? 'wrong' : ''}`}
                        >
                          B. Dropping layers
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={handleStamp}
                      className="w-full py-2 px-3 rounded-lg font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-white transition active:scale-95 cursor-pointer shadow-md"
                      style={{ background: 'var(--paper-accent)' }}
                    >
                      STAMP EDITION COMPLETE
                    </button>
                    <div className={`ink-stamp ${isStamped ? 'stamped' : ''}`}>
                      EDITION #143 COMPLETE — GO BUILD
                    </div>
                  </div>
                </div>

                <div className="pt-1.5 border-t news-rule flex items-center justify-between font-mono text-[7.5px]">
                  <span style={{ color: 'var(--paper-muted)' }}>NEXT 06:00 IST PRESS</span>
                  <strong className="tabular-nums">{istCountdown}</strong>
                </div>
              </div>
            </div>

            {/* SHEET 2 (Index 2): Front = Page 6 (Weekend Blueprint), Back = Page 7 (Audit Desk) */}
            <div
              className="paper-sheet"
              style={{
                transform: `rotateY(${leafAngles[2]}deg)`,
                zIndex: leafAngles[2] < -90 ? 12 : 30,
              }}
              onPointerDown={(e) => handlePointerDown(e, 2)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* PAGE 06 (Front) */}
              <div className="sheet-face sheet-front paper-surface">
                <div className="news-pad">
                  <div>
                    <div className="flex items-center justify-between font-mono text-[7.8px] uppercase tracking-widest pb-1 border-b news-rule" style={{ color: 'var(--paper-muted)' }}>
                      <span>WEEKEND BUILD BLUEPRINT</span>
                      <span>PAGE 06</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1 mb-1">
                      <h2 className="font-serif font-bold text-[14.5px] leading-tight">Local MoE Router in Python</h2>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-2 py-0.5 rounded font-mono text-[7.5px] font-bold uppercase tracking-wider border news-rule hover:border-[#D63B24] transition cursor-pointer"
                        style={{ background: 'var(--paper-card)', color: 'var(--paper-ink)' }}
                      >
                        {codeCopied ? 'Copied ✓' : 'Copy Code'}
                      </button>
                    </div>
                    <p className="text-[7.8px] leading-snug mb-1" style={{ color: 'var(--paper-muted)' }}>
                      Sub-12ms PyTorch top-k gating with softmax weight renormalization:
                    </p>
                    <div className="code-block-mini">
                      {MOE_PYTHON_SNIPPET}
                    </div>
                  </div>
                  <div className="pt-1 border-t news-rule flex justify-between font-mono text-[7.2px]" style={{ color: 'var(--paper-muted)' }}>
                    <span>PYTORCH 2.5 · CUDA READY</span>
                    <span className="text-[#D63B24] font-semibold cursor-pointer" onClick={() => goToSpread(3)}>FLIP → P7–8</span>
                  </div>
                </div>
              </div>

              {/* PAGE 07 (Back) */}
              <div className="sheet-face sheet-back paper-surface">
                <div className="news-pad">
                  <div>
                    <div className="flex items-center justify-between font-mono text-[7.8px] uppercase tracking-widest pb-1 border-b news-rule" style={{ color: 'var(--paper-muted)' }}>
                      <span>EDITORIAL EVIDENCE AUDIT</span>
                      <span>PAGE 07</span>
                    </div>
                    <h2 className="font-serif font-bold text-[15px] mt-1 mb-1.5">96.8% Verified Signal</h2>
                    <div className="news-card p-2 mb-2 font-mono text-[7.8px] space-y-1">
                      <div className="flex justify-between"><span>24h Items Ingested</span><strong>1,420</strong></div>
                      <div className="flex justify-between"><span>Engagement Bait Dropped</span><strong style={{ color: 'var(--paper-accent)' }}>-1,374</strong></div>
                      <div className="flex justify-between border-t news-rule pt-0.5"><span>Verified Edition #143</span><strong style={{ color: 'var(--paper-green)' }}>46 (96.8% Signal)</strong></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="news-card p-2">
                        <div className="font-mono text-[7px] font-bold uppercase tracking-wider" style={{ color: 'var(--paper-accent)' }}>✕ HYPE DEBUNKED</div>
                        <p className="text-[7.8px] mt-0.5 leading-snug" style={{ color: 'var(--paper-muted)' }}>
                          Viral "1-bit 100B model on a smartwatch" used a hidden cloud proxy—weights were never released.
                        </p>
                      </div>
                      <div className="news-card p-2">
                        <div className="font-mono text-[7px] font-bold uppercase tracking-wider" style={{ color: 'var(--paper-green)' }}>✓ VERIFIED BREAKTHROUGH</div>
                        <p className="text-[7.8px] mt-0.5 leading-snug" style={{ color: 'var(--paper-muted)' }}>
                          Beam MoE 501B lookahead routing reproduced across 3 labs within 0.4% of paper latency.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 border-t news-rule flex justify-between font-mono text-[7.2px]" style={{ color: 'var(--paper-muted)' }}>
                    <span>FINITE BY DESIGN</span>
                    <span className="cursor-pointer" onClick={() => goToSpread(2)}>← P5–6</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SHEET 1 (Index 1): Front = Page 4 (ArXiv), Back = Page 5 (Silicon) */}
            <div
              className="paper-sheet"
              style={{
                transform: `rotateY(${leafAngles[1]}deg)`,
                zIndex: leafAngles[1] < -90 ? 11 : 20,
              }}
              onPointerDown={(e) => handlePointerDown(e, 1)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* PAGE 04 (Front) */}
              <div className="sheet-face sheet-front paper-surface">
                <div className="news-pad">
                  <div>
                    <div className="flex items-center justify-between font-mono text-[7.8px] uppercase tracking-widest pb-1 border-b news-rule" style={{ color: 'var(--paper-muted)' }}>
                      <span>ARXIV RESEARCH DESK</span>
                      <span>PAGE 04</span>
                    </div>
                    <h2 className="font-serif font-bold text-[15.5px] mt-1 mb-1.5">3 Distilled Frontier Papers</h2>
                    <div className="space-y-1.5">
                      <article className="news-card p-1.5">
                        <div className="flex justify-between font-mono text-[7.2px]">
                          <span className="font-bold" style={{ color: 'var(--paper-accent)' }}>arXiv:2611.26350</span>
                          <span style={{ color: 'var(--paper-green)' }} className="font-bold">-62% FLOPs</span>
                        </div>
                        <h3 className="font-serif font-bold text-[10.5px] leading-snug mt-0.5">Beam MoE: Lookahead Prefetching</h3>
                        <p className="text-[7.6px] mt-0.5 leading-snug" style={{ color: 'var(--paper-muted)' }}>
                          Prefetches next-layer experts across PCIe while current blocks execute.
                        </p>
                      </article>

                      <article className="news-card p-1.5">
                        <div className="flex justify-between font-mono text-[7.2px]">
                          <span className="font-bold" style={{ color: 'var(--paper-gold)' }}>arXiv:2611.08421</span>
                          <span style={{ color: 'var(--paper-green)' }} className="font-bold">72% KV Cut</span>
                        </div>
                        <h3 className="font-serif font-bold text-[10.5px] leading-snug mt-0.5">SparseKV: Attention-Sink Eviction</h3>
                        <p className="text-[7.6px] mt-0.5 leading-snug" style={{ color: 'var(--paper-muted)' }}>
                          Lets 128k monorepos fit inside 8GB VRAM with under 0.3% perplexity drift.
                        </p>
                      </article>

                      <article className="news-card p-1.5">
                        <div className="flex justify-between font-mono text-[7.2px]">
                          <span className="font-bold" style={{ color: '#0284C7' }}>arXiv:2611.19044</span>
                          <span style={{ color: 'var(--paper-green)' }} className="font-bold">3.1× Decode</span>
                        </div>
                        <h3 className="font-serif font-bold text-[10.5px] leading-snug mt-0.5">Tree-Attention Speculative Drafting</h3>
                        <p className="text-[7.6px] mt-0.5 leading-snug" style={{ color: 'var(--paper-muted)' }}>
                          Verifies 6-token draft trees in one pass with exact mathematical equivalence.
                        </p>
                      </article>
                    </div>
                  </div>
                  <div className="pt-1 border-t news-rule flex justify-between font-mono text-[7.2px]" style={{ color: 'var(--paper-muted)' }}>
                    <span>PEER-REVIEWED CODE</span>
                    <span className="text-[#D63B24] font-semibold cursor-pointer" onClick={() => goToSpread(2)}>FLIP → PAGE 5</span>
                  </div>
                </div>
              </div>

              {/* PAGE 05 (Back) */}
              <div className="sheet-face sheet-back paper-surface">
                <div className="news-pad">
                  <div>
                    <div className="flex items-center justify-between font-mono text-[7.8px] uppercase tracking-widest pb-1 border-b news-rule" style={{ color: 'var(--paper-muted)' }}>
                      <span>SILICON &amp; SYSTEMS WATCH</span>
                      <span>PAGE 05</span>
                    </div>
                    <h2 className="font-serif font-bold text-[15.5px] mt-1 mb-1.5">Hardware &amp; Quantization</h2>
                    <div className="space-y-1.5">
                      <div className="news-card p-2">
                        <div className="flex justify-between font-mono text-[7.6px]">
                          <span className="font-bold" style={{ color: 'var(--paper-accent)' }}>NVIDIA BLACKWELL ULTRA</span>
                          <span>288GB HBM3e</span>
                        </div>
                        <p className="text-[7.8px] mt-0.5 leading-snug" style={{ color: 'var(--paper-muted)' }}>
                          Native FP4 tensor cores double sparse MoE token throughput per rack.
                        </p>
                      </div>

                      <div className="news-card p-2">
                        <div className="flex justify-between font-mono text-[7.6px]">
                          <span className="font-bold" style={{ color: 'var(--paper-gold)' }}>APPLE M5 MAX UNIFIED</span>
                          <span>820 GB/s BW</span>
                        </div>
                        <p className="text-[7.8px] mt-0.5 leading-snug" style={{ color: 'var(--paper-muted)' }}>
                          128GB unified pool runs 23.4B-active MoE models at 51 tok/s silently on battery.
                        </p>
                      </div>

                      <div className="news-card p-2 font-mono text-[7.6px] space-y-1">
                        <div className="text-[7px] font-bold uppercase tracking-wider" style={{ color: 'var(--paper-muted)' }}>LOCAL QUANTIZATION BENCHMARKS</div>
                        <div className="flex justify-between"><span>FP8 (Baseline)</span><strong>100.0% Acc · 38 tok/s</strong></div>
                        <div className="flex justify-between"><span>Q4_K_M (4-Bit)</span><strong style={{ color: 'var(--paper-green)' }}>99.4% Acc · 54 tok/s</strong></div>
                        <div className="flex justify-between"><span>IQ2_XS (2-Bit)</span><strong style={{ color: 'var(--paper-accent)' }}>91.2% Acc · 76 tok/s</strong></div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 border-t news-rule flex justify-between font-mono text-[7.2px]" style={{ color: 'var(--paper-muted)' }}>
                    <span>SYSTEMS TELEMETRY</span>
                    <span className="cursor-pointer" onClick={() => goToSpread(1)}>← P3–4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SHEET 0 (Index 0): Front = Page 2 (Models), Back = Page 3 (GitHub) */}
            <div
              className="paper-sheet"
              style={{
                transform: `rotateY(${leafAngles[0]}deg)`,
                zIndex: leafAngles[0] < -90 ? 10 : 15,
              }}
              onPointerDown={(e) => handlePointerDown(e, 0)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* PAGE 02 (Front) */}
              <div className="sheet-face sheet-front paper-surface">
                <div className="news-pad">
                  <div>
                    <div className="flex items-center justify-between font-mono text-[7.8px] uppercase tracking-widest pb-1 border-b news-rule" style={{ color: 'var(--paper-muted)' }}>
                      <span>MODEL LEADERBOARDS</span>
                      <span>PAGE 02</span>
                    </div>
                    <h2 className="font-serif font-bold text-[15.5px] mt-1 mb-1.5">Verified Benchmark Deltas</h2>

                    <div className="space-y-1.5">
                      <div className="news-card p-1.5">
                        <div className="flex justify-between items-center font-mono text-[8px]">
                          <strong className="font-serif text-[11px]">Beam-501B-MoE</strong>
                          <span style={{ color: 'var(--paper-green)' }} className="font-bold">84.6% (+2.2%)</span>
                        </div>
                        <div className="h-1 rounded-full bg-black/10 overflow-hidden mt-1">
                          <div className="h-full rounded-full" style={{ width: '84.6%', background: 'var(--paper-accent)' }} />
                        </div>
                        <p className="text-[7.5px] mt-0.5" style={{ color: 'var(--paper-muted)' }}>SWE-Bench Verified · 23.4B active / 501B sparse.</p>
                      </div>

                      <div className="news-card p-1.5">
                        <div className="flex justify-between items-center font-mono text-[8px]">
                          <strong className="font-serif text-[11px]">Claude 4.5</strong>
                          <span style={{ color: 'var(--paper-green)' }} className="font-bold">82.4% (+1.8%)</span>
                        </div>
                        <div className="h-1 rounded-full bg-black/10 overflow-hidden mt-1">
                          <div className="h-full rounded-full" style={{ width: '82.4%', background: 'var(--paper-gold)' }} />
                        </div>
                        <p className="text-[7.5px] mt-0.5" style={{ color: 'var(--paper-muted)' }}>Lowest multi-file patch regression across Rust &amp; TS.</p>
                      </div>

                      <div className="news-card p-1.5">
                        <div className="flex justify-between items-center font-mono text-[8px]">
                          <strong className="font-serif text-[11px]">Gemini 3 Pro</strong>
                          <span style={{ color: 'var(--paper-green)' }} className="font-bold">86.2% (+3.1%)</span>
                        </div>
                        <div className="h-1 rounded-full bg-black/10 overflow-hidden mt-1">
                          <div className="h-full rounded-full" style={{ width: '86.2%', background: '#0284C7' }} />
                        </div>
                        <p className="text-[7.5px] mt-0.5" style={{ color: 'var(--paper-muted)' }}>GPQA Diamond leader · 1M native context.</p>
                      </div>

                      <div className="news-card p-1.5">
                        <div className="flex justify-between items-center font-mono text-[8px]">
                          <strong className="font-serif text-[11px]">DeepSeek-R2</strong>
                          <span style={{ color: 'var(--paper-green)' }} className="font-bold">79.8% (+4.6%)</span>
                        </div>
                        <div className="h-1 rounded-full bg-black/10 overflow-hidden mt-1">
                          <div className="h-full rounded-full" style={{ width: '79.8%', background: 'var(--paper-green)' }} />
                        </div>
                        <p className="text-[7.5px] mt-0.5" style={{ color: 'var(--paper-muted)' }}>Open weights (MIT) · Best cost-per-verified patch locally.</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 border-t news-rule flex justify-between font-mono text-[7.2px]" style={{ color: 'var(--paper-muted)' }}>
                    <span>CONTAMINATION AUDITED</span>
                    <span className="text-[#D63B24] font-semibold cursor-pointer" onClick={() => goToSpread(1)}>FLIP → PAGE 3</span>
                  </div>
                </div>
              </div>

              {/* PAGE 03 (Back) */}
              <div className="sheet-face sheet-back paper-surface">
                <div className="news-pad">
                  <div>
                    <div className="flex items-center justify-between font-mono text-[7.8px] uppercase tracking-widest pb-1 border-b news-rule" style={{ color: 'var(--paper-muted)' }}>
                      <span>24H GITHUB VELOCITY</span>
                      <span>PAGE 03</span>
                    </div>
                    <h2 className="font-serif font-bold text-[15.5px] mt-1 mb-1.5">Trending Engineering Repos</h2>
                    <div className="space-y-1.5">
                      <div className="news-card p-1.5">
                        <div className="flex justify-between items-center font-mono text-[8.5px] font-bold">
                          <span>beam-moe/sparse-router</span>
                          <span style={{ color: 'var(--paper-green)' }}>★ +2,190</span>
                        </div>
                        <div className="font-mono text-[6.8px] uppercase tracking-wider" style={{ color: 'var(--paper-gold)' }}>CUDA · TRITON · C++20</div>
                        <p className="text-[7.6px] mt-0.5 leading-snug" style={{ color: 'var(--paper-muted)' }}>Fused top-k expert dispatch kernel eliminating PCIe stalls.</p>
                      </div>

                      <div className="news-card p-1.5">
                        <div className="flex justify-between items-center font-mono text-[8.5px] font-bold">
                          <span>vllm-project/vllm-flash</span>
                          <span style={{ color: 'var(--paper-green)' }}>★ +1,840</span>
                        </div>
                        <div className="font-mono text-[6.8px] uppercase tracking-wider" style={{ color: 'var(--paper-gold)' }}>PYTHON · CUDA · METAL</div>
                        <p className="text-[7.6px] mt-0.5 leading-snug" style={{ color: 'var(--paper-muted)' }}>Speculative tree-attention sustaining 48 tok/s on 24GB laptops.</p>
                      </div>

                      <div className="news-card p-1.5">
                        <div className="flex justify-between items-center font-mono text-[8.5px] font-bold">
                          <span>zero-dep/tiny-vector</span>
                          <span style={{ color: 'var(--paper-green)' }}>★ +920</span>
                        </div>
                        <div className="font-mono text-[6.8px] uppercase tracking-wider" style={{ color: 'var(--paper-gold)' }}>RUST · WASM</div>
                        <p className="text-[7.6px] mt-0.5 leading-snug" style={{ color: 'var(--paper-muted)' }}>Sub-45KB gzipped vector index for instant semantic search.</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 border-t news-rule flex justify-between font-mono text-[7.2px]" style={{ color: 'var(--paper-muted)' }}>
                    <span>+5,660 STARS / 24H</span>
                    <span className="cursor-pointer" onClick={() => goToSpread(0)}>← P1–2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Peeling Corner Dog-Ears for Easy Click Flips */}
            <div
              className={`dog-ear dog-ear-left ${currentSpread > 0 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
              onClick={() => goToSpread(currentSpread - 1)}
              title="Flip Backward (←)"
            >
              <span className="font-mono text-[11px] font-bold text-[#D63B24] pl-2.5 pb-2">←</span>
            </div>

            <div
              className={`dog-ear dog-ear-right ${currentSpread < 3 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
              onClick={() => goToSpread(currentSpread + 1)}
              title="Flip Forward (→)"
            >
              <span className="font-mono text-[11px] font-bold text-[#D63B24] pr-2.5 pb-2">→</span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================
          FLOATING BOTTOM TAHOE LIQUID GLASS HUD
          ================================================================= */}
      <aside className="tahoe-hud" aria-label="iPhone Duo Controls">
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setFoldAngle((a) => (a >= 90 ? 0 : 180));
          }}
          className="hud-btn primary"
        >
          {foldAngle >= 90 ? 'Fold Duo' : 'Unfold Duo'}
        </button>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="180"
            step="1"
            value={foldAngle}
            onPointerDown={() => setIsManualScrub(true)}
            onPointerUp={() => setIsManualScrub(false)}
            onChange={(e) => {
              setIsManualScrub(true);
              setFoldAngle(Number(e.target.value));
            }}
            aria-label="Fold Angle Scrubber"
            className="hud-slider w-16 sm:w-20"
          />
          <span className="font-mono text-[10.5px] font-semibold tabular-nums text-[#F5F3EE]/90 whitespace-nowrap min-w-[32px]">
            {foldAngle}°
          </span>
        </div>

        <div className="w-px h-4 bg-white/15 shrink-0" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goToSpread(currentSpread - 1)}
            disabled={currentSpread <= 0}
            className="hud-btn"
            title="Previous Spread (←)"
          >
            ←
          </button>

          <div className="inline-flex items-center gap-1 px-1">
            {['P1–2', 'P3–4', 'P5–6', 'P7–8'].map((label, idx) => (
              <button
                key={label}
                type="button"
                onClick={() => goToSpread(idx)}
                className={`spread-pill ${currentSpread === idx ? 'active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goToSpread(currentSpread + 1)}
            disabled={currentSpread >= 3}
            className="hud-btn"
            title="Next Spread (→)"
          >
            →
          </button>
        </div>
      </aside>

      {/* =================================================================
          INKY PRESS-BOT COMPANION (Bottom Right)
          ================================================================= */}
      <div className="duo-inky-wrap">
        <div
          className={`duo-inky-bubble ${showInkyBubble ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
          role="status"
        >
          {inkyMessage}
        </div>

        <button
          ref={inkyBtnRef}
          type="button"
          onClick={() => {
            playSound('click');
            setShowInkyBubble((v) => !v);
          }}
          className="duo-inky-btn"
          aria-label="Inky Editorial Bot"
        >
          <svg viewBox="0 0 60 60" className="w-9 h-9">
            <rect x="8" y="10" width="44" height="40" rx="14" fill="#151412" stroke="#484A52" strokeWidth="2" />
            <circle cx="24" cy="30" r="6" fill="#F5F3EE" />
            <circle cx="36" cy="30" r="6" fill="#F5F3EE" />
            <circle ref={inkyPupilLRef} cx="24" cy="30" r="2.8" fill="#151412" />
            <circle ref={inkyPupilRRef} cx="36" cy="30" r="2.8" fill="#151412" />
            <path d="M 23 41 Q 30 46 37 41" stroke="#F5F3EE" strokeWidth="2" strokeLinecap="round" fill="none" />
            <line x1="30" y1="2" x2="30" y2="10" stroke="#FF453A" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="30" cy="3" r="2.5" fill="#FF453A" />
          </svg>
        </button>
      </div>
    </div>
  );
}
