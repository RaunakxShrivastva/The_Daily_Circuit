import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Terminal, Play, Pause, RotateCcw } from 'lucide-react';

export function IncidentReplayStage() {
  const [step, setStep] = useState(0); // 0: Normal, 1: Surge Spike, 2: Cursor Inspect, 3: Hotpatch, 4: Settled
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 2400);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="w-full bg-[#0d0c0a] border border-[#2a2620] rounded-lg overflow-hidden shadow-2xl font-mono text-xs my-4">
      {/* Window Title Bar */}
      <div className="bg-[#171512] px-3 py-2 border-b border-[#2a2620] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-neutral-400 text-[10px] tracking-wide ml-2">
            datadog — us-east-gateway-cluster (LIVE SEV-1 REPLAY)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-neutral-400 hover:text-white transition-colors"
            title={isPaused ? "Play animation" : "Pause animation"}
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>
          <button
            onClick={() => setStep(0)}
            className="text-neutral-400 hover:text-white transition-colors"
            title="Restart replay"
          >
            <RotateCcw size={12} />
          </button>
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
            step === 1 || step === 2
              ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}>
            {step === 1 || step === 2 ? 'SEV-1 ACTIVE' : 'OPTIMAL (14ms)'}
          </span>
        </div>
      </div>

      {/* Main Dashboard Stage */}
      <div className="p-4 relative min-h-[220px] flex flex-col justify-between select-none">
        {/* Metric Badges */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-[#14120e] p-2 rounded border border-[#23201a]">
            <div className="text-[9px] text-neutral-500 uppercase">p99 Latency</div>
            <div className={`text-sm font-bold transition-colors duration-300 ${
              step === 1 || step === 2 ? 'text-red-500' : 'text-emerald-400'
            }`}>
              {step === 0 && '16.2 ms'}
              {(step === 1 || step === 2) && '842.0 ms ↑'}
              {step === 3 && '120.4 ms ↓'}
              {step === 4 && '14.1 ms'}
            </div>
          </div>

          <div className="bg-[#14120e] p-2 rounded border border-[#23201a]">
            <div className="text-[9px] text-neutral-500 uppercase">HTTP 500 Rate</div>
            <div className={`text-sm font-bold transition-colors duration-300 ${
              step === 1 || step === 2 ? 'text-red-500' : 'text-neutral-300'
            }`}>
              {step === 1 || step === 2 ? '28.4% SURGE' : '0.00%'}
            </div>
          </div>

          <div className="bg-[#14120e] p-2 rounded border border-[#23201a]">
            <div className="text-[9px] text-neutral-500 uppercase">Redis Slot Lock</div>
            <div className="text-sm font-bold text-amber-500">
              {step === 1 || step === 2 ? 'SPLIT-BRAIN' : 'SYNCED'}
            </div>
          </div>

          <div className="bg-[#14120e] p-2 rounded border border-[#23201a]">
            <div className="text-[9px] text-neutral-500 uppercase">Worker Nodes</div>
            <div className="text-sm font-bold text-neutral-300">64 / 64 Online</div>
          </div>
        </div>

        {/* Live Animated SVG Latency Wave */}
        <div className="relative h-20 w-full bg-[#12100d] rounded border border-[#23201a] overflow-hidden flex items-end px-1">
          <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="spikeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={step === 1 || step === 2 ? '#ef4444' : '#10b981'} stopOpacity="0.4" />
                <stop offset="100%" stopColor={step === 1 || step === 2 ? '#ef4444' : '#10b981'} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Path changes dynamically based on step */}
            <path
              d={
                step === 0
                  ? "M 0 65 Q 100 62, 200 66 T 400 64 L 400 80 L 0 80 Z"
                  : step === 1 || step === 2
                  ? "M 0 65 Q 120 62, 180 12 T 260 18 Q 330 60, 400 58 L 400 80 L 0 80 Z"
                  : step === 3
                  ? "M 0 65 Q 150 40, 240 45 T 400 65 L 400 80 L 0 80 Z"
                  : "M 0 68 Q 120 66, 220 67 T 400 66 L 400 80 L 0 80 Z"
              }
              fill="url(#spikeGrad)"
              className="transition-all duration-700 ease-out"
            />
            <path
              d={
                step === 0
                  ? "M 0 65 Q 100 62, 200 66 T 400 64"
                  : step === 1 || step === 2
                  ? "M 0 65 Q 120 62, 180 12 T 260 18 Q 330 60, 400 58"
                  : step === 3
                  ? "M 0 65 Q 150 40, 240 45 T 400 65"
                  : "M 0 68 Q 120 66, 220 67 T 400 66"
              }
              fill="none"
              stroke={step === 1 || step === 2 ? '#ef4444' : '#10b981'}
              strokeWidth="2"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Incident Callout Marker */}
          {(step === 1 || step === 2) && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-950/90 border border-red-700 text-red-200 px-2 py-0.5 rounded text-[9.5px] flex items-center gap-1 shadow-lg animate-bounce">
              <AlertCircle size={10} className="text-red-400" />
              <span>Slot 14209 Partitioned: Token Buckets Reset</span>
            </div>
          )}

          {step === 4 && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-emerald-950/90 border border-emerald-700 text-emerald-200 px-2 py-0.5 rounded text-[9.5px] flex items-center gap-1 shadow-lg">
              <CheckCircle2 size={10} className="text-emerald-400" />
              <span>Lua CAS Atomic Lock Verified (14.1ms)</span>
            </div>
          )}
        </div>

        {/* Bottom Interactive Playback Strip */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-400 border-t border-[#23201a] pt-2">
          <div className="flex items-center gap-3">
            <span className={step === 0 ? 'text-white font-bold' : ''}>1. Steady State</span>
            <span>→</span>
            <span className={step === 1 || step === 2 ? 'text-red-400 font-bold' : ''}>2. Split-Brain Spike</span>
            <span>→</span>
            <span className={step === 3 ? 'text-amber-400 font-bold' : ''}>3. Hotpatch Deploy</span>
            <span>→</span>
            <span className={step === 4 ? 'text-emerald-400 font-bold' : ''}>4. Resolved</span>
          </div>

          <div className="text-neutral-500">
            Stageshow Live Replay Engine · 60fps
          </div>
        </div>

        {/* Faux Animated Cursor */}
        <div
          className="absolute pointer-events-none transition-all duration-700 ease-out z-20"
          style={{
            top: step === 0 ? '70%' : step === 1 ? '45%' : step === 2 ? '25%' : step === 3 ? '80%' : '75%',
            left: step === 0 ? '20%' : step === 1 ? '50%' : step === 2 ? '65%' : step === 3 ? '85%' : '90%',
            opacity: step === 0 ? 0.3 : 1
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
              fill="#ffffff"
              stroke="#000000"
              strokeWidth="1.5"
            />
          </svg>
          <div className="bg-black/90 text-white text-[8px] font-mono px-1 py-0.5 rounded ml-3 -mt-1 shadow whitespace-nowrap">
            {step === 1 ? "Inspecting Slot Lock" : step === 2 ? "Opening Log Drawer" : step === 3 ? "Clicking Deploy CAS Patch" : "Monitoring Latency"}
          </div>
        </div>
      </div>
    </div>
  );
}
