import React, { useEffect, useRef, useState, useCallback } from "react";

export type MascotTheme = "obsidian" | "ink" | "riso";

export interface DailyEdition {
  date?: string;
  issueNumber?: number;
  signalRatio?: number;
  pages?: {
    page1_front?: {
      headline?: string;
      sixtySecondBrief?: string[];
    };
    page2_models?: {
      releases?: Array<{ name: string; lab: string; verifiedDelta: string }>;
    };
    page3_repos?: {
      topRepos?: Array<{ repo: string; stars24h: string; stack: string }>;
    };
  };
}

interface InkyMascotProps {
  edition?: DailyEdition | null;
  defaultTheme?: MascotTheme;
  mutedByDefault?: boolean;
}

type MascotState =
  | "PATROL"
  | "JUMPING"
  | "PERCHED"
  | "INSPECTING"
  | "DRAGGED"
  | "FALLING"
  | "DIZZY"
  | "WINDSWEPT"
  | "SLEEPING"
  | "CELEBRATING";

interface ThemeColors {
  body: string;
  bodyShade: string;
  stroke: string;
  visor: string;
  eyeWhite: string;
  pupil: string;
  limb: string;
  accent: string;
  accentGlow: string;
  cheek: string;
}

const THEMES: Record<MascotTheme, ThemeColors> = {
  obsidian: {
    body: "#191A20",
    bodyShade: "#101116",
    stroke: "#585A66",
    visor: "#070709",
    eyeWhite: "#F5F5F7",
    pupil: "#08080A",
    limb: "#363842",
    accent: "#FF453A",
    accentGlow: "rgba(255, 69, 58, 0.9)",
    cheek: "rgba(255, 69, 58, 0.28)",
  },
  ink: {
    body: "#F5F5F7",
    bodyShade: "#DCDCE2",
    stroke: "#111114",
    visor: "#111114",
    eyeWhite: "#FFFFFF",
    pupil: "#111114",
    limb: "#141418",
    accent: "#FF453A",
    accentGlow: "rgba(255, 69, 58, 0.65)",
    cheek: "rgba(255, 69, 58, 0.25)",
  },
  riso: {
    body: "#F6EFE2",
    bodyShade: "#E8DBC5",
    stroke: "#D93829",
    visor: "#2B1917",
    eyeWhite: "#FFF9F0",
    pupil: "#FF453A",
    limb: "#D93829",
    accent: "#FF453A",
    accentGlow: "rgba(255, 69, 58, 0.8)",
    cheek: "rgba(255, 69, 58, 0.38)",
  },
};

interface Particle {
  kind: "dust" | "confetti" | "zzz" | "wind";
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot?: number;
  vrot?: number;
  size: number;
  life: number;
  decay: number;
  color: string;
}

export const InkyMascot: React.FC<InkyMascotProps> = ({
  edition: propEdition,
  defaultTheme = "obsidian",
  mutedByDefault = false,
}) => {
  const [edition, setEdition] = useState<DailyEdition | null>(propEdition ?? null);
  const [theme, setTheme] = useState<MascotTheme>(defaultTheme);
  const [muted, setMuted] = useState(mutedByDefault);
  const [state, setState] = useState<MascotState>("PATROL");
  const [speech, setSpeech] = useState<string | null>(null);
  const [askOpen, setAskOpen] = useState(false);
  const askOpenRef = useRef(false);
  const [query, setQuery] = useState("");

  const inkyElRef = useRef<HTMLDivElement | null>(null);
  const bodyWrapRef = useRef<HTMLDivElement | null>(null);
  const antennaRef = useRef<SVGGElement | null>(null);
  const legLRef = useRef<SVGGElement | null>(null);
  const legRRef = useRef<SVGGElement | null>(null);
  const armLRef = useRef<SVGGElement | null>(null);
  const armRRef = useRef<SVGGElement | null>(null);
  const shadowRef = useRef<SVGEllipseElement | null>(null);
  const pupilLRef = useRef<SVGGElement | null>(null);
  const pupilRRef = useRef<SVGGElement | null>(null);
  const eyelidLRef = useRef<SVGRectElement | null>(null);
  const eyelidRRef = useRef<SVGRectElement | null>(null);

  const fxCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechBubbleRef = useRef<HTMLDivElement | null>(null);
  const commandDeskRef = useRef<HTMLFormElement | null>(null);
  const lastHoveredRef = useRef<HTMLElement | null>(null);

  const MASCOT_W = 68;
  const MASCOT_H = 76;
  const GRAVITY = 0.62;
  const FLOOR_CLEARANCE = 76;

  // Live 60FPS Physics state
  const phys = useRef({
    x: 180,
    y: typeof window !== "undefined" ? window.innerHeight - FLOOR_CLEARANCE : 500,
    vx: 1.35,
    vy: 0,
    facing: 1 as 1 | -1,
    state: "PATROL" as MascotState,
    stateTimer: Date.now(),
    scaleX: 1,
    scaleY: 1,
    tiltDeg: 0,
    spinDeg: 0,
    isBackflipping: false,
    walkPhase: 0,
    perchEl: null as HTMLElement | null,
    perchOffsetRatio: 0.5,
    pendingPerchEl: null as HTMLElement | null,
    pendingInspectNote: null as string | null,
    mouseX: typeof window !== "undefined" ? window.innerWidth * 0.5 : 400,
    mouseY: typeof window !== "undefined" ? window.innerHeight * 0.4 : 300,
    lastActivityTime: Date.now(),
    pokeTimes: [] as number[],
    lastScrollY: 0,
    nextAutoJumpTime: Date.now() + 5500,
    nextZzzTime: 0,
    nextBlinkTime: Date.now() + 2600,
    blinkProgress: 0,
    drag: null as {
      pointerId: number;
      startX: number;
      startY: number;
      lastX: number;
      lastY: number;
      vx: number;
      vy: number;
      moved: boolean;
    } | null,
  });

  const particlesRef = useRef<Particle[]>([]);

  // 1. Fetch live edition JSON if not provided
  useEffect(() => {
    if (propEdition) {
      setEdition(propEdition);
      return;
    }
    fetch("/editions/latest.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setEdition(data);
      })
      .catch(() => {});
  }, [propEdition]);

  // 2. Synthesized Web Audio
  const playChirp = useCallback(
    (f1 = 520, f2 = 860, dur = 0.08, type: OscillatorType = "sine", vol = 0.06) => {
      if (muted) return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f1, now);
        osc.frequency.exponentialRampToValueAtTime(f2, now + dur);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + dur + 0.01);
      } catch {
        // Ignore autoplay restrictions
      }
    },
    [muted]
  );

  const playThud = useCallback(() => {
    playChirp(160, 52, 0.09, "triangle", 0.09);
  }, [playChirp]);

  const playCelebrateChime = useCallback(() => {
    playChirp(523, 659, 0.09, "triangle", 0.06);
    setTimeout(() => playChirp(659, 784, 0.1, "triangle", 0.06), 75);
    setTimeout(() => playChirp(784, 1046, 0.15, "triangle", 0.07), 150);
  }, [playChirp]);

  const say = useCallback((message: string, durationMs = 4600) => {
    setSpeech(message);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    if (durationMs > 0) {
      speechTimerRef.current = setTimeout(() => {
        setSpeech(null);
      }, durationMs);
    }
  }, []);

  const setMascotState = useCallback((nextState: MascotState) => {
    phys.current.state = nextState;
    phys.current.stateTimer = Date.now();
    setState(nextState);
  }, []);

  const toggleAskOpen = useCallback(() => {
    setAskOpen((prev) => {
      const next = !prev;
      askOpenRef.current = next;
      const p = phys.current;
      if (next) {
        // Freeze mascot completely in place
        p.vx = 0;
        p.vy = 0;
        p.walkPhase = 0;
        p.tiltDeg = 0;
        p.spinDeg = 0;
        p.isBackflipping = false;
        p.scaleX = 1;
        p.scaleY = 1;
        p.lastActivityTime = Date.now();
        playChirp(520, 680, 0.08);
      } else {
        if (!p.perchEl) {
          p.vx = p.facing * 1.35;
        }
      }
      return next;
    });
  }, [playChirp]);

  const closeAsk = useCallback(() => {
    setAskOpen(false);
    askOpenRef.current = false;
    if (!phys.current.perchEl) {
      phys.current.vx = phys.current.facing * 1.35;
    }
  }, []);

  // 3. Particles
  const spawnDust = (x: number, y: number, count = 6) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        kind: "dust",
        x: x + (Math.random() - 0.5) * 20,
        y: y - 2,
        vx: (Math.random() - 0.5) * 3.2,
        vy: -Math.random() * 1.8 - 0.4,
        size: 2 + Math.random() * 2.5,
        life: 1,
        decay: 0.04,
        color: "rgba(245, 245, 247, 0.45)",
      });
    }
  };

  const spawnConfetti = (x: number, y: number, count = 26) => {
    const colors = ["#FF453A", "#F5F5F7", "#34D399", "#38BDF8", "#FBBF24"];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const speed = 3.5 + Math.random() * 5.8;
      particlesRef.current.push({
        kind: "confetti",
        x,
        y: y - 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.25,
        size: 4 + Math.random() * 4,
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        color: colors[i % colors.length],
      });
    }
  };

  const spawnZzz = (x: number, y: number) => {
    particlesRef.current.push({
      kind: "zzz",
      x: x + 16,
      y: y - 58,
      vx: 0.35 + Math.random() * 0.35,
      vy: -0.75 - Math.random() * 0.35,
      size: 11 + Math.random() * 4,
      life: 1,
      decay: 0.012,
      color: "#F5F5F7",
    });
  };

  const spawnWindStreak = (x: number, y: number, dirY: number) => {
    particlesRef.current.push({
      kind: "wind",
      x: x + (Math.random() - 0.5) * 70,
      y: y - 35 + (Math.random() - 0.5) * 40,
      vx: 0,
      vy: dirY * 6,
      size: 18 + Math.random() * 18,
      life: 1,
      decay: 0.08,
      color: "rgba(255, 255, 255, 0.35)",
    });
  };

  // 4. Perching and Jumping logic
  const getFloorY = () => window.innerHeight - FLOOR_CLEARANCE;

  const getVisiblePerches = () => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-perch="true"]'));
    return nodes.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width >= 90 && r.top >= 70 && r.top <= window.innerHeight - 120;
    });
  };

  const jumpToTarget = useCallback(
    (targetX: number, targetY: number, targetEl: HTMLElement | null = null, inspectNote: string | null = null) => {
      const p = phys.current;
      p.perchEl = null;
      p.pendingPerchEl = targetEl;
      p.pendingInspectNote = inspectNote;
      p.isBackflipping = false;
      p.spinDeg = 0;

      const dx = targetX - p.x;
      const dy = targetY - p.y;
      const flightFrames = Math.max(24, Math.min(44, Math.round(Math.hypot(dx, dy) / 14)));
      p.vx = dx / flightFrames;
      p.vy = (dy - 0.5 * GRAVITY * flightFrames * flightFrames) / flightFrames;
      if (p.vy > -6.5) p.vy = -7.5;

      p.facing = dx >= 0 ? 1 : -1;
      p.scaleX = 0.82;
      p.scaleY = 1.24;
      spawnDust(p.x, p.y, 5);
      playChirp(340, 680, 0.09, "sine", 0.055);
      setMascotState("JUMPING");
    },
    [playChirp, setMascotState]
  );

  const jumpToElement = useCallback(
    (el: HTMLElement, inspectNote: string | null = null) => {
      const r = el.getBoundingClientRect();
      const margin = Math.min(54, r.width * 0.22);
      const targetX = Math.max(
        44,
        Math.min(window.innerWidth - 44, r.left + margin + Math.random() * Math.max(10, r.width - margin * 2))
      );
      const targetY = r.top;
      jumpToTarget(targetX, targetY, el, inspectNote);
    },
    [jumpToTarget]
  );

  const jumpToRandomPerch = useCallback(() => {
    const p = phys.current;
    const perches = getVisiblePerches().filter((el) => el !== p.perchEl);
    if (perches.length === 0) {
      p.perchEl = null;
      p.vy = -12.5;
      p.vx = (Math.random() > 0.5 ? 1 : -1) * 3.2;
      p.scaleX = 0.82;
      p.scaleY = 1.22;
      playChirp(360, 720, 0.09);
      setMascotState("JUMPING");
      return;
    }
    const pick = perches[Math.floor(Math.random() * perches.length)];
    jumpToElement(pick, null);
  }, [jumpToElement, playChirp, setMascotState]);

  const doBackflip = useCallback(() => {
    const p = phys.current;
    p.perchEl = null;
    p.pendingPerchEl = null;
    p.pendingInspectNote = null;
    p.vy = -14.2;
    p.vx = p.facing * 2.2;
    p.isBackflipping = true;
    p.spinDeg = 0;
    p.scaleX = 0.8;
    p.scaleY = 1.26;
    spawnConfetti(p.x, p.y, 10);
    playChirp(400, 980, 0.14, "triangle", 0.065);
    say("Watch this 360° mid-air press flip!", 3200);
    setMascotState("JUMPING");
  }, [playChirp, say, setMascotState]);

  const landOnSurface = useCallback(
    (y: number, el: HTMLElement | null = null, note: string | null = null) => {
      const p = phys.current;
      p.y = y;
      p.vx = 0;
      p.vy = 0;
      p.isBackflipping = false;
      p.spinDeg = 0;
      p.scaleX = 1.24;
      p.scaleY = 0.76;
      spawnDust(p.x, p.y, 7);
      playThud();

      if (el) {
        const r = el.getBoundingClientRect();
        p.perchEl = el;
        p.perchOffsetRatio = Math.max(0.08, Math.min(0.92, (p.x - r.left) / Math.max(1, r.width)));
        if (note) {
          setMascotState("INSPECTING");
          say(note, 5200);
        } else {
          setMascotState("PERCHED");
        }
      } else {
        p.perchEl = null;
        p.vx = p.facing * 1.35;
        setMascotState("PATROL");
      }
      p.nextAutoJumpTime = Date.now() + 5500 + Math.random() * 4500;
    },
    [playThud, say, setMascotState]
  );

  const triggerCelebration = useCallback(() => {
    const p = phys.current;
    p.perchEl = null;
    p.vy = -12;
    setMascotState("CELEBRATING");
    spawnConfetti(p.x, p.y, 32);
    playCelebrateChime();
    say("EDITION STAMPED! Zero doomscroll—now go build something awesome!", 5800);
  }, [playCelebrateChime, say, setMascotState]);

  // 5. Listen to daily-circuit:stamp event
  useEffect(() => {
    const onStamp = () => {
      triggerCelebration();
    };
    window.addEventListener("daily-circuit:stamp", onStamp);
    return () => window.removeEventListener("daily-circuit:stamp", onStamp);
  }, [triggerCelebration]);

  // Starting introduction after 5 AI Cursors complete assembling the Home Page
  useEffect(() => {
    const onAssemblyComplete = () => {
      setTimeout(() => {
        const p = phys.current;
        p.vy = -8.5;
        p.state = "JUMPING";
        p.scaleX = 0.85;
        p.scaleY = 1.25;
        playChirp(480, 840, 0.12, "triangle", 0.08);
        setTimeout(() => {
          say("Beep boop! 🗞️ I'm Inky, your living Press-Bot mascot! I audit hype, decode architectures, and perch on cards. Double-click me anytime for commands or help!", 7500);
        }, 350);
      }, 600);
    };

    window.addEventListener("daily-circuit:assembly-complete", onAssemblyComplete);
    return () => window.removeEventListener("daily-circuit:assembly-complete", onAssemblyComplete);
  }, [playChirp, say]);

  // Feature 1: Context-Aware Reading (Dwell detection on sections)
  useEffect(() => {
    let dwellTimer: ReturnType<typeof setTimeout> | null = null;
    const commentedCards = new Set<string>();

    const checkDwell = () => {
      if (askOpenRef.current) return;
      const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-perch="true"]'));
      const activeCard = cards.find((c) => {
        const r = c.getBoundingClientRect();
        return r.top >= 80 && r.top <= window.innerHeight * 0.55;
      });

      if (activeCard) {
        const note = activeCard.getAttribute("data-mascot-note");
        const cardId = activeCard.id || note?.slice(0, 24) || "";
        if (note && cardId && !commentedCards.has(cardId)) {
          commentedCards.add(cardId);
          const p = phys.current;
          if (p.state !== "DRAGGED" && p.state !== "SLEEPING" && p.state !== "WINDSWEPT") {
            setMascotState("INSPECTING");
            playChirp(540, 720, 0.08);
            say(`💡 Inky's Takeaway: ${note}`, 5200);
          }
        }
      }
    };

    const onScrollDwell = () => {
      if (dwellTimer) clearTimeout(dwellTimer);
      dwellTimer = setTimeout(checkDwell, 3400);
    };

    window.addEventListener("scroll", onScrollDwell, { passive: true });
    dwellTimer = setTimeout(checkDwell, 4000);

    return () => {
      if (dwellTimer) clearTimeout(dwellTimer);
      window.removeEventListener("scroll", onScrollDwell);
    };
  }, [playChirp, say, setMascotState]);

  // Feature 2: Text Selection Explainer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const handleMouseUp = () => {
      if (askOpenRef.current) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const sel = window.getSelection()?.toString().trim();
        if (sel && sel.length >= 3 && sel.length <= 60 && !sel.includes("\n")) {
          playChirp(620, 820, 0.06);
          say(`🔍 Want me to decode "${sel.length > 25 ? sel.slice(0, 22) + "..." : sel}"? Double-click me to ask Botpress AI!`, 4800);
        }
      }, 400);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [playChirp, say]);

  // 6. Context-aware hover inspection
  useEffect(() => {
    const handlePointerOver = (e: PointerEvent) => {
      if (askOpenRef.current) return;
      const target = (e.target as HTMLElement)?.closest('[data-perch="true"]') as HTMLElement | null;
      if (!target) {
        lastHoveredRef.current = null;
        return;
      }
      if (lastHoveredRef.current === target) return;
      lastHoveredRef.current = target;

      const note = target.getAttribute("data-mascot-note");
      if (!note) return;

      const p = phys.current;
      if (p.state === "DRAGGED" || p.state === "DIZZY" || p.state === "CELEBRATING" || p.state === "SLEEPING") return;
      const r = target.getBoundingClientRect();
      if (r.top < 70 || r.top > window.innerHeight - 120) return;

      if (p.perchEl === target) {
        setMascotState("INSPECTING");
        say(note, 5200);
        playChirp(560, 780, 0.06);
      } else {
        jumpToElement(target, note);
      }
    };

    document.addEventListener("pointerover", handlePointerOver);
    return () => {
      document.removeEventListener("pointerover", handlePointerOver);
    };
  }, [jumpToElement, playChirp, say, setMascotState]);

  // 7. Mouse move & Scroll tracking
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      phys.current.mouseX = e.clientX;
      phys.current.mouseY = e.clientY;
      phys.current.lastActivityTime = Date.now();
      if (phys.current.state === "SLEEPING" && Date.now() - phys.current.stateTimer > 1200) {
        setMascotState(phys.current.perchEl ? "PERCHED" : "PATROL");
      }
    };

    const onScroll = () => {
      if (askOpenRef.current) return;
      const p = phys.current;
      const currScrollY = window.scrollY;
      const scrollDelta = currScrollY - p.lastScrollY;
      p.lastScrollY = currScrollY;

      if (Math.abs(scrollDelta) > 38 && p.state !== "DRAGGED" && p.state !== "FALLING" && p.state !== "JUMPING") {
        p.lastActivityTime = Date.now();
        if (p.state !== "WINDSWEPT") {
          setMascotState("WINDSWEPT");
          say("Whoa, speed reader! Slow down—The Daily Circuit is finite, zero doomscroll. Take your time with the lead wire!", 3200);
          playChirp(780, 420, 0.1, "sine", 0.045);
        } else {
          p.stateTimer = Date.now();
        }
        spawnWindStreak(p.x, p.y, scrollDelta > 0 ? -1 : 1);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [playChirp, say, setMascotState]);

  // 8. 60FPS Animation Loop
  useEffect(() => {
    const handleResize = () => {
      const canvas = fxCanvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let rafId = 0;

    const tick = () => {
      const now = Date.now();
      const p = phys.current;
      const floorY = getFloorY();
      const prevY = p.y;

      // Inactivity Sleep (16s)
      if (now - p.lastActivityTime > 16000 && !askOpen && (p.state === "PATROL" || p.state === "PERCHED")) {
        setMascotState("SLEEPING");
        say("Powering down ink nib... zZz", 2600);
      }

      // Physics states
      if (askOpenRef.current) {
        // Freeze mascot completely when double-click popover is open
        p.vx = 0;
        p.vy = 0;
        p.walkPhase = 0;
        p.tiltDeg = 0;
        p.spinDeg = 0;
        if (!p.perchEl) p.y = floorY;
      } else if (p.state === "PATROL") {
        p.y = floorY;
        p.x += p.vx;
        p.walkPhase += 0.22;

        if (p.x < 44) {
          p.x = 44;
          p.vx = Math.abs(p.vx);
          p.facing = 1;
        } else if (p.x > window.innerWidth - 44) {
          p.x = window.innerWidth - 44;
          p.vx = -Math.abs(p.vx);
          p.facing = -1;
        }

        if (now > p.nextAutoJumpTime && !askOpen) {
          jumpToRandomPerch();
        }
      } else if (p.state === "JUMPING" || p.state === "FALLING") {
        p.vy += GRAVITY;
        p.x += p.vx;
        p.y += p.vy;

        if (p.isBackflipping) {
          p.spinDeg += p.facing * 18;
        }

        if (p.x < 36) {
          p.x = 36;
          p.vx = Math.abs(p.vx) * 0.65;
          p.facing = 1;
        } else if (p.x > window.innerWidth - 36) {
          p.x = window.innerWidth - 36;
          p.vx = -Math.abs(p.vx) * 0.65;
          p.facing = -1;
        }

        if (p.vy > 0) {
          let landed = false;

          if (p.pendingPerchEl) {
            const r = p.pendingPerchEl.getBoundingClientRect();
            if (p.x >= r.left - 12 && p.x <= r.right + 12 && prevY <= r.top + 16 && p.y >= r.top) {
              const targetEl = p.pendingPerchEl;
              const note = p.pendingInspectNote;
              p.pendingPerchEl = null;
              p.pendingInspectNote = null;
              landOnSurface(r.top, targetEl, note);
              landed = true;
            }
          }

          if (!landed && p.state === "FALLING") {
            const perches = getVisiblePerches();
            for (const el of perches) {
              const r = el.getBoundingClientRect();
              if (p.x >= r.left + 14 && p.x <= r.right - 14 && prevY <= r.top + 14 && p.y >= r.top) {
                landOnSurface(r.top, el, null);
                say("Stuck the landing right on the card!", 2600);
                landed = true;
                break;
              }
            }
          }

          if (!landed && p.y >= floorY) {
            const wasFalling = p.state === "FALLING";
            landOnSurface(floorY, null, null);
            if (wasFalling) {
              say("Oof—soft landing! Gravity still works.", 2600);
            }
          }
        }
      } else if (
        p.state === "PERCHED" ||
        p.state === "INSPECTING" ||
        p.state === "CELEBRATING" ||
        p.state === "SLEEPING" ||
        p.state === "DIZZY" ||
        p.state === "WINDSWEPT"
      ) {
        if (p.perchEl) {
          const r = p.perchEl.getBoundingClientRect();
          if (r.top < 42 || r.top > window.innerHeight - 84) {
            p.perchEl = null;
            p.vy = -2;
            setMascotState("FALLING");
          } else {
            p.x = Math.max(36, Math.min(window.innerWidth - 36, r.left + r.width * p.perchOffsetRatio));
            p.y = r.top;
          }
        } else {
          p.y = Math.min(p.y, floorY);
        }

        if (p.state === "DIZZY" && now - p.stateTimer > 3200) {
          setMascotState(p.perchEl ? "PERCHED" : "PATROL");
          if (!p.perchEl) p.vx = p.facing * 1.35;
        } else if (p.state === "WINDSWEPT" && now - p.stateTimer > 1100) {
          setMascotState(p.perchEl ? "PERCHED" : "PATROL");
          if (!p.perchEl) p.vx = p.facing * 1.35;
        } else if (p.state === "CELEBRATING" && now - p.stateTimer > 4200) {
          setMascotState(p.perchEl ? "PERCHED" : "PATROL");
          if (!p.perchEl) p.vx = p.facing * 1.35;
        } else if (p.state === "INSPECTING" && now - p.stateTimer > 5400 && !askOpen) {
          setMascotState("PERCHED");
        } else if (p.state === "PERCHED" && now > p.nextAutoJumpTime && !askOpen) {
          if (Math.random() < 0.45) {
            jumpToTarget(Math.max(60, Math.min(window.innerWidth - 60, p.x + (Math.random() - 0.5) * 260)), floorY, null, null);
          } else {
            jumpToRandomPerch();
          }
        }

        if (p.state === "SLEEPING" && now > p.nextZzzTime) {
          spawnZzz(p.x, p.y);
          p.nextZzzTime = now + 950;
        }
      }

      // Procedural limb & antenna rotations
      p.scaleX += (1 - p.scaleX) * 0.16;
      p.scaleY += (1 - p.scaleY) * 0.16;

      let targetTilt = 0;
      if (p.state === "DRAGGED") targetTilt = p.tiltDeg;
      else if (p.state === "WINDSWEPT") targetTilt = -24 * p.facing;
      else if (p.state === "DIZZY") targetTilt = Math.sin(now * 0.022) * 16;
      else if (p.state === "PATROL") targetTilt = Math.sin(p.walkPhase) * 4;
      else if (p.state === "CELEBRATING") targetTilt = Math.sin(now * 0.02) * 9;
      p.tiltDeg += (targetTilt - p.tiltDeg) * 0.18;

      let lLegRot = 0,
        rLegRot = 0,
        lArmRot = 0,
        rArmRot = 0;
      let antRot = Math.max(-22, Math.min(22, -p.vx * 3.5));

      if (askOpenRef.current) {
        lLegRot = 0;
        rLegRot = 0;
        lArmRot = 0;
        rArmRot = 0;
        antRot = 0;
      } else if (p.state === "PATROL") {
        lLegRot = Math.sin(p.walkPhase) * 24;
        rLegRot = -Math.sin(p.walkPhase) * 24;
        lArmRot = -Math.sin(p.walkPhase) * 18;
        rArmRot = Math.sin(p.walkPhase) * 18;
      } else if (p.state === "PERCHED" || p.state === "INSPECTING") {
        lLegRot = Math.sin(now * 0.0055) * 16;
        rLegRot = -Math.sin(now * 0.0055) * 16;
        if (p.state === "INSPECTING") {
          rArmRot = -42 + Math.sin(now * 0.008) * 6;
        }
      } else if (p.state === "DRAGGED" || p.state === "FALLING") {
        lLegRot = Math.sin(now * 0.036) * 34;
        rLegRot = -Math.sin(now * 0.036) * 34;
        lArmRot = 120 + Math.sin(now * 0.03) * 18;
        rArmRot = -120 - Math.sin(now * 0.03) * 18;
      } else if (p.state === "CELEBRATING") {
        lArmRot = 135 + Math.sin(now * 0.024) * 22;
        rArmRot = -115 + Math.sin(now * 0.024) * 24;
        lLegRot = Math.sin(now * 0.02) * 14;
        rLegRot = -Math.sin(now * 0.02) * 14;
      } else if (p.state === "SLEEPING") {
        lLegRot = -38;
        rLegRot = 38;
      } else if (p.state === "WINDSWEPT") {
        lArmRot = 55;
        rArmRot = -55;
      }

      if (legLRef.current) legLRef.current.style.transform = `rotate(${lLegRot.toFixed(1)}deg)`;
      if (legRRef.current) legRRef.current.style.transform = `rotate(${rLegRot.toFixed(1)}deg)`;
      if (armLRef.current) armLRef.current.style.transform = `rotate(${lArmRot.toFixed(1)}deg)`;
      if (armRRef.current) armRRef.current.style.transform = `rotate(${rArmRot.toFixed(1)}deg)`;
      if (antennaRef.current) antennaRef.current.style.transform = `rotate(${antRot.toFixed(1)}deg)`;

      // Pupil Eye Tracking
      const eyeDx = p.mouseX - p.x;
      const eyeDy = p.mouseY - (p.y - 42);
      const angle = Math.atan2(eyeDy, eyeDx);
      const dist = Math.min(2.6, Math.hypot(eyeDx, eyeDy) / 48);
      const px = Math.cos(angle) * dist * p.facing;
      const py = Math.sin(angle) * dist;
      if (pupilLRef.current) pupilLRef.current.setAttribute("transform", `translate(${px.toFixed(2)}, ${py.toFixed(2)})`);
      if (pupilRRef.current) pupilRRef.current.setAttribute("transform", `translate(${px.toFixed(2)}, ${py.toFixed(2)})`);

      // Blinking
      if (now > p.nextBlinkTime) {
        p.blinkProgress = 1;
        p.nextBlinkTime = now + 2400 + Math.random() * 3400;
      }
      if (p.blinkProgress > 0) {
        p.blinkProgress = Math.max(0, p.blinkProgress - 0.14);
        const lidH = Math.sin(p.blinkProgress * Math.PI) * 14;
        if (eyelidLRef.current) eyelidLRef.current.setAttribute("height", lidH.toFixed(1));
        if (eyelidRRef.current) eyelidRRef.current.setAttribute("height", lidH.toFixed(1));
      }

      // Root position
      const hopBob =
        p.state === "PATROL"
          ? -Math.abs(Math.sin(p.walkPhase)) * 3.5
          : p.state === "CELEBRATING"
          ? -Math.abs(Math.sin(now * 0.014)) * 10
          : 0;

      if (inkyElRef.current) {
        inkyElRef.current.style.transform = `translate3d(${(p.x - MASCOT_W / 2).toFixed(1)}px, ${(
          p.y -
          MASCOT_H +
          hopBob
        ).toFixed(1)}px, 0)`;
      }
      if (bodyWrapRef.current) {
        bodyWrapRef.current.style.transform = `scaleX(${(p.facing * p.scaleX).toFixed(3)}) scaleY(${p.scaleY.toFixed(
          3
        )}) rotate(${(p.tiltDeg + p.spinDeg).toFixed(1)}deg)`;
      }

      // Popups positioning
      const popupX = Math.max(140, Math.min(window.innerWidth - 140, p.x));
      if (speechBubbleRef.current) {
        speechBubbleRef.current.style.top = `${Math.max(16, p.y - MASCOT_H - 90)}px`;
        speechBubbleRef.current.style.left = `${popupX}px`;
      }
      if (commandDeskRef.current) {
        commandDeskRef.current.style.top = `${Math.max(16, p.y - MASCOT_H - 90)}px`;
        commandDeskRef.current.style.left = `${popupX}px`;
      }

      // Shadow
      const isAirborne = p.state === "JUMPING" || p.state === "FALLING" || p.state === "DRAGGED";
      if (shadowRef.current) {
        shadowRef.current.style.opacity = isAirborne ? "0.12" : "0.5";
      }

      // Render FX Canvas Particles
      const canvas = fxCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          const pts = particlesRef.current;
          for (let i = pts.length - 1; i >= 0; i--) {
            const pt = pts[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.life -= pt.decay;
            if (pt.kind === "confetti") {
              pt.vy += 0.16;
              pt.vx *= 0.985;
              if (pt.rot !== undefined && pt.vrot !== undefined) pt.rot += pt.vrot;
            }
            if (pt.life <= 0) {
              pts.splice(i, 1);
              continue;
            }
            ctx.save();
            ctx.globalAlpha = Math.max(0, pt.life);
            if (pt.kind === "dust") {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
              ctx.fillStyle = pt.color;
              ctx.fill();
            } else if (pt.kind === "confetti") {
              ctx.translate(pt.x, pt.y);
              ctx.rotate(pt.rot || 0);
              ctx.fillStyle = pt.color;
              ctx.fillRect(-pt.size / 2, -pt.size / 3, pt.size, pt.size * 0.65);
            } else if (pt.kind === "zzz") {
              ctx.font = `700 ${Math.round(pt.size)}px "JetBrains Mono", monospace`;
              ctx.fillStyle = pt.color;
              ctx.fillText("z", pt.x, pt.y);
            } else if (pt.kind === "wind") {
              ctx.strokeStyle = pt.color;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(pt.x, pt.y);
              ctx.lineTo(pt.x, pt.y + pt.size);
              ctx.stroke();
            }
            ctx.restore();
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [askOpen, jumpToRandomPerch, landOnSurface, say, setMascotState]);

  // 9. Pointer Drag & Toss
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const p = phys.current;
    p.lastActivityTime = Date.now();
    if (p.state === "SLEEPING") {
      setMascotState(p.perchEl ? "PERCHED" : "PATROL");
    }

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    p.drag = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      vx: 0,
      vy: 0,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const p = phys.current;
    if (!p.drag) return;
    const dx = e.clientX - p.drag.lastX;
    const dy = e.clientY - p.drag.lastY;
    p.drag.vx = p.drag.vx * 0.45 + dx * 0.55;
    p.drag.vy = p.drag.vy * 0.45 + dy * 0.55;
    p.drag.lastX = e.clientX;
    p.drag.lastY = e.clientY;

    if (!p.drag.moved && Math.hypot(e.clientX - p.drag.startX, e.clientY - p.drag.startY) > 6) {
      p.drag.moved = true;
      p.perchEl = null;
      p.pendingPerchEl = null;
      setMascotState("DRAGGED");
      playChirp(480, 740, 0.06);
      say("Whoa! Watch the wet ink nib!", 2600);
    }

    if (p.drag.moved) {
      p.x = Math.max(36, Math.min(window.innerWidth - 36, e.clientX));
      p.y = Math.max(MASCOT_H + 8, Math.min(getFloorY(), e.clientY + 34));
      p.tiltDeg = Math.max(-28, Math.min(28, p.drag.vx * 1.8));
      p.facing = p.drag.vx >= 0 ? 1 : -1;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const p = phys.current;
    if (!p.drag) return;
    const d = p.drag;
    p.drag = null;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (d.moved) {
      p.vx = Math.max(-18, Math.min(18, d.vx * 1.15));
      p.vy = Math.max(-18, Math.min(12, d.vy * 1.15));
      p.pendingPerchEl = null;
      p.pendingInspectNote = null;
      setMascotState("FALLING");
      playChirp(620, 320, 0.1, "sine", 0.05);
    } else {
      // Single Poke
      const now = Date.now();
      p.pokeTimes = p.pokeTimes.filter((t) => now - t < 2500);
      p.pokeTimes.push(now);
      p.scaleX = 1.22;
      p.scaleY = 0.78;

      if (p.pokeTimes.length >= 4) {
        p.pokeTimes = [];
        setMascotState("DIZZY");
        playChirp(740, 260, 0.22, "sawtooth", 0.04);
        say("Whoa... too many pokes! Seeing spinning halftones!", 3200);
      } else {
        playChirp(520 + Math.random() * 200, 820 + Math.random() * 180, 0.07);
        const POKE_LINES = [
          "Hehe, that tickles my brass gears!",
          "Beep! Hover any card and I’ll audit the hype.",
          "96.4% signal, 100% charming.",
          'Double-click me to type commands like "backflip"!',
        ];
        say(POKE_LINES[Math.floor(Math.random() * POKE_LINES.length)], 3400);
      }
    }
  };

  // Dynamic Smart Chips based on current viewport section
  const getSmartChips = () => {
    const pages = [
      { id: "page-08", chips: [{ label: "📬 Subscribe", query: "how to subscribe to daily telegraph" }, { label: "🎯 Stamp Edition", query: "stamp" }, { label: "🗞️ Summary", query: "summarize today's full edition" }] },
      { id: "page-04", chips: [{ label: "💰 Top Bounty", query: "what is the highest paying open source bounty today?" }, { label: "💼 Kernel Roles", query: "list high signal engineering roles" }, { label: "🦀 Rust Schema", query: "explain Ollama Rust JSON schema bounty" }] },
      { id: "page-03", chips: [{ label: "🚨 Redis RCA", query: "explain the Redis cluster outage root cause" }, { label: "🛠️ Outage Patch", query: "how was the Redis rate limiter patched?" }, { label: "⚠️ CUDA OOM", query: "how to fix vLLM CUDA OOM during prefill?" }] },
      { id: "page-02", chips: [{ label: "🔥 Cheapest GPU", query: "what is the cheapest GPU hourly rate today?" }, { label: "📊 Sonnet vs GPT-4o", query: "compare Claude 3.5 Sonnet and GPT-4o" }, { label: "⚡ Token Cost", query: "which model has the lowest token cost?" }] },
      { id: "page-01", chips: [{ label: "⚡ Lead Breakdown", query: "summarize Beam MoE architecture" }, { label: "🤔 Is Beam Overhyped?", query: "hype check on Beam 501B" }, { label: "💻 Coding Agents", query: "explain multi-turn coding agents" }] },
    ];
    for (const p of pages) {
      const el = document.getElementById(p.id);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.65 && r.bottom >= window.innerHeight * 0.15) {
          return p.chips;
        }
      }
    }
    return [
      { label: "⚡ 60s Lead Wire", query: "summarize lead headline" },
      { label: "🤖 Who is Inky?", query: "who is Inky the mascot?" },
      { label: "🤸 Backflip", query: "backflip" },
    ];
  };

  // 10. Command handler
  const handleAskSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const targetQuery = customQuery !== undefined ? customQuery : query;
    const q = targetQuery.trim().toLowerCase();
    setQuery("");
    closeAsk();
    phys.current.lastActivityTime = Date.now();

    if (!q) return;
    if (q.includes("flip") || q.includes("backflip")) return doBackflip();
    if (q.includes("jump") || q.includes("perch")) return jumpToRandomPerch();
    if (q.includes("sleep") || q.includes("nap")) {
      setMascotState("SLEEPING");
      return say("Powering down ink nib... zZz", 2600);
    }
    if (q.includes("repo") || q.includes("github")) {
      const top = edition?.pages?.page3_repos?.topRepos?.[0];
      return say(
        top
          ? `Top repo today: ${top.repo} (${top.stars24h} stars, ${top.stack}).`
          : "Top repo: vllm-project/vllm-flash (+1,840 ★ in 24h) — speculative tree-attention in C++/CUDA."
      );
    }
    if (q.includes("model") || q.includes("ai")) {
      const m = edition?.pages?.page2_models?.releases?.[0];
      return say(
        m
          ? `Lead model: ${m.name} by ${m.lab} — ${m.verifiedDelta}.`
          : "Open-weight 32B models match closed frontier APIs locally on 24GB VRAM."
      );
    }
    if (q.includes("signal")) {
      return say(`Today's signal-to-noise ratio is ${edition?.signalRatio ?? 96.4}%. Zero doomscroll.`);
    }
    if (q.includes("sum") || q.includes("brief") || q.includes("head")) {
      const headline = edition?.pages?.page1_front?.headline;
      return say(
        headline ? `Front page: "${headline}"` : "Issue #142: Open-weight 32B models hit 48 tok/s locally."
      );
    }
    if (q.includes("stamp") || q.includes("celebrate")) {
      return triggerCelebration();
    }

    // Connect with Botpress Webchat AI for all questions
    const botpress = (window as unknown as {
      botpressWebChat?: {
        open?: () => void;
        setDraft?: (val: string) => void;
        focus?: () => void;
      };
    }).botpressWebChat;

    if (botpress?.open) {
      botpress.open();
      if (botpress.setDraft) botpress.setDraft(targetQuery.trim());
      botpress.focus?.();
      return say("Connecting to Inky's Botpress AI brain...", 3200);
    }

    say("Try: summarize, top repo, top model, signal, jump, or backflip.");
  };

  const palette = THEMES[theme];

  return (
    <>
      <style>{`
        @keyframes inkyBubbleFade {
          from { opacity: 0; transform: translate(-50%, 6px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes spinSpiral {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spiral-spin {
          transform-box: fill-box;
          transform-origin: center;
          animation: spinSpiral 0.85s linear infinite;
        }
      `}</style>

      {/* Particle Canvas for Dust, Confetti, zZz, Wind */}
      <canvas
        ref={fxCanvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[88] w-screen h-screen"
      />

      {/* Main Mascot Wrapper */}
      <div
        ref={inkyElRef}
        role="button"
        tabIndex={0}
        aria-label="Inky Press-Bot Mascot. Drag to move, click to poke, double-click to talk."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={toggleAskOpen}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 68,
          height: 76,
          zIndex: 9998,
          cursor: state === "DRAGGED" ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
          willChange: "transform",
          transformOrigin: "center bottom",
          filter: state === "DRAGGED" ? "drop-shadow(0 22px 28px rgba(0,0,0,0.8))" : "drop-shadow(0 10px 18px rgba(0,0,0,0.65))",
        }}
        title="Drag me, toss me, or double-click to ask about today's edition"
      >
        <div
          ref={bodyWrapRef}
          style={{
            width: "100%",
            height: "100%",
            transformOrigin: "50% 92%",
            willChange: "transform",
          }}
        >
          <svg
            viewBox="0 0 80 90"
            width="68"
            height="76"
            overflow="visible"
            style={{ display: "block" }}
          >
            <defs>
              <filter id="nibGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ground Contact Shadow */}
            <ellipse
              ref={shadowRef}
              cx="40"
              cy="86"
              rx="18"
              ry="3.5"
              fill="rgba(0,0,0,0.45)"
              style={{ transition: "opacity 0.2s ease" }}
            />

            {/* Bouncy Ink-Nib Antenna */}
            <g ref={antennaRef} style={{ transformOrigin: "40px 26px" }}>
              <line
                x1="40"
                y1="26"
                x2="40"
                y2="12"
                stroke={palette.stroke}
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              {/* Fountain Pen Ink Nib Tip */}
              <path
                d="M40 3 L45.5 11.5 L40 15.5 L34.5 11.5 Z"
                fill={palette.accent}
                stroke={palette.stroke}
                strokeWidth="1.6"
                strokeLinejoin="round"
                filter="url(#nibGlow)"
              />
              <line
                x1="40"
                y1="5"
                x2="40"
                y2="10.5"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.85"
              />
            </g>

            {/* Articulated Left & Right Legs */}
            <g ref={legLRef} style={{ transformOrigin: "31px 67px" }}>
              <path d="M31 67 L31 80" stroke={palette.limb} strokeWidth="5.5" strokeLinecap="round" />
              <rect x="24" y="77" width="11" height="5.5" rx="2.75" fill={palette.stroke} />
            </g>
            <g ref={legRRef} style={{ transformOrigin: "49px 67px" }}>
              <path d="M49 67 L49 80" stroke={palette.limb} strokeWidth="5.5" strokeLinecap="round" />
              <rect x="45" y="77" width="11" height="5.5" rx="2.75" fill={palette.stroke} />
            </g>

            {/* Articulated Left Arm */}
            <g ref={armLRef} style={{ transformOrigin: "18px 46px" }}>
              <path
                d="M18 46 Q9 51 11 60"
                fill="none"
                stroke={palette.limb}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="11" cy="60" r="3.4" fill={palette.stroke} />
            </g>

            {/* Vintage Press-Bot Rounded Body */}
            <g>
              {/* Outer Shell */}
              <rect
                x="16"
                y="24"
                width="48"
                height="45"
                rx="15"
                fill={palette.body}
                stroke={palette.stroke}
                strokeWidth="2.6"
              />
              {/* Subtle Bottom Depth Shading */}
              <path
                d="M18 55 Q40 62 62 55 L62 56 A13 13 0 0 1 49 67.5 L31 67.5 A13 13 0 0 1 18 56 Z"
                fill={palette.bodyShade}
                opacity="0.65"
              />
              {/* Mini Paper Slot on Chest */}
              <rect
                x="30"
                y="60.5"
                width="20"
                height="3.2"
                rx="1.6"
                fill={palette.stroke}
                opacity="0.7"
              />
              <rect
                x="33"
                y="61.2"
                width="8"
                height="1.8"
                rx="0.9"
                fill={palette.accent}
              />

              {/* Dark Visor Faceplate */}
              <rect x="22" y="30" width="36" height="26" rx="10" fill={palette.visor} />

              {/* Subtle Cheeks */}
              <circle cx="26.5" cy="50.5" r="2.6" fill={palette.cheek} />
              <circle cx="53.5" cy="50.5" r="2.6" fill={palette.cheek} />

              {/* EXPRESSION 1: NORMAL / TRACKING EYES */}
              {state !== "CELEBRATING" && state !== "SLEEPING" && state !== "DIZZY" && (
                <g>
                  {/* Left Eye */}
                  <circle cx="32.5" cy="42.5" r="6.4" fill={palette.eyeWhite} />
                  <g ref={pupilLRef}>
                    <circle cx="32.5" cy="42.5" r="3.1" fill={palette.pupil} />
                    <circle cx="33.8" cy="41.1" r="1.15" fill="#ffffff" />
                  </g>
                  {/* Right Eye */}
                  <circle cx="47.5" cy="42.5" r="6.4" fill={palette.eyeWhite} />
                  <g ref={pupilRRef}>
                    <circle cx="47.5" cy="42.5" r="3.1" fill={palette.pupil} />
                    <circle cx="48.8" cy="41.1" r="1.15" fill="#ffffff" />
                  </g>
                  {/* Animated Blink Eyelids */}
                  <rect
                    ref={eyelidLRef}
                    x="25.5"
                    y="35.5"
                    width="14"
                    height="0"
                    rx="3"
                    fill={palette.visor}
                  />
                  <rect
                    ref={eyelidRRef}
                    x="40.5"
                    y="35.5"
                    width="14"
                    height="0"
                    rx="3"
                    fill={palette.visor}
                  />
                </g>
              )}

              {/* EXPRESSION 2: HAPPY / CELEBRATING EYES (^ ^) */}
              {state === "CELEBRATING" && (
                <g>
                  <path
                    d="M27.5 44 Q32.5 37.5 37.5 44"
                    fill="none"
                    stroke={palette.eyeWhite}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M42.5 44 Q47.5 37.5 52.5 44"
                    fill="none"
                    stroke={palette.eyeWhite}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* EXPRESSION 3: SLEEPING EYES (u u) */}
              {state === "SLEEPING" && (
                <g>
                  <path
                    d="M27.5 43 Q32.5 47.5 37.5 43"
                    fill="none"
                    stroke={palette.eyeWhite}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  <path
                    d="M42.5 43 Q47.5 47.5 52.5 43"
                    fill="none"
                    stroke={palette.eyeWhite}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </g>
              )}

              {/* EXPRESSION 4: DIZZY SPIRAL EYES (@ @) */}
              {state === "DIZZY" && (
                <g>
                  <g className="spiral-spin">
                    <path
                      d="M32.5 42.5 m-4.5 0 a4.5 4.5 0 1 0 9 0 a3 3 0 1 0 -6 0 a1.5 1.5 0 1 0 3 0"
                      fill="none"
                      stroke={palette.accent}
                      strokeWidth="1.9"
                      strokeLinecap="round"
                    />
                  </g>
                  <g className="spiral-spin">
                    <path
                      d="M47.5 42.5 m-4.5 0 a4.5 4.5 0 1 0 9 0 a3 3 0 1 0 -6 0 a1.5 1.5 0 1 0 3 0"
                      fill="none"
                      stroke={palette.accent}
                      strokeWidth="1.9"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              )}
            </g>

            {/* Articulated Right Arm + Optional Props */}
            <g ref={armRRef} style={{ transformOrigin: "62px 46px" }}>
              <path
                d="M62 46 Q71 51 69 60"
                fill="none"
                stroke={palette.limb}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="69" cy="60" r="3.4" fill={palette.stroke} />

              {/* Prop 1: Magnifying Loupe (Visible during INSPECTING) */}
              {state === "INSPECTING" && (
                <g>
                  <line
                    x1="69"
                    y1="60"
                    x2="76"
                    y2="51"
                    stroke={palette.stroke}
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="79.5"
                    cy="45.5"
                    r="7.5"
                    fill="rgba(56, 189, 248, 0.25)"
                    stroke={palette.accent}
                    strokeWidth="2.2"
                  />
                  <path
                    d="M76 42.5 A4.5 4.5 0 0 1 81 40.5"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                </g>
              )}

              {/* Prop 2: Rubber Stamp (Visible during CELEBRATING) */}
              {state === "CELEBRATING" && (
                <g>
                  <rect
                    x="65"
                    y="45"
                    width="9"
                    height="10"
                    rx="3"
                    fill={palette.accent}
                    stroke={palette.stroke}
                    strokeWidth="1.5"
                  />
                  <rect
                    x="61.5"
                    y="54"
                    width="16"
                    height="5"
                    rx="1.5"
                    fill={palette.stroke}
                  />
                  <rect
                    x="62.5"
                    y="58"
                    width="14"
                    height="2.4"
                    rx="1"
                    fill={palette.accent}
                  />
                </g>
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* Floating Editorial Speech Bubble */}
      {speech && !askOpen && (
        <div
          ref={speechBubbleRef}
          data-inky-ui
          style={{
            position: "fixed",
            top: Math.max(16, phys.current.y - MASCOT_H - 90),
            left: Math.max(140, Math.min(typeof window !== "undefined" ? window.innerWidth - 140 : 200, phys.current.x)),
            transform: "translateX(-50%)",
            zIndex: 9999,
            minWidth: 170,
            maxWidth: 260,
            padding: "9px 13px",
            borderRadius: 14,
            background: "rgba(16, 16, 20, 0.90)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#f4f4f5",
            fontSize: 12,
            lineHeight: 1.45,
            boxShadow: "0 16px 36px rgba(0,0,0,0.6)",
            pointerEvents: "none",
            animation: "inkyBubbleFade 0.2s ease-out forwards",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF453A" }} />
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.15em", color: "#FF453A", textTransform: "uppercase", fontFamily: "monospace" }}>
              INKY · PRESS-BOT
            </span>
          </div>
          {speech}
        </div>
      )}

      {/* Mini Ask & Style Popover (Double-click Inky) */}
      {askOpen && (
        <form
          ref={commandDeskRef}
          data-inky-ui
          onSubmit={handleAskSubmit}
          style={{
            position: "fixed",
            top: Math.max(16, phys.current.y - MASCOT_H - 90),
            left: Math.max(140, Math.min(typeof window !== "undefined" ? window.innerWidth - 140 : 200, phys.current.x)),
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: 240,
            padding: 12,
            borderRadius: 16,
            background: "rgba(14, 14, 18, 0.94)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.20)",
            boxShadow: "0 20px 44px rgba(0,0,0,0.7)",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#FF453A", textTransform: "uppercase", fontFamily: "monospace" }}>
              COMMAND DESK
            </span>
            <button
              type="button"
              onClick={closeAsk}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask: backflip, top repo, summarize..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "7px 10px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: 12,
              outline: "none",
            }}
          />

          {/* Dynamic Page Smart Chips */}
          <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 4 }}>
            {getSmartChips().map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskSubmit(undefined, chip.query)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#f4f4f5",
                  borderRadius: 6,
                  padding: "2px 7px",
                  fontSize: 10,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s ease",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div
            style={{
              marginTop: 9,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 10.5,
            }}
          >
            <button
              type="button"
              onClick={() => {
                const order: MascotTheme[] = ["obsidian", "ink", "riso"];
                setTheme(order[(order.indexOf(theme) + 1) % order.length]);
                playChirp(520, 680, 0.06);
              }}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none",
                color: "#fff",
                borderRadius: 6,
                padding: "3px 8px",
                cursor: "pointer",
                fontSize: 10.5,
              }}
            >
              Style: {theme.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none",
                color: "#fff",
                borderRadius: 6,
                padding: "3px 8px",
                cursor: "pointer",
                fontSize: 10.5,
              }}
            >
              {muted ? "Muted" : "Sound On"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const botpress = (window as unknown as { botpressWebChat?: { open?: () => void; focus?: () => void } }).botpressWebChat;
              if (botpress?.open) {
                botpress.open();
                botpress.focus?.();
              }
              closeAsk();
              playChirp(520, 680, 0.08);
              say("Botpress AI console opened!", 2500);
            }}
            style={{
              width: "100%",
              marginTop: 9,
              padding: "7px 10px",
              borderRadius: 8,
              border: "1px solid rgba(255, 69, 58, 0.45)",
              background: "rgba(255, 69, 58, 0.16)",
              color: "#ff6b60",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "background 0.15s ease",
            }}
          >
            <span>💬</span> Ask Inky's Botpress AI
          </button>
        </form>
      )}
    </>
  );
};
