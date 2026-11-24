import { useState, useEffect } from 'react';
import { Volume2, Sparkles, Radio } from 'lucide-react';

export function MobileSatelliteStage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [waveHeights, setWaveHeights] = useState([8, 14, 22, 10, 18, 26, 12, 20]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setWaveHeights([
        Math.floor(Math.random() * 20) + 6,
        Math.floor(Math.random() * 26) + 8,
        Math.floor(Math.random() * 28) + 10,
        Math.floor(Math.random() * 20) + 6,
        Math.floor(Math.random() * 24) + 8,
        Math.floor(Math.random() * 30) + 10,
        Math.floor(Math.random() * 18) + 6,
        Math.floor(Math.random() * 26) + 8,
      ]);
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-[280px] bg-[#11100e] border-2 border-[#332f27] rounded-[36px] p-3 shadow-2xl relative select-none font-mono">
      {/* Outer Titanium Bezel Accent */}
      <div className="absolute inset-0 rounded-[34px] border border-white/10 pointer-events-none" />

      {/* Screen Frame */}
      <div className="bg-[#090807] rounded-[28px] p-4 flex flex-col justify-between min-h-[380px] border border-white/5 relative overflow-hidden">
        {/* Dynamic Island Pill */}
        <div className="mx-auto w-[124px] h-[28px] bg-black border border-white/15 rounded-full px-2.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] text-neutral-300 font-bold uppercase tracking-wider">06:00 IST</span>
          </div>
          <Radio size={11} className="text-amber-500 animate-pulse" />
        </div>

        {/* Header Branding */}
        <div className="text-center mt-3">
          <span className="text-[8px] uppercase tracking-widest text-amber-500/80 font-bold">
            Mobile Companion Desk
          </span>
          <h4 className="text-xs font-serif font-bold text-neutral-200 mt-0.5">
            The Daily Circuit 24H
          </h4>
        </div>

        {/* Center Card: 60-Second Audio Teletype */}
        <div className="my-auto bg-[#14120e] border border-[#2a2620] rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} className="text-amber-500" /> Morning Digest
            </span>
            <span className="text-[8px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded font-bold border border-emerald-800">
              LIVE SYNTH
            </span>
          </div>

          <p className="text-[10px] font-serif italic text-neutral-300 leading-snug">
            "Beam MoE reaches 501B sparse weights; AMD server chips show 12x decade speedup."
          </p>

          {/* Animated Audio Waveform */}
          <div className="flex items-center justify-center gap-1 h-8 pt-1">
            {waveHeights.map((h, i) => (
              <span
                key={i}
                className="w-1.5 bg-gradient-to-t from-amber-600 to-amber-300 rounded-full transition-all duration-100"
                style={{ height: isPlaying ? `${h}px` : '4px' }}
              />
            ))}
          </div>

          {/* Play / Pause Toggle Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-full bg-[#201d17] hover:bg-[#2c2820] border border-[#3b352b] text-neutral-200 text-[9px] py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all"
          >
            <Volume2 size={11} className={isPlaying ? "text-amber-400" : "text-neutral-500"} />
            <span>{isPlaying ? "Pause 60s Broadcast" : "Listen to Broadcast"}</span>
          </button>
        </div>

        {/* Bottom Lockscreen Notification Preview */}
        <div className="bg-[#12110e]/80 border border-white/5 rounded-lg p-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-600/20 border border-amber-600/40 flex items-center justify-center text-[10px] font-serif font-bold text-amber-500">
            DC
          </div>
          <div className="flex-1 text-[8.5px] text-neutral-400 leading-tight">
            <div className="font-bold text-neutral-200">Daily Circuit Intelligence</div>
            <div>Next broadsheet press in 05h 18m</div>
          </div>
        </div>
      </div>
    </div>
  );
}
