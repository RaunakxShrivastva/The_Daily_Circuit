import { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, Code2 } from 'lucide-react';

export function PromptDuelStage() {
  const [typedChars, setTypedChars] = useState(0);

  const sonnetCode = `pub struct LockFreeQueue<T> {
    head: CachePadded<AtomicPtr<Node<T>>>,
    tail: CachePadded<AtomicPtr<Node<T>>>,
}

impl<T> LockFreeQueue<T> {
    pub fn push(&self, val: T) {
        let node = Box::into_raw(Box::new(Node::new(val)));
        loop {
            let tail = self.tail.load(Acquire);
            let next = (*tail).next.load(Acquire);
            if self.tail.compare_exchange_weak(
                tail, node, Release, Relaxed
            ).is_ok() { return; }
        }
    }
}`;

  const gptCode = `pub struct MutexQueue<T> {
    inner: std::sync::Mutex<VecDeque<T>>,
    cond: std::sync::Condvar,
}

impl<T> MutexQueue<T> {
    pub fn push(&self, val: T) {
        let mut guard = self.inner.lock().unwrap();
        guard.push_back(val);
        self.cond.notify_one();
        // High lock contention under 64 threads!
    }
}`;

  useEffect(() => {
    const timer = setInterval(() => {
      setTypedChars((prev) => (prev < 420 ? prev + 6 : prev));
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#0d0c0a] border border-[#2a2620] rounded-lg overflow-hidden shadow-2xl font-mono text-xs my-4">
      {/* Editor Header Bar */}
      <div className="bg-[#171512] px-3 py-2 border-b border-[#2a2620] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 size={13} className="text-amber-500" />
          <span className="text-neutral-300 text-[10.5px] font-semibold">
            PROMPT DUEL ARENA: "Implement zero-contention high-throughput queue in Rust"
          </span>
        </div>

        <div className="flex items-center gap-2 text-[9px] text-neutral-400">
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-bold">
            SWE-BENCH VERIFIED HARNESS
          </span>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-2 divide-x divide-[#23201a] bg-[#0a0907]">
        {/* Left: Claude 3.5 Sonnet */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-[#23201a] pb-1.5">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Cpu size={12} className="text-amber-500" /> Claude 3.5 Sonnet
            </span>
            <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
              <CheckCircle2 size={10} /> 48.2M ops/s (12/12 Passed)
            </span>
          </div>

          <pre className="text-[10px] leading-relaxed text-emerald-300/90 overflow-x-auto min-h-[140px]">
            <code>{sonnetCode.slice(0, typedChars)}</code>
            {typedChars < sonnetCode.length && (
              <span className="inline-block w-1.5 h-3.5 bg-amber-400 animate-pulse ml-0.5" />
            )}
          </pre>

          <div className="text-[9.5px] font-mono text-neutral-400 border-t border-[#23201a] pt-1.5">
            Architecture: CachePadded atomic CAS pointers avoiding false sharing.
          </div>
        </div>

        {/* Right: Baseline Model (GPT-4o Nov) */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-[#23201a] pb-1.5">
            <span className="font-bold text-neutral-400 flex items-center gap-1.5">
              <Cpu size={12} /> Baseline Generalist (GPT-4o)
            </span>
            <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
              <AlertTriangle size={10} /> 12.4M ops/s (Lock Contention)
            </span>
          </div>

          <pre className="text-[10px] leading-relaxed text-neutral-400 overflow-x-auto min-h-[140px]">
            <code>{gptCode.slice(0, typedChars)}</code>
          </pre>

          <div className="text-[9.5px] font-mono text-neutral-500 border-t border-[#23201a] pt-1.5">
            Architecture: Coarse-grained Mutex lock causing severe thread stalling.
          </div>
        </div>
      </div>
    </div>
  );
}
