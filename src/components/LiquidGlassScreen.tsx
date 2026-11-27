import React from "react";
import { Mail, Sparkles, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

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
    <div className="relative h-full w-full bg-[#08080c] text-white flex flex-col justify-between font-sans select-none overflow-hidden p-4 sm:p-6">
      {/* Liquid Glass Background Gradients & Specular Glow */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-br from-indigo-500/25 via-sky-500/15 to-transparent blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-tl from-emerald-500/20 via-teal-500/10 to-transparent blur-3xl rounded-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))]" />

      {/* Top Minimal macOS Window Bar */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-sm opacity-90" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-sm opacity-90" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-sm opacity-90" />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.12] text-[9.5px] font-mono tracking-widest text-zinc-300">
          <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
          <span>THE DAILY CIRCUIT · VOL. XXIV</span>
        </div>

        <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE PRESS</span>
        </div>
      </div>

      {/* Hero Content (Minimal Apple Style) */}
      <div className="relative z-10 my-auto text-center px-2 py-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/[0.12] text-[9px] font-mono text-zinc-300 uppercase tracking-widest mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <span className="text-emerald-400 font-bold">100% SIGNAL</span>
          <span className="text-zinc-600">·</span>
          <span>ZERO SLOP</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent leading-snug">
          The Intelligence Age, <br />
          In Digital &amp; Physical Ink.
        </h2>

        <p className="text-[11px] text-zinc-400 max-w-sm mx-auto leading-relaxed mt-2 font-normal">
          Every 24 hours brings an architectural leap. Curated with mathematical rigor. Delivered daily.
        </p>

        {/* Minimal Liquid Glass Subscription Input Pill */}
        <div className="mt-5 max-w-md mx-auto">
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl text-emerald-300 text-xs font-mono shadow-[0_12px_32px_rgba(16,185,129,0.15)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">Automated Daily Dispatch Active</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <div 
                onClick={handleInputClick}
                className="w-full flex items-center bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.18] rounded-full p-1.5 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.35)] cursor-pointer focus-within:border-emerald-400/80 focus-within:ring-2 focus-within:ring-emerald-400/20"
              >
                <div className="pl-3 pr-2 text-zinc-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  placeholder="Enter email to automate delivery..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onClick={handleInputClick}
                  autoComplete="off"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  name="telegraph_address_screen"
                  required
                  className="w-full bg-transparent border-none text-white text-[11px] placeholder-zinc-500 focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-mono font-bold text-[10px] uppercase tracking-wider rounded-full shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  Automate →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Minimal Liquid Glass Metric Badges */}
      <div className="relative z-10 flex items-center justify-center gap-2 pt-2 border-t border-white/[0.08] text-[9px] font-mono text-zinc-400">
        <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
          501B Beam MoE
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
          $1.82/hr GPU Weather
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
          Daily at 06:00 IST
        </span>
      </div>
    </div>
  );
}
