import React, { useState, useEffect, useRef } from "react";
import { Sun, Moon, X, ArrowUp } from "lucide-react";
import { askGroq } from "../../lib/groq";

interface ChatMessage {
  id: string;
  sender: "inky" | "user";
  text: string;
  cardHtml?: string;
  time?: string;
}

// 512x512 Studio-Lit Inky Press-Bot PNG Avatar Generator (Offscreen Canvas)
function createInkyAvatarDataUrl(): string {
  if (typeof document === "undefined") return "";
  const size = 512;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return "";

  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    ctx!.beginPath();
    ctx!.moveTo(x + r, y);
    ctx!.arcTo(x + w, y, x + w, y + h, r);
    ctx!.arcTo(x + w, y + h, x, y + h, r);
    ctx!.arcTo(x, y + h, x, y, r);
    ctx!.arcTo(x, y + w, x, y, r);
    ctx!.closePath();
  }

  // 1. Circular Studio Backdrop with Subtle Radial Rim Light
  ctx.save();
  ctx.beginPath();
  ctx.arc(256, 256, 256, 0, Math.PI * 2);
  ctx.clip();

  const bgGrad = ctx.createRadialGradient(256, 170, 30, 256, 256, 270);
  bgGrad.addColorStop(0, "#23242D");
  bgGrad.addColorStop(0.55, "#121318");
  bgGrad.addColorStop(1, "#07070A");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Soft Vermilion Ambient Halo behind Antenna
  const halo = ctx.createRadialGradient(256, 108, 8, 256, 108, 120);
  halo.addColorStop(0, "rgba(255, 69, 58, 0.45)");
  halo.addColorStop(0.5, "rgba(255, 69, 58, 0.12)");
  halo.addColorStop(1, "rgba(255, 69, 58, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  // 2. Fountain-Pen Ink Nib Antenna
  ctx.strokeStyle = "#6C6E7C";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(256, 178);
  ctx.lineTo(256, 118);
  ctx.stroke();

  // Glowing Vermilion Ink Nib Tip
  ctx.save();
  ctx.shadowColor = "rgba(255, 69, 58, 0.9)";
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.moveTo(256, 56);
  ctx.lineTo(290, 108);
  ctx.lineTo(256, 134);
  ctx.lineTo(222, 108);
  ctx.closePath();
  const nibGrad = ctx.createLinearGradient(222, 56, 290, 134);
  nibGrad.addColorStop(0, "#FF6961");
  nibGrad.addColorStop(0.55, "#FF453A");
  nibGrad.addColorStop(1, "#C8281E");
  ctx.fillStyle = nibGrad;
  ctx.fill();
  ctx.restore();

  // Crisp Nib Slit Highlight
  ctx.strokeStyle = "rgba(255, 255, 255, 0.88)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(256, 68);
  ctx.lineTo(256, 102);
  ctx.stroke();

  // 3. Matte Obsidian Rounded Press-Bot Chassis
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.72)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 16;
  roundRect(108, 172, 296, 260, 82);
  const bodyGrad = ctx.createLinearGradient(108, 172, 404, 432);
  bodyGrad.addColorStop(0, "#2B2D36");
  bodyGrad.addColorStop(0.45, "#191A21");
  bodyGrad.addColorStop(1, "#0F1015");
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.restore();

  // Specular Top Rim Stroke on Chassis
  roundRect(108, 172, 296, 260, 82);
  const rimGrad = ctx.createLinearGradient(256, 172, 256, 432);
  rimGrad.addColorStop(0, "rgba(255, 255, 255, 0.36)");
  rimGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.1)");
  rimGrad.addColorStop(1, "rgba(255, 255, 255, 0.04)");
  ctx.strokeStyle = rimGrad;
  ctx.lineWidth = 6;
  ctx.stroke();

  // 4. Deep Obsidian Glass Visor Faceplate
  roundRect(142, 208, 228, 152, 54);
  const visorGrad = ctx.createLinearGradient(142, 208, 370, 360);
  visorGrad.addColorStop(0, "#0B0C10");
  visorGrad.addColorStop(1, "#040406");
  ctx.fillStyle = visorGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Subtle Curved Glass Reflection on Top of Visor
  ctx.save();
  roundRect(150, 214, 212, 54, 34);
  const gloss = ctx.createLinearGradient(256, 214, 256, 268);
  gloss.addColorStop(0, "rgba(255, 255, 255, 0.14)");
  gloss.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gloss;
  ctx.fill();
  ctx.restore();

  // 5. Expressive Glowing White Eyes + Studio Catchlights
  function drawEye(cx: number, cy: number) {
    ctx!.save();
    ctx!.shadowColor = "rgba(255, 255, 255, 0.55)";
    ctx!.shadowBlur = 14;
    ctx!.beginPath();
    ctx!.ellipse(cx, cy, 29, 34, 0, 0, Math.PI * 2);
    ctx!.fillStyle = "#FFFFFF";
    ctx!.fill();
    ctx!.restore();

    ctx!.beginPath();
    ctx!.arc(cx + 3, cy + 2, 14, 0, Math.PI * 2);
    ctx!.fillStyle = "#090A0D";
    ctx!.fill();

    ctx!.beginPath();
    ctx!.arc(cx + 8, cy - 4, 5.5, 0, Math.PI * 2);
    ctx!.fillStyle = "#FFFFFF";
    ctx!.fill();

    ctx!.beginPath();
    ctx!.arc(cx - 3, cy + 7, 2.5, 0, Math.PI * 2);
    ctx!.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx!.fill();
  }

  drawEye(208, 286);
  drawEye(304, 286);

  // Subtle Warm Cheeks
  ctx.fillStyle = "rgba(255, 69, 58, 0.28)";
  ctx.beginPath();
  ctx.ellipse(172, 326, 13, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(340, 326, 13, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 6. Signature Mini Press-Slot on Chest
  roundRect(198, 384, 116, 18, 9);
  ctx.fillStyle = "#0B0C0F";
  ctx.fill();
  roundRect(210, 388, 48, 10, 5);
  ctx.fillStyle = "#FF453A";
  ctx.fill();

  // 7. Outer Circular Glass Badge Bevel
  ctx.beginPath();
  ctx.arc(256, 256, 250, 0, Math.PI * 2);
  const badgeRim = ctx.createLinearGradient(0, 0, 512, 512);
  badgeRim.addColorStop(0, "rgba(255, 255, 255, 0.42)");
  badgeRim.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
  badgeRim.addColorStop(1, "rgba(255, 69, 58, 0.35)");
  ctx.strokeStyle = badgeRim;
  ctx.lineWidth = 10;
  ctx.stroke();

  ctx.restore();
  return c.toDataURL("image/png");
}

export function InkyLiquidGlassChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"obsidian" | "light">("obsidian");
  const [isThinking, setIsThinking] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "inky",
      text: "Good afternoon. Issue #142 is off the press — 96.4% verified signal. What would you like to inspect first?",
    },
  ]);

  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize generated avatar
  useEffect(() => {
    const url = createInkyAvatarDataUrl();
    setAvatarUrl(url);
  }, []);

  // Listen for global open chat triggers
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 180);
    };
    window.addEventListener("daily-circuit:chat-opened", handleOpen);
    window.addEventListener("daily-circuit:open-chat", handleOpen);
    return () => {
      window.removeEventListener("daily-circuit:chat-opened", handleOpen);
      window.removeEventListener("daily-circuit:open-chat", handleOpen);
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Build Inky Reply logic with rich editorial cards + AI fallback
  const handleSend = async (rawQuery: string) => {
    const q = rawQuery.trim();
    if (!q || isThinking) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsThinking(true);

    const lower = q.toLowerCase();

    // Check pre-acquired editorial prompts first
    let replyText = "";
    let cardHtml: string | undefined = undefined;

    if (lower.includes("summarize") || lower.includes("issue") || lower.includes("142")) {
      replyText = "Here's your verified summary of Issue #142 — 96.4% signal, zero doomscroll:";
      cardHtml = `
        <div class="mt-2.5 p-3 rounded-2xl space-y-2 text-[12px]" style="background: var(--card-inner); border: 1px solid var(--divider);">
          <div class="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider" style="color: var(--fg-muted);">
            <span>EDITION #142 DIGEST</span>
            <span class="text-[#30D158] font-semibold">96.4% SIGNAL</span>
          </div>
          <p class="leading-snug"><strong>1. Local 70B Speedup:</strong> Parallel tree-decoding hits 48.2 tok/s on 16GB laptops with zero quantization drop.</p>
          <p class="leading-snug"><strong>2. Open-Weight Surge:</strong> DeepCoder-32B-v3 jumps +5.8% on SWE-bench Verified under Apache-2.0.</p>
          <p class="leading-snug"><strong>3. Silicon Move:</strong> NVIDIA open-sources its low-level FP4 tensor-core kernel profiler.</p>
        </div>
      `;
    } else if (lower.includes("github") || lower.includes("repo")) {
      replyText = "Today’s fastest-climbing open-source repository over the last 24 hours:";
      cardHtml = `
        <div class="mt-2.5 p-3 rounded-2xl space-y-2" style="background: var(--card-inner); border: 1px solid var(--divider);">
          <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-[12px] font-semibold">vllm-project/vllm-flash</span>
            <span class="font-mono text-[11px] font-bold text-[#30D158] tabular-nums">★ +1,840</span>
          </div>
          <p class="text-[12px] leading-snug" style="color: var(--fg-secondary);">
            C++ / CUDA drop-in speculative tree-attention runtime cutting local 70B inference latency by 3.1×.
          </p>
          <div class="flex items-center justify-between pt-1.5 font-mono text-[10px]" style="border-top: 1px solid var(--divider); color: var(--fg-muted);">
            <span>RUNNER-UP: zero-dep/tiny-vector</span>
            <span>+920 ★</span>
          </div>
        </div>
      `;
    } else if (lower.includes("accuracy") || lower.includes("delta") || lower.includes("model") || lower.includes("benchmark")) {
      replyText = "Contamination-audited benchmark deltas from Page 2 & 3:";
      cardHtml = `
        <div class="mt-2.5 p-3 rounded-2xl space-y-2.5 font-mono text-[11px]" style="background: var(--card-inner); border: 1px solid var(--divider);">
          <div>
            <div class="flex justify-between mb-1"><span>Claude Opus 4.6 · SWE</span><span class="tabular-nums font-bold">82.4% <span class="text-[#30D158]">+1.8%</span></span></div>
            <div class="h-1.5 rounded-full bg-white/10 overflow-hidden"><div class="h-full rounded-full bg-[#FF453A]" style="width: 82.4%;"></div></div>
          </div>
          <div>
            <div class="flex justify-between mb-1"><span>Gemini 3.1 Pro · GPQA</span><span class="tabular-nums font-bold">86.2% <span class="text-[#30D158]">+3.1%</span></span></div>
            <div class="h-1.5 rounded-full bg-white/10 overflow-hidden"><div class="h-full rounded-full bg-[#0A84FF]" style="width: 86.2%;"></div></div>
          </div>
          <div>
            <div class="flex justify-between mb-1"><span>DeepCoder-32B · Open</span><span class="tabular-nums font-bold">78.1% <span class="text-[#30D158]">+5.8%</span></span></div>
            <div class="h-1.5 rounded-full bg-white/10 overflow-hidden"><div class="h-full rounded-full bg-[#30D158]" style="width: 78.1%;"></div></div>
          </div>
        </div>
      `;
    } else if (lower.includes("60s") || lower.includes("brief")) {
      replyText = "Your 60-Second Morning Brief — read this, close the tab, and go build:";
      cardHtml = `
        <div class="mt-2.5 p-3 rounded-2xl space-y-1.5 text-[12px]" style="background: var(--card-inner); border: 1px solid var(--divider);">
          <div class="font-mono text-[10px] uppercase tracking-wider text-[#FF453A] font-semibold">06:00 IST PRESS DISPATCH</div>
          <div>• <strong>Models:</strong> 32B open weights now rival closed coding APIs locally.</div>
          <div>• <strong>Code:</strong> <span class="font-mono text-[11px]">vllm-flash</span> leads GitHub with +1,840 stars.</div>
          <div>• <strong>Build:</strong> Weekend guide pairs <span class="font-mono text-[11px]">tiny-vector</span> + AST chunking for offline repo Q&amp;A.</div>
        </div>
      `;
    } else {
      // Query Groq AI or smart knowledge fallback
      try {
        const groqAnswer = await askGroq(
          `You are Inky the Press-Bot, the witty editorial AI mascot of The Daily Circuit newspaper (Edition #142). Answer concisely in 2-3 sentences with witty engineering charm: ${q}`
        );
        replyText = groqAnswer || `I checked Issue #142 for "${q}". Try checking the top models or the 60s brief!`;
      } catch (_) {
        replyText = `I checked Issue #142 for "${q}". Try tapping one of the editorial chips below for verified benchmarks, top 24h GitHub repos, or the 60-second brief.`;
      }
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: "inky-" + Date.now(),
          sender: "inky",
          text: replyText,
          cardHtml,
        },
      ]);
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 650);
  };

  return (
    <>
      <style>{`
        /* Apple HIG & macOS Tahoe Liquid Glass Tokens */
        .inky-glass-theme-obsidian {
          --sheet-bg: rgba(20, 20, 24, 0.72);
          --sheet-border: rgba(255, 255, 255, 0.14);
          --sheet-highlight: rgba(255, 255, 255, 0.22);
          --sheet-shadow: 0 36px 84px -16px rgba(0, 0, 0, 0.78), 0 12px 32px -8px rgba(0, 0, 0, 0.55);
          --fg-primary: #F5F5F7;
          --fg-secondary: rgba(235, 235, 245, 0.68);
          --fg-muted: rgba(235, 235, 245, 0.44);
          --bubble-inky: rgba(255, 255, 255, 0.085);
          --bubble-inky-border: rgba(255, 255, 255, 0.11);
          --bubble-user: #0A84FF;
          --bubble-user-text: #FFFFFF;
          --chip-bg: rgba(255, 255, 255, 0.07);
          --chip-border: rgba(255, 255, 255, 0.12);
          --chip-hover: rgba(255, 255, 255, 0.14);
          --input-bg: rgba(255, 255, 255, 0.075);
          --input-border: rgba(255, 255, 255, 0.14);
          --divider: rgba(255, 255, 255, 0.09);
          --card-inner: rgba(255, 255, 255, 0.06);
        }

        .inky-glass-theme-light {
          --sheet-bg: rgba(250, 250, 252, 0.74);
          --sheet-border: rgba(255, 255, 255, 0.78);
          --sheet-highlight: rgba(255, 255, 255, 0.95);
          --sheet-shadow: 0 32px 72px -16px rgba(20, 20, 24, 0.22), 0 10px 26px -8px rgba(20, 20, 24, 0.12);
          --fg-primary: #1D1D1F;
          --fg-secondary: rgba(29, 29, 31, 0.68);
          --fg-muted: rgba(29, 29, 31, 0.45);
          --bubble-inky: rgba(255, 255, 255, 0.72);
          --bubble-inky-border: rgba(0, 0, 0, 0.06);
          --bubble-user: #007AFF;
          --bubble-user-text: #FFFFFF;
          --chip-bg: rgba(255, 255, 255, 0.62);
          --chip-border: rgba(0, 0, 0, 0.08);
          --chip-hover: rgba(255, 255, 255, 0.92);
          --input-bg: rgba(255, 255, 255, 0.75);
          --input-border: rgba(0, 0, 0, 0.1);
          --divider: rgba(0, 0, 0, 0.07);
          --card-inner: rgba(0, 0, 0, 0.04);
        }

        @keyframes inkyAppleGlowSpin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .inky-avatar-ring {
          position: relative;
          border-radius: 9999px;
          padding: 2px;
          background: transparent;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }

        .is-thinking .inky-avatar-ring {
          background: linear-gradient(120deg, #FF453A, #FF9F0A, #64D2FF, #BF5AF2, #FF453A);
          background-size: 260% 260%;
          animation: inkyAppleGlowSpin 2.2s ease infinite;
          box-shadow: 0 0 18px rgba(255, 69, 58, 0.38), 0 0 24px rgba(100, 210, 255, 0.24);
        }

        .is-thinking .inky-composer-shell {
          background: linear-gradient(115deg, #FF453A, #FF9F0A, #64D2FF, #FF453A);
          background-size: 260% 260%;
          animation: inkyAppleGlowSpin 2.4s ease infinite;
          box-shadow: 0 0 22px rgba(255, 69, 58, 0.22), 0 0 26px rgba(100, 210, 255, 0.2);
        }

        @keyframes inkyDotPulse {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .inky-typing-dot {
          width: 6.5px;
          height: 6.5px;
          border-radius: 50%;
          background: var(--fg-secondary);
          animation: inkyDotPulse 1.25s ease-in-out infinite;
        }
        .inky-typing-dot:nth-child(2) { animation-delay: 0.16s; }
        .inky-typing-dot:nth-child(3) { animation-delay: 0.32s; }
      `}</style>

      {/* =========================================================================
           1. APPLE LIQUID GLASS CHATBOT SHEET
           ========================================================================= */}
      <section
        id="chatSheet"
        role="dialog"
        aria-label="Inky Editorial Assistant"
        className={`inky-glass-theme-${theme} fixed bottom-[92px] right-[24px] w-[400px] max-w-[calc(100vw-24px)] h-[620px] max-h-[calc(100vh-116px)] z-[9990] rounded-[28px] flex flex-col overflow-hidden origin-bottom-right transition-all duration-300 ${
          isThinking ? "is-thinking" : ""
        } ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-6 scale-[0.88] pointer-events-none"
        }`}
        style={{
          background: "var(--sheet-bg)",
          backdropFilter: "blur(32px) saturate(195%)",
          WebkitBackdropFilter: "blur(32px) saturate(195%)",
          border: "1px solid var(--sheet-border)",
          boxShadow:
            "var(--sheet-shadow), inset 0 1px 0 var(--sheet-highlight), inset 0 -1px 0 rgba(255, 255, 255, 0.06)",
          color: "var(--fg-primary)",
        }}
      >
        {/* HEADER */}
        <header
          className="px-4 py-3.5 flex items-center justify-between gap-3 shrink-0"
          style={{ borderBottom: "1px solid var(--divider)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Inky PNG Avatar with Apple Intelligence Thinking Halo */}
            <div className="inky-avatar-ring shrink-0">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#101014]">
                {avatarUrl && (
                  <img src={avatarUrl} alt="Inky Press-Bot" className="w-full h-full object-cover block" />
                )}
              </div>
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#30D158] ring-2 ring-[#141418] animate-pulse"
                title="Online"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[15px] font-semibold tracking-[-0.02em] leading-tight truncate">Inky</h2>
                <span className="px-1.5 py-[1px] rounded-full text-[9.5px] font-mono font-semibold uppercase tracking-wider bg-[#FF453A]/15 text-[#FF453A]">
                  LIVE
                </span>
              </div>
              <p
                className="text-[11.5px] tracking-[-0.01em] truncate mt-0.5"
                style={{ color: "var(--fg-secondary)" }}
              >
                {isThinking ? "Reading Issue #142..." : "The Daily Circuit · Issue #142"}
              </p>
            </div>
          </div>

          {/* Controls: Theme Toggle + Close Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setTheme((t) => (t === "obsidian" ? "light" : "obsidian"))}
              className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-white/10 active:scale-95 cursor-pointer"
              style={{ color: "var(--fg-secondary)" }}
              title="Switch Obsidian Glass / Frosted Light"
              aria-label="Toggle Glass Theme"
            >
              {theme === "obsidian" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-white/10 active:scale-95 cursor-pointer"
              style={{ background: "var(--chip-bg)", color: "var(--fg-secondary)" }}
              title="Close Inky"
              aria-label="Close chat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* IMESSAGE-STYLE CONVERSATION STREAM */}
        <div
          ref={messagesScrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
          aria-live="polite"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.sender === "inky" && avatarUrl && (
                <img
                  src={avatarUrl}
                  alt="Inky"
                  className="w-6 h-6 rounded-full object-cover shrink-0 mb-0.5 ring-1 ring-white/15"
                />
              )}
              <div
                className={`max-w-[84%] px-3.5 py-2.5 text-[13.5px] leading-[1.44] tracking-[-0.01em] ${
                  m.sender === "user"
                    ? "rounded-[20px] rounded-br-[6px] shadow-[0_6px_18px_rgba(10,132,255,0.28)]"
                    : "rounded-[20px] rounded-bl-[6px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                }`}
                style={{
                  background: m.sender === "user" ? "var(--bubble-user)" : "var(--bubble-inky)",
                  color: m.sender === "user" ? "var(--bubble-user-text)" : "var(--fg-primary)",
                  border: m.sender === "inky" ? "1px solid var(--bubble-inky-border)" : "none",
                }}
              >
                <p className="m-0">{m.text}</p>
                {m.cardHtml && (
                  <div
                    dangerouslySetInnerHTML={{ __html: m.cardHtml }}
                    className="mt-1"
                  />
                )}
              </div>
            </div>
          ))}

          {/* 3-Dot Typing Indicator */}
          {isThinking && (
            <div className="flex items-end gap-2">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt="Inky"
                  className="w-6 h-6 rounded-full object-cover shrink-0 mb-0.5 ring-1 ring-white/15"
                />
              )}
              <div
                className="px-4 py-3 rounded-[20px] rounded-bl-[6px] flex items-center gap-1.5"
                style={{
                  background: "var(--bubble-inky)",
                  border: "1px solid var(--bubble-inky-border)",
                }}
              >
                <span className="inky-typing-dot" />
                <span className="inky-typing-dot" />
                <span className="inky-typing-dot" />
              </div>
            </div>
          )}
        </div>

        {/* QUICK-ACTION EDITORIAL CHIPS */}
        <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-2.5 scrollbar-none shrink-0">
          {[
            "Summarize Issue #142",
            "Top GitHub Repo",
            "Model Accuracy Delta",
            "60s Brief",
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-medium tracking-[-0.01em] transition-all hover:border-white/30 active:scale-95 cursor-pointer whitespace-nowrap"
              style={{
                color: "var(--fg-primary)",
                background: "var(--chip-bg)",
                border: "1px solid var(--chip-border)",
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* FLOATING PILL GLASS COMPOSER */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputVal);
          }}
          className="px-3.5 pb-3.5 pt-0.5 shrink-0"
        >
          <div
            className="inky-composer-shell rounded-full p-[1.5px] transition-all duration-300"
            style={{ background: "var(--input-border)" }}
          >
            <div
              className="flex items-center gap-2 py-1.5 pl-4 pr-1.5 rounded-full"
              style={{
                background: "var(--input-bg)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask Inky anything..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                autoComplete="off"
                className="flex-1 bg-transparent outline-none text-[13.5px] tracking-[-0.01em] placeholder:opacity-50"
                style={{ color: "var(--fg-primary)" }}
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isThinking}
                aria-label="Send message"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 disabled:opacity-30 disabled:scale-95 cursor-pointer text-white"
                style={{ background: "#0A84FF" }}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.4]" />
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* =========================================================================
           2. FLOATING BOTTOM-RIGHT CIRCULAR LAUNCHER (INKY PNG AVATAR)
           ========================================================================= */}
      <button
        id="launcherBtn"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle Inky Chatbot"
        title="Chat with Inky"
        className="fixed bottom-[20px] right-[24px] w-[60px] h-[60px] rounded-full z-[9980] flex items-center justify-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95"
        style={{
          background: "rgba(20, 20, 24, 0.72)",
          backdropFilter: "blur(24px) saturate(190%)",
          WebkitBackdropFilter: "blur(24px) saturate(190%)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxShadow:
            "0 18px 40px rgba(0, 0, 0, 0.55), 0 0 24px rgba(255, 69, 58, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.22)",
        }}
      >
        <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden">
          {avatarUrl && (
            <img src={avatarUrl} alt="Inky Press-Bot" className="w-full h-full object-cover block" />
          )}
        </div>
        <span
          className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#FF453A] ring-2 ring-[#0E0E12] animate-pulse"
        />
      </button>
    </>
  );
}
