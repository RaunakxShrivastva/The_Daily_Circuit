import React, { useState } from "react";
import { Zap, Radio, ArrowUpRight, Flame, ShieldAlert, Cpu, Terminal } from "lucide-react";

interface TickerItem {
  tag: string;
  badgeColor: string;
  text: string;
  source: string;
  linkSection?: string;
}

const TICKER_ITEMS: TickerItem[] = [
  { tag: "BREAKING", badgeColor: "bg-red-600 text-white", text: "Beam MoE reaches 501B sparse weights across 128 distributed nodes; inference latency sub-24ms.", source: "Front Wire" },
  { tag: "GPU WEATHER", badgeColor: "bg-emerald-600 text-white", text: "NVIDIA H100 SXM5 spot price drops to $1.84/hr; Blackwell B200 4NP silicon yields exceed 88% at TSMC.", source: "Page 02" },
  { tag: "SEV-1 ALERT", badgeColor: "bg-amber-600 text-white", text: "Global checkout cluster recovered in 14m following emergency Redis Lua CAS hotpatch deployment.", source: "Page 03" },
  { tag: "SWE-BENCH", badgeColor: "bg-purple-600 text-white", text: "Claude 3.5 Sonnet CAS scores 49.2% on SWE-Bench Verified; GPT-4o trails by -7.8% on concurrent queues.", source: "Page 02" },
  { tag: "SILICON FOUNDRY", badgeColor: "bg-blue-600 text-white", text: "TSMC reveals A16 1.6nm node with SuperPower backside power delivery rails for 2026 tapeouts.", source: "Page 05" },
  { tag: "CASH BOUNTY", badgeColor: "bg-amber-500 text-neutral-950", text: "Active Bounty: $4,500 for Rust lock-free work-stealing deque implementation on GitHub.", source: "Page 04" },
  { tag: "ARXIV FLASH", badgeColor: "bg-neutral-700 text-white", text: "Speculative decoding achieves 2.4x speedup on vLLM v0.6 using Llama-3-70B draft pairing.", source: "Builder Corner" },
];

export function TelegraphTicker() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div 
      className="relative my-4 select-none font-mono overflow-hidden rounded-lg border border-[#2b261e] shadow-lg transition-all duration-300"
      style={{
        background: "linear-gradient(90deg, #12100d 0%, #1a1713 50%, #12100d 100%)",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top and Bottom Decorative Linotype Rules */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      <div className="flex items-center">
        {/* Left Fixed Badge: Telegraph Beacon */}
        <div className="flex-shrink-0 z-10 flex items-center gap-2 px-3.5 py-2 bg-[#1b1712] border-r border-amber-500/30 text-amber-400 shadow-md">
          <div className="relative">
            <Radio size={12} className="text-amber-400 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-[9.5px] uppercase font-bold tracking-widest text-neutral-200">
            TELEGRAPH WIRE
          </span>
          <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
            LIVE 24H
          </span>
        </div>

        {/* Center Marquee Tape */}
        <div className="flex-1 overflow-hidden relative py-2">
          {/* Edge Fade Gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#12100d] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#12100d] to-transparent z-10 pointer-events-none" />

          {/* Marquee Track: duplicated array for seamless infinite loop */}
          <div 
            className="flex items-center gap-8 whitespace-nowrap will-change-transform"
            style={{
              animation: "telegraphMarquee 38s linear infinite",
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-2.5 text-[11px] text-neutral-300">
                <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase ${item.badgeColor}`}>
                  {item.tag}
                </span>
                <span className="font-serif italic text-neutral-200">
                  {item.text}
                </span>
                <span className="text-[9px] text-amber-400/80 font-mono">
                  [{item.source}]
                </span>
                <span className="text-neutral-600 font-bold">✦</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Timestamp Badge */}
        <div className="hidden sm:flex flex-shrink-0 z-10 items-center gap-1.5 px-3 py-2 bg-[#1b1712] border-l border-amber-500/30 text-[9px] text-neutral-400">
          <Zap size={10} className="text-amber-400" />
          <span className="font-bold text-neutral-200">06:00 IST PRESS</span>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <style>{`
        @keyframes telegraphMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
