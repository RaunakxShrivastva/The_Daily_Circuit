import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Zap,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  GitBranch,
  AlertTriangle,
  Award,
  Binary
} from 'lucide-react';
import confetti from 'canvas-confetti';
import '../styles/iphone-duo.css';

interface IPhoneDuoStageProps {
  scrollProgress: number; // 0..1 from the scroll runway
  controlledSpread?: number;
  onSpreadChange?: (spread: number) => void;
}

const TOTAL_SPREADS = 4;

export function IPhoneDuoStage({
  scrollProgress,
  controlledSpread,
  onSpreadChange,
}: IPhoneDuoStageProps) {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [animatingDir, setAnimatingDir] = useState<'next' | 'prev' | null>(null);
  const [baseScale, setBaseScale] = useState(1.45);
  const [isStamped, setIsStamped] = useState(false);
  const [puzzleAnswered, setPuzzleAnswered] = useState<number | null>(null);

  // Responsive scaling to fit viewport cleanly without overflow
  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const availW = w - 64;
      const availH = h - 140;
      const s = Math.max(0.68, Math.min(availW / 580, availH / 400, 1.72));
      setBaseScale(s);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Web Audio mechanical page flip sound
  const playFlipSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (_) {}
  };

  // Stamp ritual confetti on page 8
  const handleStamp = () => {
    if (isStamped) return;
    setIsStamped(true);
    playFlipSound();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#c83e2b', '#111111', '#e5ded0']
    });
  };

  // 3D Kinematics calculations from scroll progress
  // Phase 1 (0%..24%): iPhone Duo unrolls from 0° (folded) -> 180° (unfolded)
  // Phase 2 (24%..92%): Broadsheet spreads 0..3 flip as user continues scrolling
  // Phase 3 (92%..100%): Broadsheet complete; scroll flows down into MacBook
  const { openAngle, leftRotY, centerShiftX, camRotY, camRotX, activeSpread } = useMemo(() => {
    const p = Math.max(0, Math.min(1, scrollProgress));
    
    let angle = 0;
    let sIdx = 0;

    if (p < 0.22) {
      // Unfolding interpolation
      const t = p / 0.22;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      angle = eased * 180;
      sIdx = 0;
    } else {
      // Fully open at 180°
      angle = 180;
      // Map remaining scroll 0.22..0.92 onto spreads 0, 1, 2, 3
      const pRead = Math.max(0, Math.min(1, (p - 0.22) / 0.70));
      sIdx = Math.min(3, Math.floor(pRead * 4));
    }

    const lRotY = 178 - (angle / 180) * 178;
    const cShiftX = -134 + (angle / 180) * 134;

    // Slight natural 3/4 camera tilt when closed, aligning straight on as it opens
    const tCam = Math.min(1, p / 0.22);
    const cRotY = -15 * (1 - tCam);
    const cRotX = 3 * (1 - tCam);

    return {
      openAngle: angle,
      leftRotY: lRotY,
      centerShiftX: cShiftX,
      camRotY: cRotY,
      camRotX: cRotX,
      activeSpread: sIdx
    };
  }, [scrollProgress]);

  // Sync scroll-driven spread with page turn animation
  useEffect(() => {
    const target = controlledSpread !== undefined ? controlledSpread : activeSpread;
    if (target !== currentSpread && !animatingDir && openAngle >= 170) {
      const dir = target > currentSpread ? 'next' : 'prev';
      setAnimatingDir(dir);
      playFlipSound();
      setTimeout(() => {
        setCurrentSpread(target);
        onSpreadChange?.(target);
        setAnimatingDir(null);
      }, 420);
    }
  }, [activeSpread, controlledSpread, currentSpread, animatingDir, openAngle, onSpreadChange]);

  const turnSpread = (dir: 'next' | 'prev') => {
    if (animatingDir) return;
    if (dir === 'next' && currentSpread < TOTAL_SPREADS - 1) {
      setAnimatingDir('next');
      playFlipSound();
      const nxt = currentSpread + 1;
      setTimeout(() => {
        setCurrentSpread(nxt);
        onSpreadChange?.(nxt);
        setAnimatingDir(null);
      }, 420);
    } else if (dir === 'prev' && currentSpread > 0) {
      setAnimatingDir('prev');
      playFlipSound();
      const prv = currentSpread - 1;
      setTimeout(() => {
        setCurrentSpread(prv);
        onSpreadChange?.(prv);
        setAnimatingDir(null);
      }, 420);
    }
  };

  const creaseOpacity = openAngle > 10 && openAngle < 170
    ? Math.sin((openAngle / 180) * Math.PI) * 0.75
    : 0;

  return (
    <div className="duo-root-theme relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden">
      
      {/* 3D Hardware Stage */}
      <div className="duo-viewport-3d">
        <div
          className="duo-stage-scaler"
          style={{
            transform: `scale(${baseScale.toFixed(4)})`,
          }}
        >
          {/* Soft floor shadow under the phone */}
          <div
            className="duo-floor-shadow"
            style={{
              transform: `translateX(-50%) scaleX(${0.65 + (openAngle / 180) * 0.65})`,
              opacity: 0.85,
            }}
          />

          {/* 536px x 346px iPhone Duo 3D Assembly */}
          <div
            className="duo-assembly"
            style={{
              transform: `rotateX(${camRotX.toFixed(2)}deg) rotateY(${camRotY.toFixed(2)}deg) translateX(${centerShiftX.toFixed(2)}px)`,
            }}
          >
            {/* Central Grade 5 Titanium Micro-Hinge Spine */}
            <div className="duo-hinge-spine" />

            {/* =========================================================
                LEFT HALF (pivots around right edge at x = 268px)
                - Outer Face (-Z, rotY 180): THE DAILY CIRCUIT COVER DISPLAY
                - Inner Face (+Z): LEFT PAGE OF BROADSHEET
                ========================================================= */}
            <div
              className="duo-half duo-left-half"
              style={{
                transform: `rotateY(${leftRotY.toFixed(2)}deg)`,
              }}
            >
              {/* Outer Titanium Rails & Physical Controls */}
              <div className="duo-edge-wall duo-edge-outer-left">
                <div className="duo-antenna-line" style={{ top: 26 }} />
                <div className="duo-side-power-btn" />
                <div className="duo-antenna-line" style={{ bottom: 26 }} />
              </div>
              <div className="duo-edge-wall duo-edge-top" />
              <div className="duo-edge-wall duo-edge-bottom">
                <div className="duo-spk-dots"><span /><span /><span /></div>
                <div className="duo-usb-c" />
                <div className="duo-spk-dots"><span /><span /><span /></div>
              </div>

              {/* -------------------------------------------------------
                  OUTER COVER DISPLAY (Visible when phone is folded at 0°)
                  Features The Daily Circuit Masthead & Breaking Lead Story
                  ------------------------------------------------------- */}
              <div className="duo-face duo-face-outer">
                <div className="duo-cover-bezel">
                  <div className="duo-cover-screen p-3.5 flex flex-col justify-between text-neutral-100 font-sans">
                    
                    {/* Top Status & Punch Hole */}
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[8.5px] font-mono tracking-wider text-emerald-400 uppercase font-bold">
                          06:00 IST · WIRE
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8.5px] font-mono text-neutral-400">96.8% SIGNAL</span>
                        <div className="duo-punch-hole" />
                      </div>
                    </div>

                    {/* The Daily Circuit Editorial Cover Masthead */}
                    <div className="text-center py-1.5 border-b border-neutral-700/80">
                      <div className="text-[7.5px] font-mono tracking-widest text-neutral-400 uppercase">
                        VOL. XXIV · NO. 842 · EDITION #143
                      </div>
                      <h1 className="text-[20px] font-serif font-black tracking-tight text-white leading-tight mt-0.5">
                        THE DAILY CIRCUIT
                      </h1>
                      <div className="text-[7px] font-mono uppercase text-amber-300 tracking-wider font-semibold">
                        24H Physical & Digital Intelligence Broadsheet
                      </div>
                    </div>

                    {/* Breaking Lead Headline Dispatch */}
                    <div className="bg-neutral-900/90 border border-white/10 rounded-lg p-2.5 shadow-lg space-y-1 my-auto">
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.5 rounded bg-red-600/30 border border-red-500/40 text-[7px] font-mono uppercase font-black text-red-400">
                          LEAD DISPATCH
                        </span>
                        <span className="text-[7.5px] font-mono text-neutral-400">arXiv:2611.26350</span>
                      </div>
                      <h2 className="text-[11px] font-serif font-bold text-neutral-100 leading-snug">
                        Beam MoE Architecture Unveils 501B Sparse Parameters for Agent Workloads
                      </h2>
                      <p className="text-[8.5px] font-sans text-neutral-400 leading-tight line-clamp-2">
                        Reflection Team publishes frontier architecture activating 23.4B active parameters per forward pass, scaling reasoning passes without VRAM spikes.
                      </p>
                    </div>

                    {/* Scroll to Unfold Instruction Cue */}
                    <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[8px] font-mono text-neutral-400">
                      <span className="flex items-center gap-1 text-amber-300 font-semibold animate-pulse">
                        <span>↓ Scroll to unfold Duo</span>
                      </span>
                      <span>PAGES 1-8 INSIDE</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------
                  INNER LEFT PANEL (+Z face)
                  Displays the LEFT page of current spread (P1, P3, P5, P7)
                  ------------------------------------------------------- */}
              <div className="duo-face duo-face-inner">
                <div className="absolute inset-1 rounded-l-[36px] bg-[#f5f0e6] text-neutral-900 overflow-hidden p-3.5 flex flex-col justify-between font-sans shadow-inner border-r border-[#d4cbba]">
                  
                  {/* Top Folio Header */}
                  <div className="flex justify-between items-baseline border-b border-neutral-900 pb-1 text-[8px] font-mono tracking-widest text-neutral-600 uppercase">
                    <span>THE DAILY CIRCUIT</span>
                    <span className="font-bold text-neutral-900">
                      PAGE 0{currentSpread * 2 + 1}
                    </span>
                  </div>

                  {/* LEFT PAGE DYNAMIC CONTENT */}
                  <div className="flex-1 overflow-hidden py-1 space-y-1.5 flex flex-col justify-between">
                    {currentSpread === 0 && (
                      <>
                        <div className="border-b border-neutral-300 pb-1">
                          <div className="text-[7px] font-mono text-red-700 font-bold uppercase tracking-wider">
                            FRONT WIRE · EXCLUSIVE
                          </div>
                          <h3 className="text-[12px] font-serif font-black leading-tight text-neutral-950 mt-0.5">
                            Beam MoE: 501B Parameters for Autonomous Agent Workloads
                          </h3>
                        </div>
                        <div className="rounded border border-neutral-900/30 overflow-hidden bg-[#e8e0d0] h-[78px] relative">
                          <img
                            src="/photos/lead.jpg"
                            alt="Lead Wire"
                            className="w-full h-full object-cover filter contrast-[1.08] grayscale-[0.2]"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-neutral-900/80 text-white text-[6.5px] font-mono px-1 py-0.5 truncate">
                            Fig 1.0 · Reflection 501B sparse routing matrix
                          </div>
                        </div>
                        <p className="text-[8px] leading-relaxed text-neutral-700 font-serif line-clamp-3">
                          The Reflection Team has released the technical report for Beam, a 501.3B parameter sparse MoE model activating just 23.4B active parameters per forward pass, providing high-bandwidth memory topologies for zero-slop agent workloads.
                        </p>
                        <div className="bg-[#ede6d8] p-1.5 rounded border border-neutral-300 text-[7px] font-mono space-y-0.5">
                          <div className="font-bold text-neutral-900 uppercase">⚡ 60-Second Brief</div>
                          <div className="text-neutral-700">· 501.3B sparse parameters running on 23.4B active compute</div>
                          <div className="text-neutral-700">· AMD EPYC Zen 6 demonstrates 12.1x speedup</div>
                        </div>
                      </>
                    )}

                    {currentSpread === 1 && (
                      <>
                        <div className="border-b border-neutral-300 pb-1">
                          <div className="text-[7px] font-mono text-red-700 font-bold uppercase tracking-wider">
                            POST-MORTEM & ACCURACY
                          </div>
                          <h3 className="text-[12px] font-serif font-black leading-tight text-neutral-950 mt-0.5">
                            Frontier Benchmark Duel: SWE-Bench Verified
                          </h3>
                        </div>
                        <div className="space-y-1.5 text-[7.5px] font-mono">
                          <div className="p-1.5 rounded bg-[#ede6d8] border border-neutral-300">
                            <div className="flex justify-between font-bold text-neutral-900">
                              <span>Claude 3.7 Sonnet (Hybrid)</span>
                              <span className="text-emerald-700">70.3%</span>
                            </div>
                            <div className="w-full bg-neutral-300 h-1.5 rounded-full overflow-hidden mt-1">
                              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '70.3%' }} />
                            </div>
                          </div>
                          <div className="p-1.5 rounded bg-[#ede6d8] border border-neutral-300">
                            <div className="flex justify-between font-bold text-neutral-900">
                              <span>OpenAI o3-mini (High)</span>
                              <span className="text-blue-700">68.1%</span>
                            </div>
                            <div className="w-full bg-neutral-300 h-1.5 rounded-full overflow-hidden mt-1">
                              <div className="bg-blue-600 h-full rounded-full" style={{ width: '68.1%' }} />
                            </div>
                          </div>
                        </div>
                        <p className="text-[8px] font-serif text-neutral-700 leading-tight">
                          Dual-mode token generation establishes parameter-free test-time compute scaling, eliminating redundant compilation loops in CI pipelines.
                        </p>
                      </>
                    )}

                    {currentSpread === 2 && (
                      <>
                        <div className="border-b border-neutral-300 pb-1">
                          <div className="text-[7px] font-mono text-red-700 font-bold uppercase tracking-wider">
                            SILICON VALLEY & LABS
                          </div>
                          <h3 className="text-[12px] font-serif font-black leading-tight text-neutral-950 mt-0.5">
                            Executive Realignments & Sovereign Clusters
                          </h3>
                        </div>
                        <div className="space-y-1 text-[7.5px] font-mono">
                          <div className="border-l-2 border-red-700 pl-1.5 py-0.5">
                            <div className="font-bold text-neutral-900">Stalwart Labs Drops Exchange Clone</div>
                            <div className="text-neutral-600">Open source Rust-based mail and directory cluster replaces MS Exchange.</div>
                          </div>
                          <div className="border-l-2 border-neutral-800 pl-1.5 py-0.5">
                            <div className="font-bold text-neutral-900">Megaspeed Added to Export Entity List</div>
                            <div className="text-neutral-600">Forces European cloud GPU procurements to re-route compliance pipelines.</div>
                          </div>
                        </div>
                      </>
                    )}

                    {currentSpread === 3 && (
                      <>
                        <div className="border-b border-neutral-300 pb-1">
                          <div className="text-[7px] font-mono text-red-700 font-bold uppercase tracking-wider">
                            BUILDER'S DESK
                          </div>
                          <h3 className="text-[12px] font-serif font-black leading-tight text-neutral-950 mt-0.5">
                            Weekend Build: Local Speculative Decoding Engine
                          </h3>
                        </div>
                        <div className="bg-[#ede6d8] p-1.5 rounded border border-neutral-300 text-[7px] font-mono space-y-1">
                          <div className="font-bold text-neutral-900">Stack: Rust · Candle · Metal / CUDA</div>
                          <div>1. Load draft 0.5B model on quantized 4-bit weights</div>
                          <div>2. Run target 70B verifier on batched speculative tokens</div>
                          <div>3. Accept KV-cache match to cut inference latency by 2.8x</div>
                        </div>
                        <div className="p-1 rounded bg-neutral-900 text-[#f5f0e6] text-[7px] font-mono">
                          <span className="text-emerald-400 font-bold">Concept Decoded:</span> KV Cache Paging prevents GPU memory fragmentation during long-context agent tool execution.
                        </div>
                      </>
                    )}
                  </div>

                  {/* Left Bottom Navigation Footer */}
                  <div className="pt-1 border-t border-neutral-300 flex items-center justify-between text-[7px] font-mono text-neutral-500">
                    <span>THE DAILY CIRCUIT · BROADSHEET</span>
                    <span>SECTION A</span>
                  </div>

                </div>

                {/* Inner Crease Shadow (fades to 0 when unfolded at 180°) */}
                <div
                  className="absolute inset-y-0 right-0 w-8 pointer-events-none z-20"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 100%)',
                    opacity: creaseOpacity,
                  }}
                />
              </div>
            </div>

            {/* =========================================================
                RIGHT HALF (pivots around left edge at x = 268px)
                - Outer Face (-Z, rotY 180): GRADE 5 TITANIUM REAR + DUAL 48MP PILL
                - Inner Face (+Z): RIGHT PAGE OF BROADSHEET
                ========================================================= */}
            <div className="duo-half duo-right-half">
              
              {/* Outer Titanium Rails & Perforations */}
              <div className="duo-edge-wall duo-edge-outer-right">
                <div className="duo-antenna-line" style={{ top: 26 }} />
                <div className="duo-antenna-line" style={{ bottom: 26 }} />
              </div>
              <div className="duo-edge-wall duo-edge-top" />
              <div className="duo-edge-wall duo-edge-bottom">
                <div className="duo-spk-dots"><span /><span /><span /><span /></div>
              </div>

              {/* -------------------------------------------------------
                  OUTER REAR PANEL (Grade 5 Titanium & Dual 48MP Pill Camera)
                  ------------------------------------------------------- */}
              <div className="duo-face duo-face-outer">
                <div className="duo-rear-panel">
                  
                  {/* Horizontal Dual 48MP Pill Camera */}
                  <div className="duo-camera-pill">
                    <div className="duo-fusion-lens">
                      <div className="duo-fusion-barrel"><div className="duo-fusion-glass" /></div>
                    </div>
                    <div className="duo-fusion-lens">
                      <div className="duo-fusion-barrel"><div className="duo-fusion-glass" /></div>
                    </div>
                    <div className="ml-auto flex flex-col items-center gap-2">
                      <div className="w-2.5 h-1 rounded-full bg-neutral-600" />
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-100/90 border border-black/20" />
                    </div>
                  </div>

                  {/* Centered Subtle Etched Circuit Logo */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="w-10 h-10 translate-y-3 opacity-25" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>

                </div>
              </div>

              {/* -------------------------------------------------------
                  INNER RIGHT PANEL (+Z face)
                  Displays the RIGHT page of current spread (P2, P4, P6, P8)
                  ------------------------------------------------------- */}
              <div className="duo-face duo-face-inner">
                <div className="absolute inset-1 rounded-r-[36px] bg-[#f5f0e6] text-neutral-900 overflow-hidden p-3.5 flex flex-col justify-between font-sans shadow-inner border-l border-[#d4cbba]">
                  
                  {/* Top Folio Header */}
                  <div className="flex justify-between items-baseline border-b border-neutral-900 pb-1 text-[8px] font-mono tracking-widest text-neutral-600 uppercase">
                    <span>FINITE INTELLIGENCE</span>
                    <span className="font-bold text-neutral-900">
                      PAGE 0{currentSpread * 2 + 2}
                    </span>
                  </div>

                  {/* RIGHT PAGE DYNAMIC CONTENT */}
                  <div className="flex-1 overflow-hidden py-1 space-y-1.5 flex flex-col justify-between">
                    {currentSpread === 0 && (
                      <>
                        <div className="border-b border-neutral-300 pb-1">
                          <div className="text-[7px] font-mono text-red-700 font-bold uppercase tracking-wider">
                            MODEL LEDGER · WEIGHTS
                          </div>
                          <h3 className="text-[12px] font-serif font-black leading-tight text-neutral-950 mt-0.5">
                            Top Frontier Weights of Today
                          </h3>
                        </div>
                        <div className="space-y-1 text-[7.5px] font-mono">
                          <div className="p-1 rounded bg-[#ede6d8] border border-neutral-300">
                            <div className="flex justify-between font-bold text-neutral-950">
                              <span>Beam-501B-MoE</span>
                              <span className="text-[6.5px] bg-neutral-900 text-white px-1 rounded">OPEN</span>
                            </div>
                            <div className="text-neutral-600 text-[6.5px]">501.3B total / 23.4B active · Sparse MoE routing</div>
                          </div>
                          <div className="p-1 rounded bg-[#ede6d8] border border-neutral-300">
                            <div className="flex justify-between font-bold text-neutral-950">
                              <span>Inkling-2-Mini-GGUF</span>
                              <span className="text-[6.5px] bg-neutral-900 text-white px-1 rounded">APACHE 2.0</span>
                            </div>
                            <div className="text-neutral-600 text-[6.5px]">Quantized 8-bit edge execution · Unsloth optimized</div>
                          </div>
                          <div className="p-1 rounded bg-[#ede6d8] border border-neutral-300">
                            <div className="flex justify-between font-bold text-neutral-950">
                              <span>Voice-Isolator 1.2</span>
                              <span className="text-[6.5px] bg-neutral-900 text-white px-1 rounded">MIT</span>
                            </div>
                            <div className="text-neutral-600 text-[6.5px]">12.7k downloads · Low-latency cross-talk isolation</div>
                          </div>
                        </div>
                        <div className="text-[7px] font-mono text-neutral-600 text-right">
                          Turn to Pages 3 & 4 →
                        </div>
                      </>
                    )}

                    {currentSpread === 1 && (
                      <>
                        <div className="border-b border-neutral-300 pb-1">
                          <div className="text-[7px] font-mono text-red-700 font-bold uppercase tracking-wider">
                            24H GITHUB WIRE
                          </div>
                          <h3 className="text-[12px] font-serif font-black leading-tight text-neutral-950 mt-0.5">
                            Trending Open Source Repositories
                          </h3>
                        </div>
                        <div className="space-y-1 text-[7.5px] font-mono">
                          <div className="p-1 rounded bg-[#ede6d8] border border-neutral-300 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-neutral-900">vllm-project/vllm</div>
                              <div className="text-[6.5px] text-neutral-600">PagedAttention high-throughput LLM serving</div>
                            </div>
                            <div className="text-[7px] font-bold text-red-700">+1,420★</div>
                          </div>
                          <div className="p-1 rounded bg-[#ede6d8] border border-neutral-300 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-neutral-900">shadcn/ui-motion</div>
                              <div className="text-[6.5px] text-neutral-600">Accessible fluid micro-interactions</div>
                            </div>
                            <div className="text-[7px] font-bold text-red-700">+890★</div>
                          </div>
                        </div>
                      </>
                    )}

                    {currentSpread === 2 && (
                      <>
                        <div className="border-b border-neutral-300 pb-1">
                          <div className="text-[7px] font-mono text-red-700 font-bold uppercase tracking-wider">
                            DAILY ARXIV RADAR
                          </div>
                          <h3 className="text-[12px] font-serif font-black leading-tight text-neutral-950 mt-0.5">
                            Peer Review & Breakthrough Papers
                          </h3>
                        </div>
                        <div className="space-y-1 text-[7px] font-mono">
                          <div className="p-1 rounded bg-[#ede6d8] border border-neutral-300">
                            <div className="font-bold text-neutral-950 truncate">Unlocking Power of Loops in LLMs</div>
                            <div className="text-[6.5px] text-neutral-600">Enables parameter-free test-time compute loops.</div>
                          </div>
                          <div className="p-1 rounded bg-[#ede6d8] border border-neutral-300">
                            <div className="font-bold text-neutral-950 truncate">Measuring Agent Models on Delayed Consequences</div>
                            <div className="text-[6.5px] text-neutral-600">Establishes autonomous benchmark across DevOps tools.</div>
                          </div>
                        </div>
                      </>
                    )}

                    {currentSpread === 3 && (
                      <>
                        <div className="border-b border-neutral-300 pb-1">
                          <div className="text-[7px] font-mono text-red-700 font-bold uppercase tracking-wider">
                            SIGNOFF & PUZZLE
                          </div>
                          <h3 className="text-[12px] font-serif font-black leading-tight text-neutral-950 mt-0.5">
                            Daily Intelligence Ritual
                          </h3>
                        </div>
                        
                        {/* Puzzle Box */}
                        <div className="p-1.5 rounded bg-[#ede6d8] border border-neutral-300 text-[7px] font-mono space-y-1">
                          <div className="font-bold text-neutral-950">Q: What causes KV-cache thrashing in agents?</div>
                          <div className="grid grid-cols-2 gap-1">
                            {['A) Context overflow', 'B) Memory fragmentation', 'C) Low bandwidth', 'D) Speculative rejection'].map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => setPuzzleAnswered(i)}
                                className={`px-1 py-0.5 rounded text-[6.5px] text-left border ${
                                  puzzleAnswered === i
                                    ? i === 1 ? 'bg-emerald-600 text-white font-bold' : 'bg-red-700 text-white font-bold'
                                    : 'bg-white/80 hover:bg-neutral-200 text-neutral-800'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Stamp Edition Complete Button */}
                        <div className="pt-1">
                          <button
                            onClick={handleStamp}
                            disabled={isStamped}
                            className={`w-full py-1.5 px-2 rounded font-mono text-[7.5px] uppercase tracking-wider font-black transition-all border ${
                              isStamped
                                ? 'bg-neutral-900 text-white border-neutral-900'
                                : 'bg-[#c83e2b] text-white border-[#c83e2b] hover:bg-[#b03524] shadow cursor-pointer'
                            }`}
                          >
                            {isStamped ? '✓ EDITION COMPLETE — GO BUILD' : 'STAMP EDITION COMPLETE ➔'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Bottom Page Navigation */}
                  <div className="pt-1 border-t border-neutral-300 flex items-center justify-between text-[7px] font-mono text-neutral-500">
                    <span>PAGE 0{currentSpread * 2 + 2} / 08</span>
                    <span className="font-bold text-neutral-700">NEXT: MACBOOK ↓</span>
                  </div>

                </div>

                {/* Inner Crease Shadow (fades to 0 when unfolded at 180°) */}
                <div
                  className="absolute inset-y-0 left-0 w-8 pointer-events-none z-20"
                  style={{
                    background: 'linear-gradient(270deg, transparent 0%, rgba(0,0,0,0.4) 100%)',
                    opacity: creaseOpacity,
                  }}
                />
              </div>

            </div>

          </div>{/* /duo-assembly */}
        </div>{/* /duo-stage-scaler */}
      </div>{/* /duo-viewport-3d */}

      {/* Floating Bottom Quick Spread Selector Bar (Subtle & Clean) */}
      {openAngle > 120 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl font-mono text-[9px] text-neutral-300">
          <button
            onClick={() => turnSpread('prev')}
            disabled={currentSpread === 0 || !!animatingDir}
            className="p-1 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
            title="Previous Pages"
          >
            <ChevronLeft size={13} />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: TOTAL_SPREADS }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (currentSpread !== i && !animatingDir) {
                    playFlipSound();
                    setCurrentSpread(i);
                    onSpreadChange?.(i);
                  }
                }}
                className={`px-2 py-0.5 rounded text-[8px] transition font-bold ${
                  currentSpread === i
                    ? 'bg-[#c83e2b] text-white shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                P{i * 2 + 1}-{i * 2 + 2}
              </button>
            ))}
          </div>

          <button
            onClick={() => turnSpread('next')}
            disabled={currentSpread >= TOTAL_SPREADS - 1 || !!animatingDir}
            className="p-1 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
            title="Next Pages"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      )}

    </div>
  );
}
