import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Radio, X, ChevronRight, Mic, RotateCcw } from 'lucide-react';

export function MobileSatelliteStage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(44);
  const [waveHeights, setWaveHeights] = useState([8, 14, 22, 10, 18, 26, 12, 20]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize native HTML5 Audio element
  useEffect(() => {
    const audio = new Audio('/audio/daily_digest.mp3');
    audio.preload = 'auto';

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onTimeUpdate = () => {
      setCurrentTime(Math.floor(audio.currentTime));
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.floor(audio.duration));
      }
    };
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.floor(audio.duration));
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.src = '';
    };
  }, []);

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
    }, 110);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Playback failed:", err);
      });
    }
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(console.error);
  };

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center select-none font-mono">
      {/* Collapsed Docked Tab (Strictly Vertical Strip hugging the right screen edge with zero overlap) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex flex-col items-center justify-between w-[32px] py-4 bg-[#14120e] hover:bg-[#201c15] text-amber-400 border-y border-l border-[#3a3429] rounded-l-xl shadow-[-4px_6px_20px_rgba(0,0,0,0.6)] transition-all duration-200 hover:-translate-x-1 cursor-pointer select-none"
          title="Open 60s Audio Companion"
        >
          {/* Top Mic Icon + Status Indicator */}
          <div className="relative flex flex-col items-center">
            <Mic size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span
              className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-amber-500'
              }`}
            />
          </div>

          {/* Vertical Text rotated for vertical reading */}
          <div 
            className="my-3 text-[9px] font-mono font-bold tracking-widest text-neutral-300 group-hover:text-amber-300 uppercase whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {isPlaying ? `● PLAYING ${formatSec(currentTime)}` : 'AUDIO · 60S BRIEF'}
          </div>

          {/* Mini Waveform & Chevron */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-0.5 h-3">
              {[6, 12, 8].map((h, i) => (
                <span
                  key={i}
                  className={`w-0.5 rounded-full transition-all duration-100 ${
                    isPlaying ? 'bg-emerald-400' : 'bg-neutral-600'
                  }`}
                  style={{ height: isPlaying ? `${h}px` : '3px' }}
                />
              ))}
            </div>
            <ChevronRight size={12} className="text-neutral-500 group-hover:text-amber-400 rotate-180" />
          </div>
        </button>
      )}

      {/* Expanded Phone Frame (Slides out over drawer when opened, with Close button) */}
      {isOpen && (
        <div className="relative mr-4 animate-in slide-in-from-right-8 duration-200">
          <div className="w-[280px] bg-[#11100e] border-2 border-[#332f27] rounded-[36px] p-3 shadow-[-12px_16px_40px_rgba(0,0,0,0.85)] relative">
            {/* Outer Titanium Bezel Accent */}
            <div className="absolute inset-0 rounded-[34px] border border-white/10 pointer-events-none" />

            {/* Screen Frame */}
            <div className="bg-[#090807] rounded-[28px] p-4 flex flex-col justify-between min-h-[400px] border border-white/5 relative overflow-hidden">
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
                    {isPlaying ? 'PLAYING AUDIO' : 'HIGH FIDELITY'}
                  </span>
                </div>

                <p className="text-[10px] font-serif italic text-neutral-300 leading-snug">
                  "Beam MoE reaches 501B sparse weights; AMD server chips show 12x decade speedup."
                </p>

                {/* Animated Audio Waveform (Reacts live to audio playing) */}
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

                {/* Audio Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (currentTime / (duration || 44)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-neutral-400">
                    <span>{formatSec(currentTime)}</span>
                    <span>{formatSec(duration)}</span>
                  </div>
                </div>

                {/* Real Audio Play / Pause / Replay Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-[9.5px] transition-all border ${
                      isPlaying
                        ? 'bg-red-950/60 hover:bg-red-900/60 border-red-700/60 text-red-200'
                        : 'bg-amber-500 hover:bg-amber-400 border-amber-300 text-neutral-950 shadow-md'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <VolumeX size={12} className="text-red-300" />
                        <span>Pause Broadcast</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={12} className="text-neutral-950" />
                        <span>Listen to 60s Broadcast</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={restartAudio}
                    className="p-2 bg-[#201d17] hover:bg-[#2c2820] border border-[#3b352b] rounded-lg text-neutral-300 hover:text-white transition-colors"
                    title="Restart from beginning"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
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
