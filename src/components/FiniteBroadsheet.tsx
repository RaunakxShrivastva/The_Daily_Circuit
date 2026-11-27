import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Terminal,
  Award,
  Zap,
  Cpu,
  GitBranch,
  AlertTriangle,
  Binary,
  ExternalLink
} from 'lucide-react';
import '../styles/finite.css';

interface EditionData {
  date: string;
  issueNumber: number;
  editionTitle: string;
  signalRatio: number;
  pages: {
    page1_front: {
      headline: string;
      subheadline: string;
      leadBody: string[];
      sixtySecondBrief: string[];
    };
    page2_models: {
      releases: Array<{
        name: string;
        lab: string;
        license: string;
        verifiedDelta: string;
        hypeCheck: string;
      }>;
    };
    page3_accuracy: {
      battles: Array<{
        benchmark: string;
        modelA: { name: string; score: number; lab: string };
        modelB: { name: string; score: number; lab: string };
        delta: string;
        analysis: string;
      }>;
      editorialTake: string;
    };
    page4_repos: {
      topRepos: Array<{
        repo: string;
        stars24h: string;
        stack: string;
        whyItMatters: string;
      }>;
    };
    page5_boardroom: {
      moves: Array<{
        company: string;
        leader: string;
        headline: string;
        impact: string;
      }>;
    };
    page6_research: {
      papers: Array<{
        title: string;
        authors: string;
        arxivId: string;
        breakthrough: string;
        impactForEngineers: string;
      }>;
    };
    page7_builders: {
      weekendBuild: {
        title: string;
        stack: string[];
        steps: string[];
      };
      conceptDecoded: {
        term: string;
        plainEnglish: string;
      };
      architectureTeardown: {
        system: string;
        tradeoff: string;
      };
    };
    page8_signoff: {
      quote: { text: string; author: string };
      dailyPuzzle: {
        question: string;
        options: string[];
        answerIndex: number;
        explanation: string;
      };
      signoffNotice: string;
    };
  };
}

const TOTAL_SPREADS = 4;

export function FiniteBroadsheet({ isEmbedded = false }: { isEmbedded?: boolean } = {}) {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [animatingDir, setAnimatingDir] = useState<'next' | 'prev' | null>(null);
  const [edition, setEdition] = useState<EditionData | null>(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState<number | null>(null);
  const [isStamped, setIsStamped] = useState(false);
  const [countdown, setCountdown] = useState('--:--:--');

  const deskStageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastWheelTime = useRef(0);

  // Scroll to flip pages in embedded 3D mode:
  // Traps scroll to flip spreads 0 -> 1 -> 2 -> 3 with realistic curl and audio.
  // When at the final spread (spread 3, pages 7 & 8), downward scroll naturally flows down into MacBook!
  // When at the first spread (spread 0), upward scroll flows back up to HomePage!
  useEffect(() => {
    if (!isEmbedded) return;
    const el = deskStageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (e.deltaY > 30 && currentSpread < TOTAL_SPREADS - 1) {
        e.preventDefault();
        if (now - lastWheelTime.current > 520 && !animatingDir) {
          lastWheelTime.current = now;
          turnSpread('next');
        }
      } else if (e.deltaY < -30 && currentSpread > 0) {
        e.preventDefault();
        if (now - lastWheelTime.current > 520 && !animatingDir) {
          lastWheelTime.current = now;
          turnSpread('prev');
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isEmbedded, currentSpread, animatingDir]);

  // Fetch compiled daily edition
  useEffect(() => {
    fetch('/editions/latest.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.pages) {
          setEdition(data);
        }
      })
      .catch((err) => console.error('Failed to load edition:', err));
  }, []);

  // Web Audio 3D paper rustle synthesis
  const playFlipSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = ctx.sampleRate * 0.18;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.045));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(820, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(290, ctx.currentTime + 0.18);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch {}
  };

  // 3D Spread Navigation with Animation
  const turnSpread = (dir: 'next' | 'prev') => {
    if (animatingDir) return;

    if (dir === 'next' && currentSpread < TOTAL_SPREADS - 1) {
      setAnimatingDir('next');
      playFlipSound();
      setTimeout(() => {
        setCurrentSpread((s) => s + 1);
        setAnimatingDir(null);
      }, 580);
    } else if (dir === 'prev' && currentSpread > 0) {
      setAnimatingDir('prev');
      playFlipSound();
      setTimeout(() => {
        setCurrentSpread((s) => s - 1);
        setAnimatingDir(null);
      }, 580);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === 'ArrowRight' || (!isEmbedded && e.key === ' ')) {
        e.preventDefault();
        turnSpread('next');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        turnSpread('prev');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentSpread, animatingDir, isEmbedded]);

  // Touch / Swipe support
  useEffect(() => {
    const el = deskStageRef.current;
    if (!el) return;
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      const diff = e.changedTouches[0].clientX - startX;
      if (diff < -45) turnSpread('next');
      if (diff > 45) turnSpread('prev');
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [currentSpread, animatingDir]);

  // ResizeObserver for zero-clipping dynamic scale
  useEffect(() => {
    const stage = deskStageRef.current;
    const root = rootRef.current;
    if (!stage || !root) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const scaleW = (width - 48) / 1020;
        const scaleH = (height - 36) / 670;
        const scale = Math.min(scaleW, scaleH, 1.25);
        root.style.transform = `scale(${Math.max(0.4, scale)})`;
      }
    });

    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // Living Ink Halftone Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let mouse = { x: 80, y: 35, active: false };

    const handlePointer = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    canvas.addEventListener('mousemove', handlePointer);
    canvas.addEventListener('mouseleave', () => { mouse.active = false; });

    let t = 0;
    const render = () => {
      t += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cols = 28;
      const rows = 10;
      const spacingX = canvas.width / cols;
      const spacingY = canvas.height / rows;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacingX + spacingX / 2;
          const y = j * spacingY + spacingY / 2;
          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
          const wave = Math.sin(t + i * 0.3 + j * 0.4) * 0.5 + 0.5;

          let r = 1.1 + wave * 1.6;
          if (mouse.active && distToMouse < 55) {
            r += (55 - distToMouse) * 0.07;
          }

          ctx.beginPath();
          ctx.arc(x, y, Math.min(r, 4), 0, Math.PI * 2);
          ctx.fillStyle = distToMouse < 40 ? '#c83e2b' : '#141413';
          ctx.fill();
        }
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handlePointer);
    };
  }, [currentSpread]);

  // Countdown timer to 06:00 IST (00:30 UTC)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();
      target.setUTCHours(0, 30, 0, 0);
      if (now.getTime() > target.getTime()) {
        target.setUTCDate(target.getUTCDate() + 1);
      }
      const diff = Math.max(0, target.getTime() - now.getTime());
      const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stamp Complete Ritual
  const handleStamp = () => {
    setIsStamped(true);
    window.dispatchEvent(new CustomEvent("daily-circuit:stamp"));
    playFlipSound();
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.65 },
      colors: ['#c83e2b', '#141413', '#6a624f', '#f5f0e4']
    });
  };

  const p = edition?.pages;

  return (
    <div
      className={
        isEmbedded
          ? "studio-desk-surface w-full min-h-[660px] lg:min-h-[750px] flex flex-col justify-between items-center relative overflow-hidden select-none rounded-2xl border border-[#2b241c]/40 shadow-2xl my-6 py-2"
          : "studio-desk-surface w-screen h-screen flex flex-col justify-between overflow-hidden select-none"
      }
    >
      {/* Top Header Bar */}
      <header className="desk-header px-6 py-2.5 flex items-center justify-between border-b border-white/10 z-30">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-300 font-semibold">
            The Daily Circuit · 24H Intelligence Press
          </span>
          <span className="text-neutral-500 text-xs">|</span>
          <span className="font-mono text-xs text-neutral-400">
            {edition?.date || new Date().toISOString().split('T')[0]}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-3 py-1 rounded-full text-xs font-mono text-neutral-400">
            <Clock size={12} className="text-amber-500" />
            <span>Next Press In: {countdown}</span>
          </div>
          <div className="bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono px-2.5 py-0.5 rounded uppercase tracking-wider font-bold">
            {edition?.signalRatio || 96.8}% Signal Ratio
          </div>
        </div>
      </header>

      {/* Main 3D Broadsheet Desk Stage */}
      <main
        ref={deskStageRef}
        className="flex-1 flex items-center justify-center relative overflow-hidden p-3"
      >
        <div
          ref={rootRef}
          id="broadsheetRoot"
          data-perch="true"
          data-mascot-note="Finite Broadsheet Spread. 3D page curl engine."
          className="relative transition-transform duration-200 ease-out"
          style={{ width: 1020, height: 670, perspective: 2500 }}
        >
          {/* Desk shadow under the spread */}
          <div className="spread-desk-shadow absolute inset-0 rounded pointer-events-none" />

          {/* Central spine fold shadow */}
          <div className="spine-shadow absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 z-30 pointer-events-none" />

          {/* Clickable Edge Turn Zones */}
          {currentSpread > 0 && (
            <div
              className="edge-turn-zone edge-turn-left"
              onClick={() => turnSpread('prev')}
              title="Turn to previous spread"
            />
          )}
          {currentSpread < TOTAL_SPREADS - 1 && (
            <div
              className="edge-turn-zone edge-turn-right"
              onClick={() => turnSpread('next')}
              title="Turn to next spread"
            />
          )}

          {/* 3D Animated Turning Overlay Sheet */}
          {animatingDir === 'next' && (
            <div
              className="sheet-turning-next absolute top-0 right-0 w-1/2 h-full bg-[#f6f1e6] border border-[#d8cfbe] rounded-r-sm overflow-hidden"
              style={{ width: 510, height: 670 }}
            >
              <div className="sheet-sheen" />
            </div>
          )}
          {animatingDir === 'prev' && (
            <div
              className="sheet-turning-prev absolute top-0 left-0 w-1/2 h-full bg-[#f6f1e6] border border-[#d8cfbe] rounded-l-sm overflow-hidden"
              style={{ width: 510, height: 670 }}
            >
              <div className="sheet-sheen" />
            </div>
          )}

          {/* 8-Page Layout Across 4 Spreads */}
          <div className="w-full h-full flex rounded-sm overflow-hidden border border-[#d8cfbe] shadow-2xl relative bg-[#f6f1e6]">
            {/* ---------------- SPREAD 0: PAGES 1 & 2 ---------------- */}
            {currentSpread === 0 && (
              <>
                {/* PAGE 1: FRONT PAGE */}
                <article className="w-1/2 h-full p-6 flex flex-col justify-between border-r border-[#d4cbba] bg-[#f6f1e6] relative">
                  <div>
                    {/* Folio */}
                    <div className="flex justify-between items-baseline border-b border-neutral-900 pb-1 text-[10px] font-mono tracking-widest text-neutral-600 uppercase">
                      <span>Vol. I · No. {edition?.issueNumber || 42}</span>
                      <span>Verified AI & Tech Broadsheet</span>
                      <span>PAGE 01</span>
                    </div>

                    {/* Masthead */}
                    <div className="py-2 text-center border-b-2 border-neutral-900">
                      <h1 className="text-4xl font-serif font-black tracking-tight text-neutral-950 leading-none">
                        THE DAILY CIRCUIT
                      </h1>
                      <div className="flex justify-between items-center text-[9px] font-mono uppercase text-neutral-600 mt-1 px-1">
                        <span>{edition?.date}</span>
                        <span className="font-bold text-red-700">Zero-Doomscroll Engineering Press</span>
                        <span>Free Daily Edition</span>
                      </div>
                    </div>

                    {/* Headline Image (Editorial Photo) */}
                    <div className="my-2 border border-neutral-900 bg-[#ede6d8] overflow-hidden shadow-sm">
                      <img
                        src="/photos/lead.jpg"
                        alt="Lead story dispatch"
                        className="w-full h-[105px] object-cover filter contrast-[1.08] grayscale-[0.15]"
                      />
                      <div className="px-2 py-0.5 bg-[#ede6d8] border-t border-neutral-300 flex justify-between items-baseline text-[8.5px] font-mono text-neutral-700">
                        <span className="truncate mr-2">Fig 1.0 — Reflection Team 501B sparse MoE cluster routing</span>
                        <a
                          href="https://news.ycombinator.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-700 font-bold hover:underline shrink-0 flex items-center gap-0.5"
                        >
                          Source Dispatch <ExternalLink size={9} />
                        </a>
                      </div>
                    </div>

                    {/* Living Ink Halftone Canvas */}
                    <div className="mb-2 border border-neutral-800/30 bg-[#ede6d8] p-1 rounded-sm relative">
                      <canvas
                        ref={canvasRef}
                        width={440}
                        height={60}
                        className="w-full h-[60px] block cursor-crosshair"
                      />
                      <div className="absolute bottom-1 right-2 text-[7.5px] font-mono uppercase tracking-wider text-neutral-600 bg-[#ede6d8]/90 px-1 border border-neutral-400">
                        Living Ink · Agitate
                      </div>
                    </div>

                    {/* Lead Story */}
                    <div className="space-y-1">
                      <div className="text-[9.5px] font-mono uppercase font-bold text-red-700 tracking-wider">
                        ★ Lead Dispatch
                      </div>
                      <h2 className="text-lg font-serif font-bold text-neutral-950 leading-tight">
                        <a
                          href="https://news.ycombinator.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-red-700 transition-colors"
                        >
                          {p?.page1_front?.headline || 'Beam MoE Architecture Unveils 501B Sparse Parameters for Agent Workloads'}
                        </a>
                      </h2>
                      <p className="text-[10px] font-serif italic text-neutral-700 leading-snug">
                        {p?.page1_front?.subheadline}
                      </p>
                      <div className="text-[10px] font-serif text-neutral-900 leading-relaxed text-justify drop-cap pt-0.5">
                        <p>{p?.page1_front?.leadBody?.[0]}</p>
                      </div>
                    </div>
                  </div>

                  {/* 60-Second Brief Box */}
                  <div className="mt-2 p-2 bg-[#ece4d3] border-l-2 border-neutral-900 text-[9.5px]">
                    <div className="font-mono font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5 mb-1">
                      <Zap size={10} className="text-amber-700" />
                      <span>60-Second Executive Brief</span>
                    </div>
                    <ul className="space-y-0.5 font-serif text-neutral-800 list-disc list-inside">
                      {p?.page1_front?.sixtySecondBrief?.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </article>

                {/* PAGE 2: TOP AI MODELS OF TODAY */}
                <article className="w-1/2 h-full p-6 flex flex-col justify-between bg-[#f6f1e6] relative">
                  <div>
                    {/* Folio */}
                    <div className="flex justify-between items-baseline border-b border-neutral-900 pb-1 text-[10px] font-mono tracking-widest text-neutral-600 uppercase">
                      <span>PAGE 02</span>
                      <span>Model Ledger · Frontier Releases</span>
                      <span>{edition?.date}</span>
                    </div>

                    <div className="pt-2 pb-1.5">
                      <h2 className="text-xl font-serif font-bold text-neutral-950">
                        Top AI Models of Today
                      </h2>
                      <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
                        Verified 24h Weights · Benchmark Deltas · Hype Checks
                      </p>
                    </div>

                    {/* Model Releases Cards with Clickable Links */}
                    <div className="space-y-2.5 mt-1">
                      {p?.page2_models?.releases?.map((m, i) => (
                        <div key={i} className="p-2.5 bg-[#ede6d8] border border-[#d6ccb8] rounded-sm space-y-1">
                          <div className="flex justify-between items-center">
                            <a
                              href={`https://huggingface.co/models?search=${encodeURIComponent(m.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-serif font-bold text-xs text-neutral-950 flex items-center gap-1 hover:text-red-700 transition-colors"
                            >
                              <Cpu size={12} className="text-red-700" />
                              {m.name}
                              <ExternalLink size={10} className="text-neutral-500" />
                            </a>
                            <span className="font-mono text-[8.5px] bg-neutral-900 text-white px-2 py-0.5 rounded font-semibold uppercase">
                              {m.license}
                            </span>
                          </div>
                          <div className="text-[9.5px] font-mono text-neutral-600">
                            Lab: <strong className="text-neutral-900">{m.lab}</strong>
                          </div>
                          <div className="text-[10.5px] font-serif text-neutral-900 font-medium">
                            {m.verifiedDelta}
                          </div>
                          <div className="bg-[#e4dcce] p-1.5 rounded text-[9.5px] font-mono text-neutral-700 flex items-start gap-1">
                            <AlertTriangle size={10} className="text-amber-700 shrink-0 mt-0.5" />
                            <span><strong>Hype Check:</strong> {m.hypeCheck}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-400 flex justify-between items-center text-[9px] font-mono text-neutral-600 uppercase">
                    <span>The Daily Circuit · Section A</span>
                    <button onClick={() => turnSpread('next')} className="hover:text-red-700 font-bold flex items-center gap-1">
                      Turn to Page 3 & 4 →
                    </button>
                  </div>
                </article>
              </>
            )}

            {/* ---------------- SPREAD 1: PAGES 3 & 4 ---------------- */}
            {currentSpread === 1 && (
              <>
                {/* PAGE 3: ACCURACY HEAD-TO-HEAD */}
                <article className="w-1/2 h-full p-6 flex flex-col justify-between border-r border-[#d4cbba] bg-[#f6f1e6] relative">
                  <div>
                    {/* Folio */}
                    <div className="flex justify-between items-baseline border-b border-neutral-900 pb-1 text-[10px] font-mono tracking-widest text-neutral-600 uppercase">
                      <span>PAGE 03</span>
                      <span>Benchmarking · Model Battles</span>
                      <span>{edition?.date}</span>
                    </div>

                    <div className="pt-2 pb-1.5">
                      <h2 className="text-xl font-serif font-bold text-neutral-950">
                        Accuracy Head-to-Head
                      </h2>
                      <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
                        Which Model Beat Which · Visual Delta Bars
                      </p>
                    </div>

                    {/* Battle Cards with Visual Bars */}
                    <div className="space-y-2.5 mt-1">
                      {p?.page3_accuracy?.battles?.map((b, i) => (
                        <div key={i} className="p-2.5 bg-[#ede6d8] border border-[#d6ccb8] rounded-sm space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[9.5px] font-bold text-neutral-900 uppercase">
                              {b.benchmark}
                            </span>
                            <span className="font-mono text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                              {b.delta}
                            </span>
                          </div>

                          {/* Visual Comparison Bars */}
                          <div className="space-y-1 pt-0.5">
                            <div>
                              <div className="flex justify-between text-[9.5px] font-mono">
                                <span className="font-bold text-neutral-950">{b.modelA.name} ({b.modelA.lab})</span>
                                <span className="font-bold text-neutral-950">{b.modelA.score}%</span>
                              </div>
                              <div className="w-full bg-[#d6ccb8] h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-neutral-900 h-full rounded-full transition-all duration-700"
                                  style={{ width: `${Math.min(100, b.modelA.score)}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[9.5px] font-mono text-neutral-600">
                                <span>{b.modelB.name} ({b.modelB.lab})</span>
                                <span>{b.modelB.score}%</span>
                              </div>
                              <div className="w-full bg-[#d6ccb8] h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-neutral-500 h-full rounded-full transition-all duration-700"
                                  style={{ width: `${Math.min(100, b.modelB.score)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <p className="text-[9.5px] font-serif italic text-neutral-700 leading-snug pt-0.5 border-t border-neutral-300">
                            <strong>Engineering Take:</strong> {b.analysis}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-2 bg-[#ece4d3] border border-neutral-300 text-[9.5px] font-serif text-neutral-800">
                    <strong>Editorial Takeaway:</strong> {p?.page3_accuracy?.editorialTake}
                  </div>
                </article>

                {/* PAGE 4: TOP GITHUB REPOSITORIES */}
                <article className="w-1/2 h-full p-6 flex flex-col justify-between bg-[#f6f1e6] relative">
                  <div>
                    {/* Folio */}
                    <div className="flex justify-between items-baseline border-b border-neutral-900 pb-1 text-[10px] font-mono tracking-widest text-neutral-600 uppercase">
                      <span>PAGE 04</span>
                      <span>Open Source · 24H GitHub Pulse</span>
                      <span>{edition?.date}</span>
                    </div>

                    <div className="pt-2 pb-1.5">
                      <h2 className="text-xl font-serif font-bold text-neutral-950">
                        Top GitHub Repositories Today
                      </h2>
                      <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
                        Gaining Velocity · High-Signal Codebases
                      </p>
                    </div>

                    {/* 4 Repo Cards with Clickable GitHub Links */}
                    <div className="space-y-2 mt-1">
                      {p?.page4_repos?.topRepos?.map((r, i) => (
                        <div key={i} className="p-2 bg-[#ede6d8] border border-[#d6ccb8] rounded-sm space-y-1">
                          <div className="flex justify-between items-center">
                            <a
                              href={`https://github.com/${r.repo}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs font-bold text-neutral-950 flex items-center gap-1.5 hover:text-red-700 transition-colors"
                            >
                              <span className="text-red-700 font-bold">0{i + 1}</span>
                              <GitBranch size={11} className="text-neutral-700" />
                              {r.repo}
                              <ExternalLink size={9} className="text-neutral-500" />
                            </a>
                            <span className="font-mono text-[9px] bg-red-100 text-red-800 border border-red-200 px-1.5 py-0.5 rounded font-bold">
                              ★ {r.stars24h}
                            </span>
                          </div>
                          <div className="text-[9px] font-mono text-neutral-600">
                            Stack: <span className="text-neutral-900 font-semibold">{r.stack}</span>
                          </div>
                          <p className="text-[10px] font-serif text-neutral-800 leading-snug">
                            {r.whyItMatters}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-400 flex justify-between items-center text-[9px] font-mono text-neutral-600 uppercase">
                    <span>The Daily Circuit · Section B</span>
                    <button onClick={() => turnSpread('next')} className="hover:text-red-700 font-bold flex items-center gap-1">
                      Turn to Page 5 & 6 →
                    </button>
                  </div>
                </article>
              </>
            )}

            {/* ---------------- SPREAD 2: PAGES 5 & 6 ---------------- */}
            {currentSpread === 2 && (
              <>
                {/* PAGE 5: BIG TECH & CEO MOVES */}
                <article className="w-1/2 h-full p-6 flex flex-col justify-between border-r border-[#d4cbba] bg-[#f6f1e6] relative">
                  <div>
                    {/* Folio */}
                    <div className="flex justify-between items-baseline border-b border-neutral-900 pb-1 text-[10px] font-mono tracking-widest text-neutral-600 uppercase">
                      <span>PAGE 05</span>
                      <span>Boardroom & Labs · Strategic Shifts</span>
                      <span>{edition?.date}</span>
                    </div>

                    <div className="pt-2 pb-1.5">
                      <h2 className="text-xl font-serif font-bold text-neutral-950">
                        Big Tech, AI Labs & CEO Moves
                      </h2>
                      <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
                        Executive Deployments & Industry Realignments
                      </p>
                    </div>

                    {/* Boardroom Shifts with Clickable Search Links */}
                    <div className="space-y-2.5 mt-1">
                      {p?.page5_boardroom?.moves?.map((m, i) => (
                        <div key={i} className="p-2.5 bg-[#ede6d8] border border-[#d6ccb8] rounded-sm space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-serif font-bold text-xs text-neutral-950">
                              {m.company}
                            </span>
                            <span className="font-mono text-[8.5px] bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded font-semibold">
                              {m.leader}
                            </span>
                          </div>
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(m.company + ' ' + m.headline)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-serif font-semibold text-xs text-neutral-900 leading-snug hover:text-red-700 transition-colors flex items-center gap-1"
                          >
                            {m.headline}
                            <ExternalLink size={9} className="text-neutral-500 shrink-0" />
                          </a>
                          <div className="bg-[#e4dcce] p-1.5 rounded text-[9.5px] font-serif text-neutral-800 leading-snug">
                            <strong>Impact for Builders:</strong> {m.impact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[8.5px] font-mono text-neutral-500 uppercase tracking-wider">
                    Reported across SEC filings & verified engineering statements
                  </div>
                </article>

                {/* PAGE 6: DAILY RESEARCH PAPERS */}
                <article className="w-1/2 h-full p-6 flex flex-col justify-between bg-[#f6f1e6] relative">
                  <div>
                    {/* Folio */}
                    <div className="flex justify-between items-baseline border-b border-neutral-900 pb-1 text-[10px] font-mono tracking-widest text-neutral-600 uppercase">
                      <span>PAGE 06</span>
                      <span>Peer Review · Daily Research Papers</span>
                      <span>{edition?.date}</span>
                    </div>

                    <div className="pt-2 pb-1.5">
                      <h2 className="text-xl font-serif font-bold text-neutral-950">
                        Daily Research Papers
                      </h2>
                      <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
                        arXiv & Hugging Face · Architectural Breakthroughs
                      </p>
                    </div>

                    {/* 3 Research Papers with Clickable arXiv Links */}
                    <div className="space-y-2 mt-1">
                      {p?.page6_research?.papers?.map((paper, i) => (
                        <div key={i} className="p-2 bg-[#ede6d8] border border-[#d6ccb8] rounded-sm space-y-1">
                          <div className="flex justify-between items-start gap-1">
                            <h3 className="font-serif font-bold text-xs text-neutral-950 leading-snug flex-1">
                              {paper.title}
                            </h3>
                            <a
                              href={`https://arxiv.org/abs/${paper.arxivId.replace('arXiv:', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[8.5px] bg-neutral-900 text-white px-1.5 py-0.5 rounded shrink-0 hover:bg-red-800 transition-colors flex items-center gap-0.5"
                            >
                              {paper.arxivId}
                              <ExternalLink size={8} />
                            </a>
                          </div>
                          <div className="text-[9px] font-mono text-neutral-600">
                            {paper.authors}
                          </div>
                          <p className="text-[9.5px] font-serif text-neutral-800 leading-snug">
                            <strong>Breakthrough:</strong> {paper.breakthrough}
                          </p>
                          <div className="bg-[#e4dcce] p-1 rounded text-[9px] font-mono text-neutral-700">
                            <strong>Systems Takeaway:</strong> {paper.impactForEngineers}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-400 flex justify-between items-center text-[9px] font-mono text-neutral-600 uppercase">
                    <span>The Daily Circuit · Section C</span>
                    <button onClick={() => turnSpread('next')} className="hover:text-red-700 font-bold flex items-center gap-1">
                      Turn to Page 7 & 8 →
                    </button>
                  </div>
                </article>
              </>
            )}

            {/* ---------------- SPREAD 3: PAGES 7 & 8 ---------------- */}
            {currentSpread === 3 && (
              <>
                {/* PAGE 7: STUDENT & BUILDER CORNER */}
                <article className="w-1/2 h-full p-6 flex flex-col justify-between border-r border-[#d4cbba] bg-[#f6f1e6] relative">
                  <div>
                    {/* Folio */}
                    <div className="flex justify-between items-baseline border-b border-neutral-900 pb-1 text-[10px] font-mono tracking-widest text-neutral-600 uppercase">
                      <span>PAGE 07</span>
                      <span>Student & Builder Corner</span>
                      <span>{edition?.date}</span>
                    </div>

                    <div className="pt-2 pb-1.5">
                      <h2 className="text-xl font-serif font-bold text-neutral-950">
                        Student & Builder Corner
                      </h2>
                      <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
                        Practical CLI Projects · Core Concept Decoded
                      </p>
                    </div>

                    {/* Weekend Micro-Project */}
                    <div className="p-2.5 bg-[#ede6d8] border border-[#d6ccb8] rounded-sm space-y-1.5 mt-1">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-700 uppercase">
                        <Terminal size={11} />
                        <span>Weekend Build: {p?.page7_builders?.weekendBuild?.title}</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {p?.page7_builders?.weekendBuild?.stack?.map((tool, i) => (
                          <span key={i} className="text-[8.5px] font-mono bg-neutral-900 text-white px-1.5 py-0.5 rounded">
                            {tool}
                          </span>
                        ))}
                      </div>
                      <ol className="text-[9.5px] font-serif text-neutral-900 space-y-1 list-decimal list-inside pl-1">
                        {p?.page7_builders?.weekendBuild?.steps?.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Concept Decoded */}
                    <div className="p-2.5 bg-[#ece4d3] border-l-2 border-neutral-900 rounded-r-sm space-y-1 mt-2">
                      <div className="text-[9.5px] font-mono font-bold uppercase text-neutral-900 flex items-center gap-1">
                        <Binary size={10} className="text-red-700" />
                        <span>Concept Decoded: {p?.page7_builders?.conceptDecoded?.term}</span>
                      </div>
                      <p className="text-[10px] font-serif text-neutral-800 leading-snug">
                        {p?.page7_builders?.conceptDecoded?.plainEnglish}
                      </p>
                    </div>

                    {/* Architecture Teardown */}
                    <div className="p-2 bg-[#e4dcce] border border-[#d2c5af] rounded-sm text-[9.5px] space-y-0.5 mt-2">
                      <div className="font-mono font-bold uppercase text-neutral-900">
                        Architecture Teardown: {p?.page7_builders?.architectureTeardown?.system}
                      </div>
                      <p className="font-serif italic text-neutral-700 leading-snug">
                        <strong>Core Tradeoff:</strong> {p?.page7_builders?.architectureTeardown?.tradeoff}
                      </p>
                    </div>
                  </div>

                  <div className="text-[8.5px] font-mono text-neutral-500 uppercase tracking-wider">
                    Curated for engineering students & computer systems builders
                  </div>
                </article>

                {/* PAGE 8: THE DAILY SIGN-OFF */}
                <article className="w-1/2 h-full p-6 flex flex-col justify-between bg-[#f6f1e6] relative">
                  <div>
                    {/* Folio */}
                    <div className="flex justify-between items-baseline border-b border-neutral-900 pb-1 text-[10px] font-mono tracking-widest text-neutral-600 uppercase">
                      <span>PAGE 08</span>
                      <span>The Daily Sign-Off · Finite Ritual</span>
                      <span>{edition?.date}</span>
                    </div>

                    <div className="pt-2 pb-1.5">
                      <h2 className="text-xl font-serif font-bold text-neutral-950">
                        The Daily Sign-Off
                      </h2>
                      <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
                        Architecture Check · Go Build Ritual
                      </p>
                    </div>

                    {/* Quote of the Day */}
                    <div className="p-2 bg-[#ede6d8] border-l-2 border-red-700 text-[10px] font-serif italic text-neutral-900 leading-snug">
                      "{p?.page8_signoff?.quote?.text}"
                      <div className="text-[8.5px] font-mono not-italic text-neutral-600 mt-0.5 uppercase text-right">
                        — {p?.page8_signoff?.quote?.author}
                      </div>
                    </div>

                    {/* Architecture Check Quiz */}
                    <div className="p-2.5 bg-[#ede6d8] border border-[#d6ccb8] rounded-sm space-y-1.5 mt-2">
                      <div className="text-[9.5px] font-mono font-bold uppercase text-neutral-900 flex items-center gap-1">
                        <Award size={10} className="text-amber-700" />
                        <span>Daily Architecture Check</span>
                      </div>
                      <p className="text-[10.5px] font-serif font-medium text-neutral-950">
                        {p?.page8_signoff?.dailyPuzzle?.question}
                      </p>

                      <div className="space-y-1 pt-0.5">
                        {p?.page8_signoff?.dailyPuzzle?.options?.map((opt, i) => {
                          const isSelected = puzzleAnswer === i;
                          const isCorrect = i === p?.page8_signoff?.dailyPuzzle?.answerIndex;
                          let btnClass = 'bg-[#f6f1e6] text-neutral-900 border-[#d0c6b3] hover:border-neutral-900';
                          if (puzzleAnswer !== null) {
                            if (isSelected) {
                              btnClass = isCorrect ? 'bg-emerald-100 text-emerald-950 border-emerald-500 font-bold' : 'bg-red-100 text-red-950 border-red-500 font-bold';
                            } else if (isCorrect) {
                              btnClass = 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold';
                            }
                          }

                          return (
                            <button
                              key={i}
                              onClick={() => {
                                setPuzzleAnswer(i);
                                playFlipSound();
                              }}
                              className={`w-full text-left p-1.5 rounded text-[9.5px] font-mono border transition-all ${btnClass}`}
                            >
                              <span className="font-bold mr-1">{String.fromCharCode(65 + i)}.</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {puzzleAnswer !== null && (
                        <div className="p-1.5 bg-[#e4dcce] rounded text-[9px] font-serif text-neutral-800 leading-snug border border-neutral-300">
                          <strong>Resolution:</strong> {p?.page8_signoff?.dailyPuzzle?.explanation}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Complete & Go Build Ink Stamp Ritual */}
                  <div className="pt-2 border-t-2 border-neutral-900 text-center space-y-1.5">
                    <button
                      onClick={handleStamp}
                      disabled={isStamped}
                      className={`w-full py-2.5 px-4 rounded font-mono text-xs uppercase tracking-widest font-black transition-all border-2 ${
                        isStamped
                          ? 'bg-neutral-900 text-[#f6f1e6] border-neutral-900 opacity-90 cursor-default shadow-inner'
                          : 'bg-[#c83e2b] text-white border-[#c83e2b] hover:bg-[#b03524] shadow-md active:scale-98 cursor-pointer'
                      }`}
                    >
                      {isStamped ? '✓ EDITION COMPLETE — GO BUILD' : 'STAMP EDITION COMPLETE ➔'}
                    </button>
                    <div className="text-[8.5px] font-mono text-neutral-500 uppercase tracking-wider">
                      You are done for the day. Next edition arrives at 06:00 IST.
                    </div>
                  </div>
                </article>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Desk Control Dock */}
      <footer className="desk-footer px-6 py-3 flex items-center justify-between border-t border-white/10 z-30 bg-[#12110f]/95 backdrop-blur-md">
        <button
          onClick={() => turnSpread('prev')}
          disabled={currentSpread === 0 || !!animatingDir}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft size={14} />
          <span>Previous Spread</span>
        </button>

        {/* Spread Navigation Indicators */}
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_SPREADS }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (currentSpread !== i && !animatingDir) {
                  playFlipSound();
                  setCurrentSpread(i);
                }
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all border ${
                currentSpread === i
                  ? 'bg-[#c83e2b] text-white border-[#c83e2b] font-bold'
                  : 'bg-white/5 text-neutral-400 border-white/10 hover:border-white/30'
              }`}
            >
              Spread 0{i + 1} (P{i * 2 + 1}-{i * 2 + 2})
            </button>
          ))}
        </div>

        <button
          onClick={() => turnSpread('next')}
          disabled={currentSpread >= TOTAL_SPREADS - 1 || !!animatingDir}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <span>Next Spread</span>
          <ChevronRight size={14} />
        </button>
      </footer>
    </div>
  );
}
