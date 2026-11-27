import React, { useState, useEffect } from "react";
import { MacbookScroll } from "./ui/macbook-scroll";
import { LiquidGlassScreen } from "./LiquidGlassScreen";
import { Keyboard } from "./ui/keyboard";
import { Volume2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export function MacbookScrollDemo() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(() => {
    return typeof window !== "undefined" ? !!localStorage.getItem("tdc_subscribed_email") : false;
  });

  const handleSubscribe = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    try {
      localStorage.setItem("tdc_subscribed_email", email);
    } catch (_) {}
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.75 },
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
    } else if (char && char.length === 1 && /[a-zA-Z0-9@._\-]/.test(char)) {
      setEmail((prev) => prev + char.toLowerCase());
    }
  };

  // Listen for physical keyboard typing anywhere in section
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Backspace") {
        setEmail((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        if (email && email.includes("@")) {
          handleSubscribe();
        }
      } else if (e.key === " ") {
        e.preventDefault();
        setEmail((prev) => prev + " ");
      } else if (e.key.length === 1 && /[a-zA-Z0-9@._\-\+]/.test(e.key)) {
        setEmail((prev) => prev + e.key.toLowerCase());
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [email]);

  return (
    <div className="w-full flex flex-col items-center bg-transparent overflow-hidden">
      {/* 1. 3D Scrolling MacBook without "This Macbook..." title */}
      <MacbookScroll showGradient={false} title={null}>
        <LiquidGlassScreen
          email={email}
          setEmail={setEmail}
          subscribed={subscribed}
          setSubscribed={setSubscribed}
        />
      </MacbookScroll>

      {/* 2. Sleek Mechanical Keyboard Controls Strip */}
      <div className="flex items-center justify-between w-full max-w-2xl px-4 -mt-16 sm:-mt-24 mb-2 text-xs font-mono text-zinc-400 relative z-20">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Volume2 className="w-3.5 h-3.5" />
          <span>Mechanical Audio Active (Cherry MX Thock)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Type on keyboard or tap keys below</span>
        </div>
      </div>

      {/* 3. Aceternity Pure Mechanical Keyboard */}
      <div className="w-full overflow-x-auto py-2 flex flex-col items-center justify-center relative z-20">
        <div className="min-w-fit px-2">
          <Keyboard
            enableSound={true}
            showPreview={true}
            onKeyInput={handleVirtualKeyInput}
            className="my-1 shadow-2xl rounded-2xl border border-white/10"
          />
        </div>
      </div>
    </div>
  );
}
