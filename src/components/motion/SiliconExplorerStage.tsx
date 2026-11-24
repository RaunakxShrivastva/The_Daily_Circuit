import { useState } from 'react';
import { Layers, Cpu, ShieldCheck } from 'lucide-react';

export function SiliconExplorerStage() {
  const [activeLayer, setActiveLayer] = useState<'all' | 'compute' | 'memory' | 'power'>('all');

  const layers = [
    { id: 'all', label: 'Composite Die' },
    { id: 'compute', label: 'Dual TSMC 4NP Dies' },
    { id: 'memory', label: '8x HBM3e (8.0 TB/s)' },
    { id: 'power', label: 'Backside Power (BSPDN)' },
  ];

  return (
    <div className="w-full bg-[#0d0c0a] border border-[#2a2620] rounded-lg overflow-hidden shadow-2xl font-mono text-xs my-4 select-none">
      {/* Header Bar */}
      <div className="bg-[#171512] px-3 py-2 border-b border-[#2a2620] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={13} className="text-indigo-400" />
          <span className="text-neutral-300 text-[10.5px] font-semibold">
            DIE EXPLORER: NVIDIA Blackwell B200 &amp; TSMC A16 Physical Packaging
          </span>
        </div>

        {/* Layer Selector Tabs */}
        <div className="flex gap-1">
          {layers.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLayer(l.id as any)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                activeLayer === l.id
                  ? 'bg-indigo-900 text-indigo-200 border border-indigo-700'
                  : 'text-neutral-400 hover:text-neutral-200 bg-[#14120e]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wafer / Die Floorplan Visualizer */}
      <div className="p-4 bg-[#090807] flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Die Layout Graphic */}
        <div className="relative w-[320px] h-[200px] bg-[#14120e] border-2 border-[#2b271f] rounded-lg p-3 flex items-center justify-center">
          {/* Central NVLink High-Speed Interconnect Bridge */}
          <div className={`absolute inset-x-8 top-1/2 -translate-y-1/2 h-4 bg-indigo-950/80 border-y border-indigo-500/50 flex items-center justify-center text-[8px] text-indigo-300 font-bold tracking-widest z-10 transition-opacity duration-300 ${
            activeLayer === 'all' || activeLayer === 'compute' ? 'opacity-100' : 'opacity-20'
          }`}>
            10 TB/s NVLINK-5 CHIP-TO-CHIP BUS
          </div>

          {/* Left Compute Die */}
          <div className={`w-[110px] h-[130px] rounded border border-indigo-500/40 mr-2 flex flex-col items-center justify-center text-center p-1.5 transition-all duration-300 ${
            activeLayer === 'all' || activeLayer === 'compute'
              ? 'bg-indigo-950/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
              : 'bg-[#100f0d] opacity-25'
          }`}>
            <span className="text-[9px] font-bold text-indigo-300">Compute Die 0</span>
            <span className="text-[7.5px] text-neutral-400 mt-1">104 Billion Transistors (TSMC 4NP)</span>
          </div>

          {/* Right Compute Die */}
          <div className={`w-[110px] h-[130px] rounded border border-indigo-500/40 ml-2 flex flex-col items-center justify-center text-center p-1.5 transition-all duration-300 ${
            activeLayer === 'all' || activeLayer === 'compute'
              ? 'bg-indigo-950/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
              : 'bg-[#100f0d] opacity-25'
          }`}>
            <span className="text-[9px] font-bold text-indigo-300">Compute Die 1</span>
            <span className="text-[7.5px] text-neutral-400 mt-1">104 Billion Transistors (TSMC 4NP)</span>
          </div>

          {/* Top HBM3e Stacks */}
          <div className={`absolute top-1 inset-x-6 flex justify-between px-2 transition-all duration-300 ${
            activeLayer === 'all' || activeLayer === 'memory' ? 'opacity-100' : 'opacity-20'
          }`}>
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className="w-12 h-3.5 bg-emerald-950/80 border border-emerald-500/50 text-[7px] text-emerald-300 rounded flex items-center justify-center font-bold">
                HBM3e #{i}
              </span>
            ))}
          </div>

          {/* Bottom HBM3e Stacks */}
          <div className={`absolute bottom-1 inset-x-6 flex justify-between px-2 transition-all duration-300 ${
            activeLayer === 'all' || activeLayer === 'memory' ? 'opacity-100' : 'opacity-20'
          }`}>
            {[5, 6, 7, 8].map((i) => (
              <span key={i} className="w-12 h-3.5 bg-emerald-950/80 border border-emerald-500/50 text-[7px] text-emerald-300 rounded flex items-center justify-center font-bold">
                HBM3e #{i}
              </span>
            ))}
          </div>

          {/* Backside Power Overlay Indicator */}
          {activeLayer === 'power' && (
            <div className="absolute inset-0 bg-amber-950/30 border-2 border-amber-500/60 rounded flex items-center justify-center z-20 animate-pulse">
              <span className="bg-black/90 text-amber-400 px-2 py-1 rounded text-[9px] font-bold border border-amber-500">
                ⚡ Backside Power Delivery: VDD Rails Routed to Rear
              </span>
            </div>
          )}
        </div>

        {/* Architecture Spec Callouts */}
        <div className="flex-1 space-y-2 text-[10.5px]">
          <div className="bg-[#14120e] p-2 rounded border border-[#23201a]">
            <div className="text-neutral-400 text-[9px] uppercase font-bold">Unified Memory Bandwidth</div>
            <div className="text-sm font-bold text-emerald-400">8.0 TB/s (192GB HBM3e Stack)</div>
            <div className="text-[9px] text-neutral-500 mt-0.5">Zero bus bottlenecks across 16-high CoWoS die interposers.</div>
          </div>

          <div className="bg-[#14120e] p-2 rounded border border-[#23201a]">
            <div className="text-neutral-400 text-[9px] uppercase font-bold">Backside Power Delivery (BSPDN)</div>
            <div className="text-sm font-bold text-amber-400">-30% IR Voltage Sag Resistance</div>
            <div className="text-[9px] text-neutral-500 mt-0.5">Allows transistors to run at peak clock limits without thermal throttling.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
