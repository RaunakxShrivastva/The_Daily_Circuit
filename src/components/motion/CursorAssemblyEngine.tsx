import React, { useEffect, useRef, useState, useCallback } from "react";

interface Editor {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

const EDITORS: Editor[] = [
  { id: "typesetter", name: "Typesetter", color: "#E04834", textColor: "#ffffff" },
  { id: "architect", name: "Grid-Architect", color: "#F4EFE6", textColor: "#070708" },
  { id: "curator", name: "Signal-Curator", color: "#F59E0B", textColor: "#070708" },
  { id: "scout", name: "Repo-Scout", color: "#10B981", textColor: "#070708" },
  { id: "shader", name: "Ink-Shader", color: "#A78BFA", textColor: "#070708" },
];

const PATROL_NOTES: Record<string, string[]> = {
  typesetter: ["6 pages finite", "Playfair 800 serif", "Zero clickbait", "Typeset verified"],
  architect: ["12-col bento locked", "Hairline 1px grid", "60fps layout", "Spatial grid sync"],
  curator: ["Verified SWE-bench +2.4%", "96.8% noise cut", "Contamination audited", "06:00 IST snapshot"],
  scout: ["+1,840★ in 24h", "Zero Python overhead", "Live GitHub diff", "CUDA kernel verified"],
  shader: ["Halftone 60fps shader", "Living ink active", "Cursor-reactive", "Chiaroscuro depth"],
};

interface TrailPoint {
  x: number;
  y: number;
  color: string;
  life: number;
}

interface CursorAssemblyEngineProps {
  active?: boolean;
}

export function CursorAssemblyEngine({ active = false }: CursorAssemblyEngineProps) {
  const [isAssembling, setIsAssembling] = useState(false);
  const [cursorsEnabled] = useState(true);

  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorStageRef = useRef<HTMLDivElement>(null);
  const marqueeBoxRef = useRef<HTMLDivElement>(null);
  const marqueeDimTextRef = useRef<HTMLSpanElement>(null);

  const cursorsRef = useRef<
    Record<
      string,
      Editor & {
        el: HTMLDivElement | null;
        noteEl: HTMLDivElement | null;
        x: number;
        y: number;
        visible: boolean;
        noteTimeout?: ReturnType<typeof setTimeout>;
      }
    >
  >({});

  const trailPointsRef = useRef<TrailPoint[]>([]);
  const runTokenRef = useRef(0);
  const patrolTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Resize trail canvas for Retina / HiDPI
  const resizeTrailCanvas = useCallback(() => {
    const canvas = trailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  const setCursorPos = useCallback((id: string, x: number, y: number, addTrail = true) => {
    const c = cursorsRef.current[id];
    if (!c || !c.el) return;
    if (addTrail && c.visible && cursorsEnabled) {
      const dist = Math.hypot(x - c.x, y - c.y);
      if (dist > 2.5) {
        trailPointsRef.current.push({ x, y, color: c.color, life: 1 });
      }
    }
    c.x = x;
    c.y = y;
    c.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }, [cursorsEnabled]);

  const showCursor = useCallback((id: string, show = true) => {
    const c = cursorsRef.current[id];
    if (!c || !c.el) return;
    c.visible = show;
    c.el.classList.toggle("visible", show && cursorsEnabled);
  }, [cursorsEnabled]);

  const showCursorNote = useCallback((id: string, text: string, duration = 2200) => {
    const c = cursorsRef.current[id];
    if (!c || !c.noteEl || !cursorsEnabled) return;
    c.noteEl.textContent = text;
    c.noteEl.classList.add("show");
    if (c.noteTimeout) clearTimeout(c.noteTimeout);
    c.noteTimeout = setTimeout(() => {
      c.noteEl?.classList.remove("show");
    }, duration);
  }, [cursorsEnabled]);

  const spawnRipple = useCallback((x: number, y: number, color: string) => {
    if (!cursorsEnabled || !cursorStageRef.current) return;
    const r = document.createElement("div");
    r.className = "click-ripple";
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    r.style.color = color;
    cursorStageRef.current.appendChild(r);
    setTimeout(() => r.remove(), 620);
  }, [cursorsEnabled]);

  const clickCursor = useCallback((id: string) => {
    const c = cursorsRef.current[id];
    if (!c || !c.el) return;
    c.el.classList.add("clicking");
    spawnRipple(c.x, c.y, c.color);
    setTimeout(() => c.el?.classList.remove("clicking"), 160);
  }, [spawnRipple]);

  const flashComponent = useCallback((el: HTMLElement, color: string) => {
    el.style.setProperty("--flash-color", color);
    el.classList.add("assembled", "figma-flash");
    setTimeout(() => el.classList.remove("figma-flash"), 850);
  }, []);

  const getTargetPoint = useCallback((el: HTMLElement, rx = 0.5, ry = 0.5) => {
    const rect = el.getBoundingClientRect();
    const x = Math.max(24, Math.min(window.innerWidth - 40, rect.left + rect.width * rx));
    const y = Math.max(24, Math.min(window.innerHeight - 36, rect.top + rect.height * ry));
    return { x, y, rect };
  }, []);

  // Organic cubic Bézier flight path
  const flyCursor = useCallback(
    (id: string, toX: number, toY: number, duration = 750, onStep?: (x: number, y: number, t: number) => void) => {
      return new Promise<void>((resolve) => {
        const c = cursorsRef.current[id];
        if (!c) return resolve();

        const fromX = c.x;
        const fromY = c.y;
        const dx = toX - fromX;
        const dy = toY - fromY;

        const arcDir = id.charCodeAt(0) % 2 === 0 ? 1 : -1;
        const bend = Math.min(130, Math.hypot(dx, dy) * 0.22) * arcDir;
        const cp1x = fromX + dx * 0.32 - dy * 0.14 * arcDir;
        const cp1y = fromY + dy * 0.32 + bend * 0.5;
        const cp2x = fromX + dx * 0.72 + dy * 0.1 * arcDir;
        const cp2y = fromY + dy * 0.72 - bend * 0.35;

        const startTime = performance.now();
        const localToken = runTokenRef.current;

        const tick = (now: number) => {
          if (localToken !== runTokenRef.current) return resolve();
          const raw = Math.min(1, (now - startTime) / duration);
          const t = 1 - Math.pow(1 - raw, 3);
          const u = 1 - t;

          const x = u * u * u * fromX + 3 * u * u * t * cp1x + 3 * u * t * t * cp2x + t * t * t * toX;
          const y = u * u * u * fromY + 3 * u * u * t * cp1y + 3 * u * t * t * cp2y + t * t * t * toY;

          setCursorPos(id, x, y, true);
          if (onStep) onStep(x, y, t);

          if (raw < 1) {
            requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(tick);
      });
    },
    [setCursorPos]
  );

  // Figma-style marquee drag
  const dragMarquee = useCallback(
    async (id: string, rect: DOMRect | { left: number; top: number; right: number; bottom: number }, color: string, duration = 560, coordMode = "dim") => {
      const box = marqueeBoxRef.current;
      const dim = marqueeDimTextRef.current;
      if (!box || !dim) return;

      const x1 = Math.max(12, rect.left);
      const y1 = Math.max(12, Math.min(window.innerHeight - 80, rect.top));
      const x2 = Math.min(window.innerWidth - 16, rect.right);
      const y2 = Math.min(window.innerHeight - 28, Math.max(y1 + 56, rect.bottom));

      box.style.borderColor = color;
      box.style.color = color;
      box.style.background = `${color}14`;
      box.style.left = `${x1}px`;
      box.style.top = `${y1}px`;
      box.style.width = "0px";
      box.style.height = "0px";
      box.classList.add("active");

      await flyCursor(id, x1, y1, 240);
      clickCursor(id);

      await flyCursor(id, x2, y2, duration, (cx, cy) => {
        const w = Math.max(10, cx - x1);
        const h = Math.max(10, cy - y1);
        box.style.width = `${w}px`;
        box.style.height = `${h}px`;
        if (coordMode === "coord") {
          dim.textContent = `X: ${Math.round(cx)} · Y: ${Math.round(cy)}`;
        } else {
          dim.textContent = `W: ${Math.round(w)} · H: ${Math.round(h)}`;
        }
      });

      clickCursor(id);
      box.classList.remove("active");
    },
    [flyCursor, clickCursor]
  );

  const resetToBlank = useCallback(() => {
    const titleEl = document.getElementById("home-title-text");
    const caretEl = document.getElementById("home-title-caret");
    if (titleEl) titleEl.textContent = "";
    if (caretEl) caretEl.style.display = "none";

    const targetIds = [
      "home-artwork",
      "home-pill",
      "home-title",
      "home-subtitle",
      "home-cta",
      "home-hint",
    ];
    targetIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove("assembled", "figma-flash");
      }
    });
  }, []);

  const typeTitle = useCallback((token: number) => {
    return new Promise<void>((resolve) => {
      const titleEl = document.getElementById("home-title-text");
      const caretEl = document.getElementById("home-title-caret");
      if (!titleEl) return resolve();
      titleEl.textContent = "";
      if (caretEl) caretEl.style.display = "inline-block";

      const text = "THE DAILY CIRCUIT";
      let idx = 0;
      const interval = setInterval(() => {
        if (token !== runTokenRef.current) {
          clearInterval(interval);
          if (titleEl) titleEl.textContent = text;
          if (caretEl) caretEl.style.display = "none";
          return resolve();
        }
        idx += 1;
        titleEl.textContent = text.slice(0, idx);
        if (idx >= text.length) {
          clearInterval(interval);
          if (caretEl) caretEl.style.display = "none";
          resolve();
        }
      }, 55);
    });
  }, []);

  const finishAssembly = useCallback(async () => {
    setIsAssembling(false);
    marqueeBoxRef.current?.classList.remove("active");

    if (patrolTimerRef.current) {
      clearInterval(patrolTimerRef.current);
      patrolTimerRef.current = null;
    }

    // Hide any active note bubbles immediately
    EDITORS.forEach((e) => {
      const c = cursorsRef.current[e.id];
      if (c?.noteEl) c.noteEl.classList.remove("show");
    });

    // Ensure all target elements are 100% assembled
    const targets = document.querySelectorAll<HTMLElement>(".assemble-target");
    targets.forEach((el) => {
      el.classList.add("assembled");
      el.classList.remove("figma-flash");
    });

    const titleEl = document.getElementById("home-title-text");
    const caretEl = document.getElementById("home-title-caret");
    if (titleEl) titleEl.textContent = "THE DAILY CIRCUIT";
    if (caretEl) caretEl.style.display = "none";

    // Dynamic off-screen exit coordinates based on viewport size
    const w = window.innerWidth;
    const h = window.innerHeight;
    const exitTargets: Record<string, { x: number; y: number }> = {
      typesetter: { x: -220, y: -220 },
      architect: { x: w + 220, y: -160 },
      curator: { x: w + 220, y: h * 0.4 },
      scout: { x: -220, y: h * 0.75 },
      shader: { x: w * 0.5, y: h + 220 },
    };

    // Smoothly fly all 5 cursors OUT of the screen simultaneously
    await Promise.all(
      EDITORS.map(async (e) => {
        const dest = exitTargets[e.id] || { x: -200, y: -200 };
        await flyCursor(e.id, dest.x, dest.y, 650);
        showCursor(e.id, false);
      })
    );

    // Fade and wipe motion trails
    trailPointsRef.current = [];
    EDITORS.forEach((e) => {
      showCursor(e.id, false);
    });
  }, [flyCursor, showCursor]);

  const skipAssembly = useCallback(async () => {
    runTokenRef.current += 1;
    marqueeBoxRef.current?.classList.remove("active");

    if (patrolTimerRef.current) {
      clearInterval(patrolTimerRef.current);
      patrolTimerRef.current = null;
    }

    const titleEl = document.getElementById("home-title-text");
    const caretEl = document.getElementById("home-title-caret");
    if (titleEl) titleEl.textContent = "THE DAILY CIRCUIT";
    if (caretEl) caretEl.style.display = "none";

    const targets = document.querySelectorAll<HTMLElement>(".assemble-target");
    targets.forEach((el) => {
      el.classList.add("assembled");
      el.classList.remove("figma-flash");
    });

    EDITORS.forEach((e) => {
      const c = cursorsRef.current[e.id];
      if (c?.noteEl) c.noteEl.classList.remove("show");
    });

    setIsAssembling(false);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const exitTargets: Record<string, { x: number; y: number }> = {
      typesetter: { x: -220, y: -220 },
      architect: { x: w + 220, y: -160 },
      curator: { x: w + 220, y: h * 0.4 },
      scout: { x: -220, y: h * 0.75 },
      shader: { x: w * 0.5, y: h + 220 },
    };

    // Swiftly fly out off-screen
    await Promise.all(
      EDITORS.map(async (e) => {
        const dest = exitTargets[e.id] || { x: -200, y: -200 };
        await flyCursor(e.id, dest.x, dest.y, 350);
        showCursor(e.id, false);
      })
    );

    trailPointsRef.current = [];
    EDITORS.forEach((e) => showCursor(e.id, false));
  }, [flyCursor, showCursor]);

  const runAssembly = useCallback(async () => {
    runTokenRef.current += 1;
    const token = runTokenRef.current;
    setIsAssembling(true);
    if (patrolTimerRef.current) clearInterval(patrolTimerRef.current);
    marqueeBoxRef.current?.classList.remove("active");

    // 1. Wipe Home stage completely blank
    resetToBlank();

    // Position cursors off-screen
    const w = window.innerWidth;
    const h = window.innerHeight;
    setCursorPos("typesetter", -60, 120, false);
    setCursorPos("architect", w + 60, h * 0.45, false);
    setCursorPos("curator", w + 60, 140, false);
    setCursorPos("scout", -60, h * 0.78, false);
    setCursorPos("shader", w * 0.5, h + 60, false);
    EDITORS.forEach((e) => showCursor(e.id, false));

    // Phase 1 (0.0s - 1.8s): Typesetter sweeps in, carves out title box & types headline
    showCursor("typesetter", true);
    const heroTitle = document.getElementById("home-title") || document.body;
    const titlePt = getTargetPoint(heroTitle, 0.3, 0.5);
    await flyCursor("typesetter", titlePt.x, titlePt.y, 480);
    if (token !== runTokenRef.current) return;
    clickCursor("typesetter");

    const heroRect = heroTitle.getBoundingClientRect();
    await dragMarquee(
      "typesetter",
      {
        left: Math.max(20, heroRect.left - 24),
        top: Math.max(20, heroRect.top - 18),
        right: Math.min(w - 20, heroRect.right + 24),
        bottom: heroRect.bottom + 18,
      },
      "#E04834",
      540,
      "dim"
    );
    if (token !== runTokenRef.current) return;

    // SNAP title into view and type letter by letter
    flashComponent(heroTitle, "#E04834");
    showCursorNote("typesetter", "Typesetting Playfair 800 Serif", 1800);
    const typePromise = typeTitle(token);

    // Phase 2 (1.5s - 3.2s): Grid-Architect sweeps in & snaps Badge pill and CTA button
    showCursor("architect", true);
    const badgeEl = document.getElementById("home-pill") || heroTitle;
    const badgePt = getTargetPoint(badgeEl, 0.5, 0.5);
    await flyCursor("architect", badgePt.x, badgePt.y, 440);
    if (token !== runTokenRef.current) return;
    clickCursor("architect");
    flashComponent(badgeEl, "#F4EFE6");

    const ctaEl = document.getElementById("home-cta") || heroTitle;
    await dragMarquee("architect", ctaEl.getBoundingClientRect(), "#F4EFE6", 420, "coord");
    if (token !== runTokenRef.current) return;
    flashComponent(ctaEl, "#F4EFE6");
    showCursorNote("architect", "Spatial Layout & Bento Snapped", 1800);

    await typePromise;
    if (token !== runTokenRef.current) return;

    // Phase 3 (3.2s - 4.6s): Curator & Scout assemble Subtitle & Bottom Hint
    showCursor("curator", true);
    showCursor("scout", true);

    const curatorTask = async () => {
      const subtitleEl = document.getElementById("home-subtitle");
      if (subtitleEl) {
        const pt = getTargetPoint(subtitleEl, 0.5, 0.5);
        await flyCursor("curator", pt.x, pt.y, 520);
        if (token !== runTokenRef.current) return;
        clickCursor("curator");
        flashComponent(subtitleEl, "#F59E0B");
        showCursorNote("curator", "Verified Finite Editorial", 1800);
      }
    };

    const scoutTask = async () => {
      const hintEl = document.getElementById("home-hint");
      if (hintEl) {
        const pt = getTargetPoint(hintEl, 0.5, 0.5);
        await flyCursor("scout", pt.x, pt.y, 580);
        if (token !== runTokenRef.current) return;
        clickCursor("scout");
        flashComponent(hintEl, "#10B981");
        showCursorNote("scout", "24H Broadsheet Synced", 1800);
      }
    };

    await Promise.all([curatorTask(), scoutTask()]);
    if (token !== runTokenRef.current) return;

    // Phase 4 (4.6s - 6.0s): Ink-Shader illuminates Artwork
    showCursor("shader", true);
    const artworkEl = document.getElementById("home-artwork");
    if (artworkEl) {
      await flyCursor("shader", w * 0.5, h * 0.42, 540);
      if (token !== runTokenRef.current) return;
      clickCursor("shader");
      flashComponent(artworkEl, "#A78BFA");
      showCursorNote("shader", "Chiaroscuro Depth Online", 1800);
    }

    await new Promise((r) => setTimeout(r, 450));
    if (token !== runTokenRef.current) return;

    finishAssembly();
  }, [
    resetToBlank,
    getTargetPoint,
    flyCursor,
    clickCursor,
    flashComponent,
    dragMarquee,
    showCursorNote,
    showCursor,
    setCursorPos,
    typeTitle,
    finishAssembly,
  ]);

  // Main 60 FPS motion trail render loop
  useEffect(() => {
    const canvas = trailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (cursorsEnabled && trailPointsRef.current.length > 0) {
        for (let i = trailPointsRef.current.length - 1; i >= 0; i--) {
          const p = trailPointsRef.current[i];
          p.life -= 0.045;
          if (p.life <= 0) {
            trailPointsRef.current.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(p.x + 4, p.y + 4, 2.4 * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life * 0.5;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [cursorsEnabled]);

  const hasRunRef = useRef(false);

  // Mount setup
  useEffect(() => {
    resizeTrailCanvas();
    window.addEventListener("resize", resizeTrailCanvas);

    // Populate cursor refs
    EDITORS.forEach((ed) => {
      const el = document.getElementById(`ai-cursor-${ed.id}`) as HTMLDivElement | null;
      const noteEl = el?.querySelector<HTMLDivElement>("[data-note]") || null;
      cursorsRef.current[ed.id] = {
        ...ed,
        el,
        noteEl,
        x: -200,
        y: -200,
        visible: false,
      };
    });

    // Reset Home stage elements to blank state initially
    resetToBlank();

    return () => {
      window.removeEventListener("resize", resizeTrailCanvas);
      if (patrolTimerRef.current) clearInterval(patrolTimerRef.current);
    };
  }, [resizeTrailCanvas, resetToBlank]);

  // Trigger assembly when active turns true (after Cinematic Intro completes or is skipped)
  useEffect(() => {
    if (!active || hasRunRef.current) return;
    hasRunRef.current = true;
    runAssembly();
  }, [active, runAssembly]);

  // Support Escape key to skip assembly while in progress
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAssembling) {
        skipAssembly();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isAssembling, skipAssembly]);

  return (
    <>
      <style>{`
        /* Multiplayer Motion Trails Canvas */
        #trailCanvas {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 85;
        }

        #cursorStage {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 90;
          overflow: hidden;
        }

        /* Dynamic Figma Selection Marquee */
        .marquee-box {
          position: fixed;
          pointer-events: none;
          z-index: 88;
          border: 1.5px solid #E04834;
          background: rgba(224, 72, 52, 0.08);
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .marquee-box.active {
          opacity: 1;
        }
        .marquee-handle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #070708;
          border: 1.5px solid currentColor;
          border-radius: 1px;
        }
        .marquee-handle.tl { top: -4px; left: -4px; }
        .marquee-handle.tr { top: -4px; right: -4px; }
        .marquee-handle.bl { bottom: -4px; left: -4px; }
        .marquee-handle.br { bottom: -4px; right: -4px; }

        .marquee-dim {
          position: absolute;
          bottom: -24px;
          left: 50%;
          transform: translateX(-50%);
          padding: 2px 7px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
          white-space: nowrap;
          color: #070708;
          background: currentColor;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
        }

        /* Autonomous Editor Cursors */
        .ai-cursor {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          will-change: transform, opacity;
          opacity: 0;
          transition: opacity 0.35s ease;
          z-index: 92;
        }
        .ai-cursor.visible {
          opacity: 1;
        }
        .ai-cursor-svg {
          display: block;
          width: 22px;
          height: 22px;
          filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.75));
          transition: transform 0.12s ease;
        }
        .ai-cursor.clicking .ai-cursor-svg {
          transform: scale(0.84) translate(1px, 1px);
        }
        .ai-cursor-tag {
          position: absolute;
          top: 17px;
          left: 14px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 999px;
          font-family: monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.03em;
          white-space: nowrap;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .ai-cursor-note {
          position: absolute;
          top: -32px;
          left: 16px;
          padding: 4px 9px;
          border-radius: 6px;
          background: rgba(14, 14, 16, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #F4EFE6;
          font-family: monospace;
          font-size: 10px;
          white-space: nowrap;
          opacity: 0;
          transform: translateY(6px) scale(0.95);
          transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        }
        .ai-cursor-note.show {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Click Ripple */
        .click-ripple {
          position: fixed;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid currentColor;
          pointer-events: none;
          z-index: 91;
          transform: translate(-50%, -50%) scale(0.4);
          animation: cursorRippleOut 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes cursorRippleOut {
          0% { transform: translate(-50%, -50%) scale(0.35); opacity: 0.95; }
          100% { transform: translate(-50%, -50%) scale(3.4); opacity: 0; }
        }

        /* Dynamic Assembly Elements: Start 100% blank, snap into view as cursors build */
        .assemble-target {
          opacity: 0;
          transform: translateY(22px) scale(0.96);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .assemble-target.assembled {
          opacity: 1 !important;
          transform: translateY(0) scale(1) !important;
        }

        /* Figma Flash on Component Selection */
        .figma-flash {
          outline: 2px solid var(--flash-color, #E04834) !important;
          outline-offset: 4px;
          box-shadow: 0 0 32px rgba(224, 72, 52, 0.25) !important;
        }

        /* Pulse glow animation */
        @keyframes cursorPulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.8); }
        }
        .cursor-pulse-dot {
          animation: cursorPulseGlow 1.3s ease-in-out infinite;
        }
      `}</style>

      {/* Motion Trail Canvas */}
      <canvas id="trailCanvas" ref={trailCanvasRef} aria-hidden="true" />

      {/* Autonomous Cursor Stage */}
      <div id="cursorStage" ref={cursorStageRef} aria-hidden="true">
        {EDITORS.map((ed) => (
          <div key={ed.id} id={`ai-cursor-${ed.id}`} className="ai-cursor">
            <div className="ai-cursor-note" data-note />
            <svg className="ai-cursor-svg" viewBox="0 0 24 24" fill="none">
              <path
                d="M4.5 3.5L19.5 11.2L12.6 13.4L9.8 20.2L4.5 3.5Z"
                fill={ed.color}
                stroke="#070708"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            <div className="ai-cursor-tag" style={{ background: ed.color, color: ed.textColor }}>
              {ed.name}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Figma-style Selection Marquee Box */}
      <div id="marqueeBox" ref={marqueeBoxRef} className="marquee-box" aria-hidden="true">
        <span className="marquee-handle tl" />
        <span className="marquee-handle tr" />
        <span className="marquee-handle bl" />
        <span className="marquee-handle br" />
        <div className="marquee-dim">
          <span ref={marqueeDimTextRef}>W: 0 · H: 0</span>
        </div>
      </div>

      {/* Floating Assembly Status Pill (Bottom Center) */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-3 px-4 py-2 rounded-full font-mono text-[11px] text-neutral-100 backdrop-blur-xl bg-black/85 border border-[#E04834]/40 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_24px_rgba(224,72,52,0.2)] transition-all duration-400 select-none ${
          isAssembling ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#E04834] shadow-[0_0_10px_#E04834] cursor-pulse-dot" />
        <span className="font-semibold tracking-wide">
          PRESS ENGINE ACTIVE — 5 AUTONOMOUS EDITORS ASSEMBLING EDITION #143
        </span>
        <button
          type="button"
          onClick={skipAssembly}
          className="ml-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-[#E04834]/25 hover:border-[#E04834] border border-white/15 text-[10px] font-bold text-white transition-colors cursor-pointer"
        >
          Skip Intro
        </button>
      </div>
    </>
  );
}