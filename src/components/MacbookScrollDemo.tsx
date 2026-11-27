import React, { useState, useEffect, useRef } from "react";
import { MacbookScroll } from "./ui/macbook-scroll";
import { LiquidGlassScreen } from "./LiquidGlassScreen";
import { Keyboard } from "./ui/keyboard";
import { X, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";

export function MacbookScrollDemo() {
  const [email, setEmail] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [subscribed, setSubscribed] = useState(() => {
    return typeof window !== "undefined" ? !!localStorage.getItem("tdc_subscribed_email") : false;
  });

  const keyboardRef = useRef<HTMLDivElement>(null);

  // Close keyboard on Escape key
  useEffect(() => {
    if (!showKeyboard) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowKeyboard(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showKeyboard]);

  // Smoothly reveal keyboard when user clicks email
  useEffect(() => {
    if (showKeyboard) {
      setTimeout(() => {
        keyboardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  }, [showKeyboard]);

  const handleSubscribe = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setShowKeyboard(false);
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
    } else if (keyCode === "Escape") {
      setShowKeyboard(false);
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
      {/* 1. 3D Scrolling MacBook with Minimal Liquid Glass Website */}
      <div className="w-full overflow-hidden bg-transparent">
        <MacbookScroll showGradient={false}>
          <LiquidGlassScreen
            email={email}
            setEmail={setEmail}
            subscribed={subscribed}
            setSubscribed={setSubscribed}
            onFocusEmail={() => setShowKeyboard(true)}
          />
        </MacbookScroll>
      </div>

      {/* 2. Standalone Mechanical Keyboard (Appears when clicking email — NO extra card/page background) */}
      {showKeyboard && (
        <div
          ref={keyboardRef}
          className="w-full max-w-4xl mx-auto my-8 px-4 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom duration-300 relative z-20"
        >
          {/* Subtle minimal controls bar */}
          <div className="flex items-center justify-between w-full max-w-2xl px-2 mb-2 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Volume2 className="w-3.5 h-3.5" />
              <span>Mechanical Audio Active (Cherry MX)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowKeyboard(false)}
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] text-zinc-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Close (Esc)</span>
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Aceternity Pure Mechanical Keyboard (Completely clean, no container background) */}
          <div className="w-full overflow-x-auto py-2 flex flex-col items-center justify-center">
            <div className="min-w-fit px-2">
              <Keyboard
                enableSound={true}
                showPreview={true}
                onKeyInput={handleVirtualKeyInput}
                className="my-2"
              />
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 mt-2">
            ⌨️ Type on your physical keyboard or tap keys above · Press Enter to submit
          </div>
        </div>
      )}
    </div>
  );
}
