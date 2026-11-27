import React from "react";
import { Mail, Sparkles, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { CloudShader } from "./ui/cloud-shader";

export interface LiquidGlassScreenProps {
  email: string;
  setEmail: (val: string) => void;
  subscribed: boolean;
  setSubscribed: (val: boolean) => void;
  onFocusEmail?: () => void;
}

export function LiquidGlassScreen({
  email,
  setEmail,
  subscribed,
  setSubscribed,
  onFocusEmail,
}: LiquidGlassScreenProps) {
  const handleSubscribe = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    try {
      localStorage.setItem("tdc_subscribed_email", email);
    } catch (_) {}
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.8 },
      colors: ["#10b981", "#34d399", "#6ee7b7", "#ffffff"],
    });
  };

  const handleInputClick = () => {
    if (onFocusEmail) {
      onFocusEmail();
    } else {
      const el = document.getElementById("mechanical-keyboard-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className="relative min-h-[420px] sm:min-h-[460px] h-full w-full overflow-hidden select-none">
      {/* Aceternity WebGL Cloud Shader Motion Background */}
      <CloudShader
        className="absolute inset-0 h-full w-full min-h-0"
        speed={0.75}
        count={5}
        skyTopColor="#070814"
        skyBottomColor="#0f1b2b"
        cloudColor="#7dd3fc"
      />

      {/* Frosted Liquid Glass Surface Overlay */}
      <div className="relative z-10 min-h-[420px] sm:min-h-[460px] h-full w-full text-white flex flex-col justify-between font-sans p-4 sm:p-6 backdrop-blur-[3px] bg-black/20">
        {/* Top Minimal macOS Window Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.12]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-sm opacity-90" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-sm opacity-90" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-sm opacity-90" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] text-[9.5px] font-mono tracking-widest text-zinc-200 shadow-sm">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            <span>THE DAILY CIRCUIT · VOL. XXIV</span>
          </div>

          <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE PRESS</span>
          </div>
        </div>

        {/* Hero Content (Minimal Apple Style with Newspaper Value Prop) */}
        <div className="my-auto text-center px-3 py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.16] text-[9.5px] font-mono text-emerald-300 uppercase tracking-widest mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">PHYSICAL &amp; DIGITAL INTELLIGENCE</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] leading-tight">
            Read AI News in Real Ink. <br className="hidden sm:block" /> Delivered Daily.
          </h2>

          <p className="text-xs sm:text-[13px] text-zinc-200/90 max-w-lg mx-auto leading-relaxed mt-2.5 font-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Every 24 hours brings a model weight update, an Arxiv breakthrough, or a new repository. 
            Subscribe to receive our morning digital edition, or our weekly printed physical broadsheet delivered in an uncreased postal tube.
          </p>

          {/* Value proposition breakdown pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 mb-2 text-[10px] font-mono text-zinc-300">
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.07] border border-white/[0.12] backdrop-blur-md">
              🗞️ Morning Digital Edition (06:00 IST)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.07] border border-white/[0.12] backdrop-blur-md">
              📬 Weekly Printed Broadsheet in Postal Tube
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.07] border border-white/[0.12] backdrop-blur-md text-emerald-300">
              ⚡ 100% Curated Signal · Zero Slop
            </span>
          </div>

          {/* Minimal Liquid Glass Subscription Input Pill */}
          <div className="mt-4 max-w-lg mx-auto">
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-xl text-emerald-300 text-xs font-mono shadow-[0_12px_32px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Signed up for Edition No. 843 dispatch! Digital &amp; print delivery confirmed.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <div 
                  onClick={handleInputClick}
                  className="w-full flex items-center bg-black/40 hover:bg-black/50 backdrop-blur-2xl border border-white/[0.25] rounded-full p-1.5 transition-all shadow-[0_12px_36px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.4)] cursor-pointer focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/30"
                >
                  <div className="pl-3 pr-2 text-zinc-300">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="off"
                    data-1p-ignore="true"
                    data-lpignore="true"
                    data-bwignore="true"
                    data-form-type="other"
                    placeholder="Enter your telegraph email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onClick={handleInputClick}
                    name="telegraph_dispatch_addr"
                    required
                    className="w-full bg-transparent border-none text-white text-[11px] sm:text-xs placeholder-zinc-400 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-wider rounded-full shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    Subscribe Daily →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Minimal Liquid Glass Metric Badges */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/[0.12] text-[9px] font-mono text-zinc-300">
          <span className="px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-md border border-white/[0.12]">
            501B Beam MoE
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-md border border-white/[0.12]">
            $1.82/hr GPU Weather
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-md border border-white/[0.12]">
            Daily at 06:00 IST
          </span>
        </div>
      </div>
    </div>
  );
}
