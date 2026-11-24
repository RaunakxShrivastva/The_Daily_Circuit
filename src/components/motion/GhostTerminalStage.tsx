import { useState, useEffect } from 'react';
import { Terminal, Check, Copy } from 'lucide-react';

export function GhostTerminalStage() {
  const [typedCommand, setTypedCommand] = useState('');
  const [logIndex, setLogIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const fullCommand = 'python3 -m speculative_proxy --draft qwen-1.5b --target deepseek-32b --verify-batch 8';

  const outputLogs = [
    '[INFO] Allocating non-fragmented KV-cache slab via PagedAttention (0.92 limit)... [OK]',
    '[LOAD] Pinned 1.5B draft weights on local NVMe (PCIe 4.0: 6.8 GB/s bandwidth)... [OK]',
    '[INFER] Emitted 8 greedy draft tokens: ["fn", " ", "verify_cas", "(", "atomic", ":", " ", "&"] (8.4ms)',
    '[VERIFY] Parallel validation kernel executed on primary 32B model: 7/8 tokens accepted (87.5% hit rate)',
    '[STATS] Speculative acceleration factor: 3.82x baseline | Throughput: 146.8 tok/s [OPTIMAL]'
  ];

  useEffect(() => {
    let charIndex = 0;
    setTypedCommand('');
    setLogIndex(0);

    const typeTimer = setInterval(() => {
      if (charIndex < fullCommand.length) {
        setTypedCommand(fullCommand.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeTimer);
        // Start streaming logs
        let currentLog = 0;
        const logTimer = setInterval(() => {
          if (currentLog < outputLogs.length) {
            setLogIndex(currentLog + 1);
            currentLog++;
          } else {
            clearInterval(logTimer);
            // Restart after 6 seconds
            setTimeout(() => {
              setTypedCommand('');
              setLogIndex(0);
            }, 6000);
          }
        }, 500);
      }
    }, 45);

    return () => clearInterval(typeTimer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#0d0c0a] border border-[#2a2620] rounded-lg overflow-hidden shadow-2xl font-mono text-xs my-4">
      {/* Terminal Title Bar */}
      <div className="bg-[#171512] px-3 py-2 border-b border-[#2a2620] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-neutral-400 text-[10px] tracking-wide ml-2">
            zsh — builder@daily-circuit: ~/speculative-proxy — 84x24
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="text-neutral-400 hover:text-white flex items-center gap-1 text-[10px] transition-colors"
          title="Copy command to clipboard"
        >
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Terminal Body */}
      <div className="p-4 bg-[#0a0907] min-h-[170px] space-y-2 select-text">
        {/* Command Line Prompt */}
        <div className="flex items-center gap-2 text-neutral-300">
          <span className="text-emerald-400 font-bold">builder@macbook-pro</span>
          <span className="text-neutral-500">:</span>
          <span className="text-blue-400">~/speculative-proxy</span>
          <span className="text-neutral-400">$</span>
          <span className="text-neutral-100 font-semibold">{typedCommand}</span>
          {typedCommand.length < fullCommand.length && (
            <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </div>

        {/* Output Logs */}
        <div className="space-y-1 pt-1 text-[11px]">
          {outputLogs.slice(0, logIndex).map((log, idx) => (
            <div
              key={idx}
              className={`leading-relaxed transition-opacity duration-200 ${
                log.includes('[STATS]')
                  ? 'text-emerald-400 font-bold bg-emerald-950/30 p-1 rounded border border-emerald-800/40'
                  : log.includes('[INFER]')
                  ? 'text-amber-300'
                  : 'text-neutral-400'
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
