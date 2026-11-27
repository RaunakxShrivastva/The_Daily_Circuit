import React, { useState, useRef } from "react";
import { MacbookScroll } from "./ui/macbook-scroll";
import { LiquidGlassScreen } from "./LiquidGlassScreen";
import { Keyboard } from "./ui/keyboard";
import { Volume2, Mail, CheckCircle2, Sparkles, Terminal } from "lucide-react";
import confetti from "canvas-confetti";

export function MacbookScrollDemo() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(() => {
    return typeof window !== "undefined" ? !!localStorage.getItem("tdc_subscribed_email") : false;
  });

  const keyboardInputRef = useRef<HTMLInputElement>(null);

  const scrollToKeyboard = () => {
    const el = document.getElementById("mechanical-keyboard-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        keyboardInputRef.current?.focus();
      }, 400);
    }
  };

  const handleSubscribe = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    try {
      localStorage.setItem("tdc_subscribed_email", email);
    } catch (_) {}
    confetti({
      particleCount: 75,
      spread: 85,
      origin: { y: 0.8 },
      colors: ["#10b981", "#34d399", "#6ee7b7", "#ffffff"],
    });
  };

  // Handle on-screen mechanical key clicks
  const handleVirtualKeyInput = (char: string, keyCode: string) => {
    if (keyCode === "Backspace") {
      setEmail((prev) => prev.slice(0, -1));
    } else if (keyCode === "Space") {
      setEmail((prev) => prev + " ");
    } else if (keyCode === "Enter") {
      if (email && email.includes("@")) {
        handleSubscribe();
      }
    } else if (keyCode === "Period") {
      setEmail((prev) => prev + ".");
    } else if (keyCode.startsWith("Key")) {
      const letter = keyCode.slice(3).toLowerCase();
      setEmail((prev) => prev + letter);
    } else if (keyCode.startsWith("Digit")) {
      setEmail((prev) => prev + keyCode.slice(5));
    } else if (keyCode === "Minus") {
      setEmail((prev) => prev + "-");
    } else if (char && char.length === 1 && /[a-zA-Z0-9@._-]/.test(char)) {
      setEmail((prev) => prev + char.toLowerCase());
    }
  };

  return (
    <div className="w-full flex flex-col items-center bg-transparent">
      {/* 1. 3D Scrolling MacBook — Opens and scales the Minimal Liquid Glass Website as user scrolls */}
      <div className="w-full overflow-hidden bg-transparent">
        <MacbookScroll showGradient={false}>
          <LiquidGlassScreen
            email={email}
            setEmail={setEmail}
            subscribed={subscribed}
            setSubscribed={setSubscribed}
            onFocusEmail={scrollToKeyboard}
          />
        </MacbookScroll>
      </div>

      {/* 2. SEPARATE MECHANICAL KEYBOARD SECTION DIRECTLY UNDERNEATH */}
      <section
        id="mechanical-keyboard-section"
        className="w-full max-w-5xl mx-auto my-16 px-4 sm:px-6 relative z-20"
      >
        <div 
          className="relative rounded-3xl p-6 sm:p-10 backdrop-blur-2xl overflow-hidden"
          style={{
            background: "rgba(13, 13, 18, 0.82)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Liquid Glass ambient lighting */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-emerald-500/15 via-blue-500/10 to-transparent blur-3xl rounded-full" />
          <div className="pointer-events-none absolute -bottom-24 right-10 w-80 h-48 bg-gradient-to-t from-teal-500/10 to-transparent blur-3xl rounded-full" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                  Telegraph Mechanical Keyboard Studio
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Tactile Sound &amp; Live Keystroke Deck</span>
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-lg">
                Type directly on your physical computer keyboard or click the switches below. 
                Full tactile mechanical click sound &amp; floating keystroke preview active.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono text-emerald-300">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audio Active (Cherry MX Thock)</span>
              </div>
            </div>
          </div>

          {/* Live Synchronized Email Input Bar with Glowing Liquid Glass Focus */}
          <div className="relative z-10 max-w-2xl mx-auto mb-6">
            {subscribed ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs sm:text-sm shadow-lg">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold">Automated Daily Dispatch Active!</span>
                </div>
                <span className="text-xs text-emerald-400/90 font-mono">Edition #844 queued</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-emerald-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    ref={keyboardInputRef}
                    type="email"
                    placeholder="Type email address here or use keyboard below..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    data-1p-ignore="true"
                    data-lpignore="true"
                    name="telegraph_address_keyboard"
                    required
                    className="w-full bg-black/80 border border-white/20 hover:border-emerald-500/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 font-mono transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <span>Automate Dispatch</span>
                  <span>→</span>
                </button>
              </form>
            )}
          </div>

          {/* Aceternity Interactive Mechanical Keyboard (Full Size, Centered, Never Chopped) */}
          <div className="relative z-10 w-full overflow-x-auto py-4 flex flex-col items-center justify-center">
            <div className="min-w-fit px-2">
              <Keyboard
                enableSound={true}
                showPreview={true}
                onKeyInput={handleVirtualKeyInput}
                className="my-3"
              />
            </div>
          </div>

          {/* Footer Instruction Note */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-zinc-400 gap-2">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Click any on-screen key or type directly on your physical keyboard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Web Audio API</span>
              <span>·</span>
              <span className="text-emerald-400">Zero Slop · 100% Signal</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
