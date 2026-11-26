import React, { useState, useEffect, useRef, useCallback } from "react";

interface LiquidGlassNavbarProps {
  viewMode: "3d" | "miranda";
  onViewChange: (mode: "3d" | "miranda") => void;
  startExpandedTrigger?: boolean;
}

export function LiquidGlassNavbar({ viewMode, onViewChange }: LiquidGlassNavbarProps) {
  const [activeState, setActiveState] = useState<"collapsed" | "idle" | "search" | "audio">("collapsed");
  const [activeSection, setActiveSection] = useState("home");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const notchRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const clipPathRef = useRef<SVGPathElement>(null);
  const rimPathRef = useRef<SVGPathElement>(null);
  const progressPathRef = useRef<SVGPathElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // MacBook Notch Geometry Constants
  const EAR = 22;
  const RADIUS = 24;

  const STATES: Record<string, { w: number; h: number }> = {
    collapsed: { w: 180, h: 34 },
    idle: { w: 410, h: 46 },
    search: { w: 500, h: 124 },
    audio: { w: 460, h: 118 },
  };

  // Start in collapsed state initially
  const currentRef = useRef({ w: 180, h: 34 });
  const targetRef = useRef({ ...STATES.collapsed });
  const velRef = useRef({ w: 0, h: 0 });

  // 1. Initialize Real Native HTML5 Audio
  useEffect(() => {
    const audio = new Audio("/audio/daily_digest.mp3");
    audio.preload = "auto";
    audio.onplay = () => setIsPlayingAudio(true);
    audio.onpause = () => setIsPlayingAudio(false);
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = (e) => {
      console.warn("Audio load error:", e);
      setIsPlayingAudio(false);
    };
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // 2. Live Time Formatting (e.g. "6:14" or "13:10")
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Optical Refraction Normal Map for Liquid Glass
  useEffect(() => {
    const mapCanvas = document.createElement("canvas");
    mapCanvas.width = 256;
    mapCanvas.height = 128;
    const ctx = mapCanvas.getContext("2d");
    if (ctx) {
      const img = ctx.createImageData(256, 128);
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 256; x++) {
          const nx = (x / 255) * 2 - 1;
          const ny = (y / 127) * 2 - 1;
          const edgeX = Math.pow(Math.abs(nx), 3) * Math.sign(nx);
          const edgeY = Math.pow(Math.abs(ny), 3) * Math.sign(ny);
          const i = (y * 256 + x) * 4;
          img.data[i] = Math.round(128 + edgeX * 127); // R = X refraction
          img.data[i + 1] = Math.round(128 + edgeY * 127); // G = Y refraction
          img.data[i + 2] = 255;
          img.data[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      const normalMapEl = document.getElementById("notch-normal-map");
      if (normalMapEl) {
        normalMapEl.setAttribute("href", mapCanvas.toDataURL());
      }
    }
  }, []);

  // 4. Build MacBook Notch SVG Path (Concave ears at top + rounded bottom)
  const buildNotchPath = useCallback(
    (bodyW: number, bodyH: number, close: boolean) => {
      const totalW = bodyW + EAR * 2;
      const r = Math.min(RADIUS, bodyH / 2);
      const d = [
        `M 0 0`,
        `Q ${EAR} 0 ${EAR} ${EAR}`,
        `L ${EAR} ${bodyH - r}`,
        `Q ${EAR} ${bodyH} ${EAR + r} ${bodyH}`,
        `L ${EAR + bodyW - r} ${bodyH}`,
        `Q ${EAR + bodyW} ${bodyH} ${EAR + bodyW} ${bodyH - r}`,
        `L ${EAR + bodyW} ${EAR}`,
        `Q ${EAR + bodyW} 0 ${totalW} 0`,
      ].join(" ");
      return close ? `${d} Z` : d;
    },
    [EAR, RADIUS]
  );

  // 5. Spring Physics 60 FPS Animation Loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const stiffness = 0.16;
      const damping = 0.72;

      velRef.current.w = (velRef.current.w + (targetRef.current.w - currentRef.current.w) * stiffness) * damping;
      velRef.current.h = (velRef.current.h + (targetRef.current.h - currentRef.current.h) * stiffness) * damping;
      currentRef.current.w += velRef.current.w;
      currentRef.current.h += velRef.current.h;

      const shell = shellRef.current;
      const clipPathEl = clipPathRef.current;
      const rimPathEl = rimPathRef.current;
      const progressPathEl = progressPathRef.current;

      const totalW = currentRef.current.w + EAR * 2;
      if (shell) {
        shell.style.width = `${totalW.toFixed(1)}px`;
        shell.style.height = `${currentRef.current.h.toFixed(1)}px`;
      }

      if (clipPathEl) {
        clipPathEl.setAttribute("d", buildNotchPath(currentRef.current.w, currentRef.current.h, true));
      }
      if (rimPathEl) {
        rimPathEl.setAttribute("d", buildNotchPath(currentRef.current.w, currentRef.current.h, false));
      }

      // Reading Progress Line along Bottom Horizontal Lip
      if (progressPathEl) {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const pct = Math.min(1, Math.max(0, window.scrollY / maxScroll));
        const x1 = EAR + RADIUS;
        const x2 = EAR + currentRef.current.w - RADIUS;
        const len = Math.max(0, x2 - x1);
        progressPathEl.setAttribute("d", `M ${x1} ${currentRef.current.h - 1} L ${x2} ${currentRef.current.h - 1}`);
        progressPathEl.style.strokeDasharray = `${len}`;
        progressPathEl.style.strokeDashoffset = `${len * (1 - pct)}`;
        // Only show progress bar when expanded and scrolled
        progressPathEl.style.opacity = currentRef.current.w > 300 && pct > 0.01 ? "1" : "0";
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [buildNotchPath, EAR, RADIUS]);

  // 6. Scroll Tracking: At top -> Collapsed Notch; When scrolled -> Expands into Notch Navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 30) {
        // Expand into full notch navbar when scrolled
        setActiveState((prev) => {
          if (prev === "collapsed") {
            targetRef.current = { ...STATES.idle };
            return "idle";
          }
          return prev;
        });
      } else if (scrollY <= 12) {
        // Automatically collapse back into compact notch when at the top
        setActiveState((prev) => {
          if (prev === "idle") {
            targetRef.current = { ...STATES.collapsed };
            return "collapsed";
          }
          return prev;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [STATES]);

  // Handle Specular Sheen Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const shell = shellRef.current;
    if (!shell) return;
    const rect = shell.getBoundingClientRect();
    shell.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    shell.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  // State Transition Morph
  const setNotchState = useCallback((next: "collapsed" | "idle" | "search" | "audio") => {
    setActiveState((prev) => {
      const state = prev === next ? "idle" : next;
      targetRef.current = { ...STATES[state] };
      if (state === "search") {
        setTimeout(() => searchInputRef.current?.focus(), 80);
      }
      return state;
    });
  }, [STATES]);

  // Expand when clicked in collapsed mode
  const handleShellClick = () => {
    if (activeState === "collapsed") {
      setNotchState("idle");
    }
  };

  // Global Keyboard Shortcuts (⌘K / Ctrl+K & Escape)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setNotchState("search");
      } else if (e.key === "Escape") {
        if (activeState === "search" || activeState === "audio") {
          setNotchState("idle");
        } else if (activeState === "idle" && window.scrollY <= 30) {
          setNotchState("collapsed");
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeState, setNotchState]);

  // Section Scrolling
  const scrollToSection = (id: string, sectionKey: string) => {
    setActiveSection(sectionKey);
    if (viewMode !== "miranda") {
      onViewChange("miranda");
      setTimeout(() => {
        if (id === "home-stage" || id === "home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      if (id === "home-stage" || id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // 60-Second Real Audio Digest Play / Pause
  const togglePlayAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      audio.currentTime = 0;
      audio
        .play()
        .then(() => {
          setIsPlayingAudio(true);
        })
        .catch((err) => {
          console.warn("Audio playback error:", err);
          setIsPlayingAudio(false);
        });
    }
  };

  // Search input handler: Jump to matching section on Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    if (q.includes("model") || q.includes("compute") || q.includes("sparse")) {
      scrollToSection("page-02", "models");
    } else if (q.includes("repo") || q.includes("bounty") || q.includes("kernel")) {
      scrollToSection("page-04", "repos");
    } else if (q.includes("home") || q.includes("garden")) {
      scrollToSection("home-stage", "home");
    } else {
      scrollToSection("page-01", "front");
    }
    setNotchState("idle");
  };

  return (
    <>
      {/* Liquid Glass SVG Optical Filter & Dynamic ClipPath */}
      <svg width="0" height="0" style={{ position: "fixed", pointerEvents: "none" }} aria-hidden="true">
        <defs>
          <filter id="liquid-glass-refract" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feImage id="notch-normal-map" result="map" preserveAspectRatio="none" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale="18" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <clipPath id="notch-clip" clipPathUnits="userSpaceOnUse">
            <path id="notch-clip-path" ref={clipPathRef} d="" />
          </clipPath>
        </defs>
      </svg>

      {/* Dynamic Notch Top Navbar */}
      <nav 
        id="liquid-notch" 
        ref={notchRef} 
        data-state={activeState} 
        aria-label="Dynamic Notch Navigation"
        data-perch="true"
        data-mascot-note="MacBook Dynamic Notch. Liquid Glass optics with live 60fps spring geometry."
      >
        <div
          className={`notch-shell ${activeState === "collapsed" ? "cursor-pointer" : ""}`}
          ref={shellRef}
          onClick={handleShellClick}
          onMouseMove={handleMouseMove}
          data-perch="true"
          data-mascot-note="MacBook Dynamic Notch. Liquid Glass optics with live 60fps spring geometry."
        >
          {/* Optical Liquid Glass Backdrop */}
          <div className="notch-glass-bg" />
          <div className="notch-specular" />

          {/* Seamless Rim & Scroll Progress SVG */}
          <svg className="notch-overlay-svg" aria-hidden="true">
            <defs>
              <linearGradient id="notch-rim-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.12)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.45)" />
              </linearGradient>
            </defs>
            <path id="notch-rim-path" ref={rimPathRef} fill="none" stroke="url(#notch-rim-grad)" strokeWidth="1.25" />
            <path
              id="notch-progress-path"
              ref={progressPathRef}
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* ======================================================== */}
          {/* STATE A: COLLAPSED NOTCH (Clock / Status Display)        */}
          {/* ======================================================== */}
          {activeState === "collapsed" ? (
            <div className="notch-collapsed-content">
              <span className="notch-clock-text">
                {currentTime || "6:14"}
              </span>
            </div>
          ) : (
            /* ======================================================== */
            /* STATE B: EXPANDED NOTCH (Home, 3D Mode, Search, Audio)   */
            /* ======================================================== */
            <div className="notch-content">
              <div className="notch-top-row">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToSection("home-stage", "home");
                  }}
                  className="notch-brand cursor-pointer bg-transparent border-0 p-0 text-left"
                >
                  <span className="notch-dot" />
                  <span>CIRCUIT</span>
                </button>

                <div className="notch-links">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToSection("home-stage", "home");
                    }}
                    className={`notch-link cursor-pointer ${activeSection === "home" ? "active" : ""}`}
                  >
                    Home
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewChange(viewMode === "3d" ? "miranda" : "3d");
                    }}
                    className={`notch-link cursor-pointer ${viewMode === "3d" ? "active" : ""}`}
                    title="Toggle 3D Tactile Broadsheet / Miranda Reader"
                  >
                    {viewMode === "3d" ? "3D Paper" : "3D Mode"}
                  </button>
                </div>

                <div className="notch-actions">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotchState("search");
                    }}
                    className={`notch-btn cursor-pointer ${activeState === "search" ? "active" : ""}`}
                    aria-label="Search"
                  >
                    ⌘K
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotchState("audio");
                    }}
                    className={`notch-btn cursor-pointer ${activeState === "audio" ? "active" : ""}`}
                    aria-label="Audio Brief"
                  >
                    {isPlayingAudio ? "❚❚ 60s" : "60s"}
                  </button>
                </div>
              </div>

              {/* Expanded Search State Panel */}
              <div className="notch-panel" data-panel="search">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    id="notch-search-input"
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search issues, models, repos..."
                    autoComplete="off"
                  />
                </form>
                <div className="notch-hints">
                  <span>Press Enter to Navigate</span>
                  <span>ESC Close</span>
                </div>
              </div>

              {/* Expanded Audio State Panel with Real Audio Playback */}
              <div className="notch-panel" data-panel="audio">
                <div className="notch-audio-row">
                  <button type="button" id="notch-play-btn" onClick={togglePlayAudio} className="notch-play">
                    {isPlayingAudio ? "❚❚" : "▶"}
                  </button>
                  <div className="notch-audio-meta">
                    <strong>60-Second Daily Brief</strong>
                    <span>Issue #143 · AI &amp; Systems (Spoken Edition)</span>
                  </div>
                  <div className={`notch-eq ${isPlayingAudio ? "playing" : ""}`} id="notch-eq">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <style>{`
        #liquid-notch {
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif;
          color: #fff;
          user-select: none;
          pointer-events: none;
        }

        .notch-shell {
          position: relative;
          pointer-events: auto;
          filter: drop-shadow(0 18px 36px rgba(0, 0, 0, 0.45));
        }

        .notch-glass-bg {
          position: absolute;
          inset: 0;
          clip-path: url(#notch-clip);
          background: linear-gradient(
            180deg,
            rgba(22, 22, 26, 0.78) 0%,
            rgba(16, 16, 20, 0.62) 100%
          );
          backdrop-filter: url(#liquid-glass-refract) blur(24px) saturate(190%);
          -webkit-backdrop-filter: blur(24px) saturate(190%);
          box-shadow:
            inset 0 -1px 1px rgba(255, 255, 255, 0.28),
            inset 0 -12px 24px rgba(255, 255, 255, 0.05);
        }

        .notch-specular {
          position: absolute;
          inset: 0;
          clip-path: url(#notch-clip);
          pointer-events: none;
          background: radial-gradient(
            180px circle at var(--mx, 50%) var(--my, 20%),
            rgba(255, 255, 255, 0.22),
            transparent 65%
          );
          mix-blend-mode: screen;
        }

        .notch-overlay-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: visible;
        }

        /* Collapsed Notch Content */
        .notch-collapsed-content {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 24px;
          box-sizing: border-box;
          animation: notchFadeIn 0.25s ease-out forwards;
        }

        .notch-clock-text {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.95);
          letter-spacing: -0.01em;
          text-align: center;
        }

        /* Expanded Notch Content */
        .notch-content {
          position: relative;
          z-index: 2;
          padding: 0 32px; /* Clears the 22px concave ears on each side */
          box-sizing: border-box;
          animation: notchFadeIn 0.25s ease-out forwards;
        }

        @keyframes notchFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        .notch-top-row {
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .notch-brand {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #fff;
          text-decoration: none;
        }

        .notch-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ff453a;
          box-shadow: 0 0 10px #ff453a;
        }

        .notch-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .notch-link {
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          background: transparent;
          border: none;
          transition: color 0.2s ease, background 0.2s ease;
        }

        .notch-link:hover,
        .notch-link.active {
          color: #fff;
          background: rgba(255, 255, 255, 0.12);
        }

        .notch-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .notch-btn {
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.9);
          font-size: 11px;
          font-weight: 600;
          padding: 4px 9px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .notch-btn:hover,
        .notch-btn.active {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .notch-panel {
          display: none;
          padding: 8px 0 16px;
          opacity: 0;
          transform: translateY(-6px);
          transition: opacity 0.22s ease, transform 0.22s ease;
        }

        #liquid-notch[data-state="search"] .notch-panel[data-panel="search"],
        #liquid-notch[data-state="audio"] .notch-panel[data-panel="audio"] {
          display: block;
          opacity: 1;
          transform: translateY(0);
        }

        #notch-search-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.07);
          color: #fff;
          font-size: 13.5px;
          outline: none;
        }

        #notch-search-input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }

        .notch-hints {
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.45);
        }

        .notch-audio-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .notch-play {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: #fff;
          color: #000;
          font-size: 12px;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
        }

        .notch-play:hover {
          transform: scale(1.06);
        }

        .notch-audio-meta {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          flex: 1;
          text-align: left;
        }

        .notch-audio-meta span {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.55);
        }

        .notch-eq {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 18px;
        }

        .notch-eq i {
          display: block;
          width: 3px;
          height: 5px;
          border-radius: 2px;
          background: #fff;
          transition: height 0.15s ease;
        }

        .notch-eq.playing i {
          animation: notchEq 0.7s ease-in-out infinite alternate;
        }

        .notch-eq.playing i:nth-child(2) { animation-delay: 0.15s; }
        .notch-eq.playing i:nth-child(3) { animation-delay: 0.3s; }
        .notch-eq.playing i:nth-child(4) { animation-delay: 0.1s; }
        .notch-eq.playing i:nth-child(5) { animation-delay: 0.25s; }

        @keyframes notchEq {
          from { height: 4px; opacity: 0.5; }
          to { height: 18px; opacity: 1; }
        }
      `}</style>
    </>
  );
}
