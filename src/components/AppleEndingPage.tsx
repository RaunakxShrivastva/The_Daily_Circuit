import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Star, CheckCircle2, Sparkles, Send, Mail, ShieldCheck, Heart } from "lucide-react";

const FEEDBACK_TAGS = [
  "⚡ High Compute Signal",
  "🔬 Arxiv Deep-Dives",
  "📜 Archival Typography",
  "🤖 Inky Press-Bot",
  "💥 Redis Post-Mortems",
  "💎 0% Slop / 100% Signal",
];

const RATING_MESSAGES: Record<number, string> = {
  5: "⭐️⭐️⭐️⭐️⭐️ Exceptional · Masterpiece of Technical Journalism",
  4: "⭐️⭐️⭐️⭐️ Great Edition · Sharp Engineering Takeaways",
  3: "⭐️⭐️⭐️ Solid Read · Keep Refining the Analysis",
  2: "⭐️⭐️ Fair · Could Use More Mathematical Rigor",
  1: "⭐️ Needs Improvement · Send Direct Feedback",
};

export function AppleEndingPage() {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "⚡ High Compute Signal",
    "💎 0% Slop / 100% Signal",
  ]);
  const [userComment, setUserComment] = useState("");
  const [email, setEmail] = useState("");
  const [submittedReview, setSubmittedReview] = useState(false);
  const [subscribed, setSubscribed] = useState(() => {
    return typeof window !== "undefined" ? !!localStorage.getItem("tdc_subscribed_email") : false;
  });

  const handleStarClick = (num: number) => {
    setRating(num);
    confetti({
      particleCount: 28,
      spread: 45,
      origin: { y: 0.8 },
      colors: ["#ffd700", "#ffa500", "#ffffff"],
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedReview(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.75 },
      colors: ["#10b981", "#3b82f6", "#ffffff"],
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    try {
      localStorage.setItem("tdc_subscribed_email", email);
    } catch (_) {}
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.85 },
      colors: ["#10b981", "#34d399", "#6ee7b7", "#ffffff"],
    });
  };

  return (
    <div className="relative h-full w-full bg-[#09090d] text-white flex flex-col font-sans select-none overflow-y-auto overflow-x-hidden p-3.5 sm:p-5">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-b from-blue-600/15 via-emerald-500/10 to-transparent blur-3xl rounded-full" />

      {/* macOS Window Title Bar */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-sm" />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[9.5px] font-mono tracking-wider text-zinc-300">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          <span>THE DAILY CIRCUIT · EDITION NO. 843</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>VERIFIED DISPATCH</span>
        </div>
      </div>

      {/* Hero Heading */}
      <div className="relative z-10 text-center mb-3">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400 uppercase tracking-widest mb-1">
          <span>Final Wire Reached</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          How was today&apos;s edition?
        </h2>
        <p className="text-[10px] text-zinc-400 max-w-sm mx-auto leading-relaxed mt-0.5">
          Rate the reporting quality, tag standout insights, and automate daily telegraph delivery.
        </p>
      </div>

      {/* Interactive 5-Star Rating Deck */}
      <div className="relative z-10 bg-white/[0.03] border border-white/[0.08] rounded-xl p-2.5 mb-3 text-center backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = (hoverRating || rating) >= star;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleStarClick(star)}
                className="p-1 transition-transform active:scale-90 hover:scale-110 focus:outline-none cursor-pointer"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    isFilled
                      ? "fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                      : "text-zinc-600 hover:text-zinc-400"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <div className="text-[10px] font-medium text-amber-300/90 font-mono">
          {RATING_MESSAGES[hoverRating || rating]}
        </div>

        {/* Tag chips */}
        <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
          {FEEDBACK_TAGS.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-[8.5px] px-2 py-0.5 rounded-full transition-all border cursor-pointer ${
                  active
                    ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300 font-medium shadow-sm"
                    : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Quick Review Feedback Message */}
        <form onSubmit={handleReviewSubmit} className="mt-2 flex gap-1.5">
          <input
            type="text"
            placeholder="Verdict for the editors (e.g. Loved the Beam MoE math)..."
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            disabled={submittedReview}
            className="flex-1 bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1 text-[9.5px] text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 font-sans"
          />
          <button
            type="submit"
            disabled={submittedReview}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[9px] font-mono tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {submittedReview ? (
              <span className="text-emerald-400">✓ Logged</span>
            ) : (
              <>
                <span>Send</span>
                <Send className="w-2.5 h-2.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Automated Email Dispatch Automation Card (Apple Capsule Design) */}
      <div className="relative z-10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.1] rounded-xl p-3 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
            <Mail className="w-3 h-3" />
          </div>
          <div>
            <h3 className="text-[11px] font-semibold tracking-tight text-white">
              Automate Daily Morning Intelligence
            </h3>
            <p className="text-[8.5px] text-zinc-400">
              Receive every morning issue at 06:00 IST automatically in your inbox.
            </p>
          </div>
        </div>

        {subscribed ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Automated Daily Dispatch Active</span>
            </div>
            <span className="text-[8.5px] text-emerald-400/80">Edition #844 queued</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-1.5 mt-2">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Enter telegraph email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/60 border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-[10px] text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/80 focus:ring-1 focus:ring-emerald-400/40 font-mono transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-[9.5px] font-mono uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Automate →
            </button>
          </form>
        )}
      </div>

      {/* Footer Colophon Note */}
      <div className="relative z-10 mt-auto pt-2.5 flex items-center justify-between text-[8px] font-mono text-zinc-500 border-t border-white/[0.05]">
        <span>THE DAILY CIRCUIT · VOL. XXIV</span>
        <span className="flex items-center gap-0.5 text-zinc-400">
          Handcrafted with <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500 inline" /> by Raunak Shrivastva
        </span>
        <span>ZERO ADS · 100% SIGNAL</span>
      </div>
    </div>
  );
}
