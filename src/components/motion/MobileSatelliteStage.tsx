import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Radio, X, ChevronRight, Mic } from 'lucide-react';

const DIGEST_SCRIPT = 
  "Good morning. This is The Daily Circuit sixty-second audio briefing for today. " +
  "Top headlines: Beam Mixture of Experts reaches 501 billion sparse parameters. " +
  "AMD server processors demonstrate a twelve-times compute acceleration over the past decade. " +
  "In silicon news, TSMC A16 introduces backside power delivery. " +
  "Stay tuned for the next continuous broadsheet press at 06:00 IST.";

export function MobileSatelliteStage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveHeights, setWaveHeights] = useState([8, 14, 22, 10, 18, 26, 12, 20]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Waveform animation loop during real audio playback
  useEffect(() => {
    if (!isPlaying) {
      setWaveHeights([4, 4, 4, 4, 4, 4, 4, 4]);
      return;
    }
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

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Speech API: Real audio voice synthesis
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Your browser does not support audio synthesis.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(DIGEST_SCRIPT);
    utteranceRef.current = utterance;
    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('English'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center select-none font-mono">
      {/* Collapsed Docked Tab (Always visible on screen edge without covering text) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-[#14120e] hover:bg-[#1f1b14] text-amber-400 border-y border-l border-[#3a3429] px-3.5 py-3 rounded-l-2xl shadow-[-6px_8px_24px_rgba(0,0,0,0.6)] transition-all duration-200 hover:-translate-x-1"
          title="Open Mobile Audio Companion"
        >
          <div className="flex flex-col items-center">
            <div className="relative">
              <Mic size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
              {isPlaying && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <span className="text-[7.5px] uppercase tracking-wider text-neutral-400 mt-1 font-bold">
              AUDIO
            </span>
          </div>

          <div className="hidden sm:flex flex-col text-left border-l border-white/10 pl-2.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-[9px] font-bold text-neutral-200">60s Audio Brief</span>
            </div>
            <span className="text-[8px] text-amber-400/90 font-serif italic">
              {isPlaying ? 'Broadcasting live voice...' : '06:00 IST Edition · Listen'}
            </span>
          </div>

          <ChevronRight size={14} className="text-neutral-500 group-hover:text-amber-300 transition-colors" />
        </button>
      )}

      {/* Expanded Phone Frame (Slides out over drawer when opened, with Close button) */}
      {isOpen && (
        <div className="relative mr-4 animate-in slide-in-from-right-8 duration-200">
          <div className="w-[280px] bg-[#11100e] border-2 border-[#332f27] rounded-[36px] p-3 shadow-[-12px_16px_40px_rgba(0,0,0,0.85)] relative">
            {/* Outer Titanium Bezel Accent */}
            <div className="absolute inset-0 rounded-[34px] border border-white/10 pointer-events-none" />

            {/* Screen Frame */}
            <div className="bg-[#090807] rounded-[28px] p-4 flex flex-col justify-between min-h-[390px] border border-white/5 relative overflow-hidden">
              {/* Dynamic Island Pill + Close Button */}
              <div className="flex items-center justify-between">
                <div className="w-[124px] h-[26px] bg-black border border-white/15 rounded-full px-2.5 flex items-center justify-between shadow-lg mx-auto">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                    <span className="text-[8px] text-neutral-300 font-bold uppercase tracking-wider">06:00 IST</span>
                  </div>
                  <Radio size={11} className={isPlaying ? "text-emerald-400 animate-pulse" : "text-amber-500"} />
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-3.5 top-3.5 w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                  title="Dock to side"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Header Branding */}
              <div className="text-center mt-2.5">
                <span className="text-[8px] uppercase tracking-widest text-amber-500/80 font-bold">
                  Mobile Companion Desk
                </span>
                <h4 className="text-xs font-serif font-bold text-neutral-200 mt-0.5">
                  The Daily Circuit 24H
                </h4>
              </div>

              {/* Center Card: 60-Second Audio Teletype with Real Audio Speech */}
              <div className="my-auto bg-[#14120e] border border-[#2a2620] rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-500" /> Morning Digest
                  </span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold border ${
                    isPlaying 
                      ? 'text-emerald-300 bg-emerald-950/90 border-emerald-600 animate-pulse' 
                      : 'text-amber-400 bg-amber-950/60 border-amber-800'
                  }`}>
                    {isPlaying ? 'SPEAKING NOW' : 'VOICE SYNTH'}
                  </span>
                </div>

                <p className="text-[10px] font-serif italic text-neutral-300 leading-snug">
                  "Beam MoE reaches 501B sparse weights; AMD server chips show 12x decade speedup."
                </p>

                {/* Animated Audio Waveform (Reacts live to speech) */}
                <div className="flex items-center justify-center gap-1.5 h-8 pt-1">
                  {waveHeights.map((h, i) => (
                    <span
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-100 ${
                        isPlaying 
                          ? 'bg-gradient-to-t from-emerald-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                          : 'bg-neutral-700'
                      }`}
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>

                {/* Real Audio Play / Pause Button */}
                <button
                  onClick={toggleSpeech}
                  className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-[9.5px] transition-all border ${
                    isPlaying
                      ? 'bg-red-950/60 hover:bg-red-900/60 border-red-700/60 text-red-200'
                      : 'bg-amber-600/90 hover:bg-amber-500 border-amber-400 text-neutral-950 shadow-md'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <VolumeX size={12} className="text-red-300" />
                      <span>Pause Audio Broadcast</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={12} className="text-neutral-950" />
                      <span>Listen to 60s Broadcast</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Lockscreen Notification Preview */}
              <div className="bg-[#12110e]/80 border border-white/5 rounded-lg p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-amber-600/20 border border-amber-600/40 flex items-center justify-center text-[10px] font-serif font-bold text-amber-500">
                    DC
                  </div>
                  <div className="text-[8.5px] text-neutral-400 leading-tight">
                    <div className="font-bold text-neutral-200">Daily Circuit Intelligence</div>
                    <div>Next press in 05h 18m</div>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[8px] text-neutral-400 hover:text-amber-400 underline font-sans"
                >
                  Dock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
