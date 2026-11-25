import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  ExternalLink, 
  Sparkles, 
  Star, 
  GitFork, 
  Clock, 
  Share2, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Search,
  CheckCircle2,
  Terminal,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
  ShieldCheck,
  Send,
  X,
  Play,
  RotateCcw,
  Zap,
  AlertTriangle,
  DollarSign,
  Server,
  Activity,
  Briefcase,
  Code2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Story, Edition } from '../data/types';
import type { GithubRepo, LiveEditionData } from '../lib/api';
import { fetchLiveEdition, liveDataToStories } from '../lib/api';
import { EDITION as STATIC_EDITION } from '../data/edition';
import { StoryReader } from './StoryReader';
import { IncidentReplayStage } from './motion/IncidentReplayStage';
import { GhostTerminalStage } from './motion/GhostTerminalStage';
import { PromptDuelStage } from './motion/PromptDuelStage';
import { MobileSatelliteStage } from './motion/MobileSatelliteStage';
import { SiliconExplorerStage } from './motion/SiliconExplorerStage';
import { TelegraphTicker } from './motion/TelegraphTicker';
import { HomePageStage } from './home/HomePageStage';
import { ScrollCircuitPath } from './motion/ScrollCircuitPath';
import { WaxSealManuscriptUnroll } from './motion/WaxSealManuscriptUnroll';

const PAGE_SECTIONS = [
  { id: 'page-01', num: '01', roman: 'I', label: 'Front Page & Wire', short: 'Front Wire', edge: 'PAGE 01 · WIRE' },
  { id: 'page-02', num: '02', roman: 'II', label: 'Compute & GPU Weather', short: 'Compute', edge: 'PAGE 02 · GPU' },
  { id: 'page-03', num: '03', roman: 'III', label: 'Post-Mortem & Incident Desk', short: 'Post-Mortem', edge: 'PAGE 03 · OUTAGES' },
  { id: 'page-04', num: '04', roman: 'IV', label: 'Dev Classifieds & Bounties', short: 'Bounties', edge: 'PAGE 04 · BOUNTIES' },
  { id: 'page-05', num: '05', roman: 'V', label: 'Silicon & Hardware Foundry', short: 'Silicon', edge: 'PAGE 05 · CHIPS' },
  { id: 'page-06', num: '06', roman: 'VI', label: 'Keynotes & Video Dispatches', short: 'Keynotes', edge: 'PAGE 06 · MEDIA' },
  { id: 'page-07', num: '07', roman: 'VII', label: 'Evidence Desk & Audit', short: 'Audit Desk', edge: 'PAGE 07 · EVIDENCE' },
  { id: 'page-08', num: '08', roman: 'VIII', label: 'Telegraph & Print', short: 'Telegraph', edge: 'PAGE 08 · PRINT' }
];

const GPU_WEATHER = [
  { chip: 'NVIDIA H100 SXM5 (80GB)', provider: 'Lambda / Crusoe', rate: '$2.49/hr', status: 'Optimal', statusClass: 'opt', mem: '3.35 TB/s HBM3' },
  { chip: 'NVIDIA H200 (141GB)', provider: 'RunPod / CoreWeave', rate: '$3.85/hr', status: 'Tight Queue', statusClass: 'tight', mem: '4.8 TB/s HBM3e' },
  { chip: 'NVIDIA B200 NVL72', provider: 'Azure / GCP Preview', rate: '$7.20/hr', status: 'Gated Access', statusClass: 'gate', mem: '8.0 TB/s HBM3e' },
  { chip: 'NVIDIA RTX 4090 (24GB)', provider: 'Vast.ai / Tensordock', rate: '$0.58/hr', status: 'High Surplus', statusClass: 'opt', mem: '1.0 TB/s GDDR6X' },
  { chip: 'Groq LP8 LPU Rack', provider: 'GroqCloud Direct', rate: '$0.95/hr', status: '480 Tok/s', statusClass: 'opt', mem: '230 MB SRAM @ 80TB/s' },
  { chip: 'Apple M4 Max (128GB)', provider: 'Local Metal Harness', rate: '$0.00 eq.', status: 'Local Node', statusClass: 'opt', mem: '546 GB/s Unified' }
];

const TOKEN_PRICING = [
  { model: 'DeepSeek-V3 / R1', provider: 'Fireworks / Together', ctx: '128K', input: '$0.14', output: '$0.28', speed: '118 tok/s', signal: '★ ★ ★ ★ ★ (Cost Champion)' },
  { model: 'Gemini 1.5 Flash', provider: 'Google Cloud Vertex', ctx: '1,000K', input: '$0.075', output: '$0.30', speed: '142 tok/s', signal: '★ ★ ★ ★ ★ (Context King)' },
  { model: 'Claude 3.5 Sonnet', provider: 'Anthropic Direct', ctx: '200K', input: '$3.00', output: '$15.00', speed: '68 tok/s', signal: '★ ★ ★ ★ ☆ (Coding Gold)' },
  { model: 'GPT-4o mini', provider: 'OpenAI Platform', ctx: '128K', input: '$0.15', output: '$0.60', speed: '96 tok/s', signal: '★ ★ ★ ★ ☆ (Fast General)' }
];

const LEAD_INCIDENT = {
  title: 'Cascade of the Sharded Leaky Bucket: How a Cluster Slot Rebalance Toppled Edge Inference',
  system: 'Distributed LLM Gateway & Rate-Limiter',
  impact: '28-minute partial timeout surge across US-East and EU-West edge routing clusters.',
  rootCause: 'During automated Redis cluster slot migration under peak traffic, token bucket state was momentarily partitioned. Client SDKs received HTTP 429 reset headers with zero backoff, triggering an immediate thundering herd against backend vLLM worker nodes.',
  badCode: `- // Vulnerable: Non-atomic split-read during cluster resharding
- int currentTokens = redisClient.get("bucket:" + apiKey);
- if (currentTokens > 0) { redisClient.decr("bucket:" + apiKey); }`,
  fixCode: `+ // Patched: Atomic Lua CAS script with local token refill & exponential backoff
+ String LUA_CAS = "if redis.call('get', KEYS[1]) > '0' then return redis.call('decr', KEYS[1]) else return -1 end";
+ redisClient.eval(LUA_CAS, 1, "bucket:" + apiKey);`,
  resolution: 'Switched rate-limiting to atomic Lua CAS with local in-memory token buffering, and deployed client jittered exponential backoff.'
};

const SUB_INCIDENTS = [
  {
    title: 'CUDA OOM on Speculative Chunked Prefill',
    summary: 'Non-contiguous allocation in vLLM paged attention exceeded PyTorch caching allocator head by 8MB during 64-request concurrent batch.',
    fix: 'Strict `--gpu-memory-utilization 0.92` + offloading prefill heads to pinned CPU RAM.'
  },
  {
    title: 'Silent Memory Bleed in Multi-Turn Agent Loop',
    summary: 'Autonomous sub-agent tool calls accumulated raw JSON stack traces in persistent prompt history without token truncation guards.',
    fix: 'Rolling sliding-window summary checkpoint with strict 4,096-token tool call window.'
  },
  {
    title: 'DNS Resolver Socket Exhaustion under 10k Container Spin-up',
    summary: 'Ephemeral inference workers spawned simultaneously in Kubernetes cluster overwhelmed upstream CoreDNS pods with UDP floods.',
    fix: 'Deployed local NodeLocal DNSCache DaemonSet with connection pooling.'
  }
];

const OPEN_SOURCE_BOUNTIES = [
  {
    issue: 'Optimize vLLM Triton PagedAttention Kernel for AMD ROCm 6.2 CDNA3',
    repo: 'vllm-project/vllm',
    bounty: '$850 USD',
    stack: 'Triton / C++ / ROCm',
    why: 'Enables 1.4x faster prefill on Instinct MI300X clusters.',
    url: 'https://github.com/vllm-project/vllm'
  },
  {
    issue: 'Implement FP8 GEMM Matrix Kernel in Pure WebGPU for In-Browser Inference',
    repo: 'xenova/transformers.js',
    bounty: '$500 USD',
    stack: 'WebGPU / WGSL / TypeScript',
    why: 'Allows 8B quantized models to run client-side at 25+ tokens/sec inside Google Chrome.',
    url: 'https://github.com/xenova/transformers.js'
  },
  {
    issue: 'Fix Distributed Checkpoint Resume Race Condition in Megatron-LM Pipeline Parallel',
    repo: 'NVIDIA/Megatron-LM',
    bounty: '$1,000 USD',
    stack: 'Python / PyTorch Distributed / NCCL',
    why: 'Eliminates 45-minute training restart hangs when resuming 70B+ model training jobs.',
    url: 'https://github.com/NVIDIA/Megatron-LM'
  },
  {
    issue: 'Add Streaming Structured JSON Schema Validation Engine in Pure Rust',
    repo: 'ollama/ollama',
    bounty: '$350 USD',
    stack: 'Rust / Parser Combinators',
    why: 'Guarantees zero invalid JSON output from local agent harnesses during real-time streaming.',
    url: 'https://github.com/ollama/ollama'
  }
];

const HIGH_SIGNAL_ROLES = [
  {
    title: 'Founding Kernel & Inference Engineer',
    company: 'Reflection AI · Remote / SF',
    salary: '$220,000 – $310,000 + 0.75% Equity',
    stack: ['Triton', 'CUDA C++', 'vLLM', 'FlashAttention']
  },
  {
    title: 'Distributed Systems Infrastructure Lead',
    company: 'Agent Substrate · Remote Worldwide',
    salary: '$195,000 – $265,000 + Equity',
    stack: ['Rust', 'Go', 'Raft Consensus', 'eBPF']
  },
  {
    title: 'Edge AI Acceleration Specialist',
    company: 'Thinking Machines · London / Remote',
    salary: '£130,000 – £180,000 + Token Pool',
    stack: ['Metal', 'WebGPU', 'ONNX Runtime', 'Zig']
  }
];

const HARDWARE_SPECS = [
  { chip: 'NVIDIA Blackwell B200', arch: 'Dual-Die CoWoS-L (TSMC 4NP)', mem: '192GB HBM3e', bw: '8.0 TB/s', fp8Tflops: '4,500', target: 'Frontier Pretraining & Dense Inference' },
  { chip: 'AMD Instinct MI325X', arch: '8x XCD Chiplets (TSMC 5/6nm)', mem: '256GB HBM3e', bw: '6.0 TB/s', fp8Tflops: '2,614', target: 'Large-Memory Model Serving' },
  { chip: 'Groq LPU (LP8 Engine)', arch: 'Monolithic TSP (GlobalFoundries 14nm)', mem: '230MB On-Chip SRAM', bw: '80.0 TB/s', fp8Tflops: '750', target: 'Ultra-Low Latency Inference (<20ms)' },
  { chip: 'Tenstorrent Wormhole n300', arch: 'Dual Tensix Core (TSMC 12nm)', mem: '24GB GDDR6', bw: '576 GB/s', fp8Tflops: '520', target: 'Open-Architecture RISC-V Compute' }
];

const FOUNDRY_DISPATCHES = [
  {
    title: 'TSMC A16 & SuperPower Backside Power Delivery',
    text: 'TSMC announced volume production timelines for A16 (1.6nm class) featuring SuperPower Backside Power Delivery Network (BSPDN). Routing power rails to the rear of the silicon wafer eliminates IR drop resistance and frees up 20% interconnect area for compute transistors.'
  },
  {
    title: 'ASML High-NA EUV Scanner (EXE:5000) Prints 8nm Pitch',
    text: 'Intel Fab 34 in Ireland and Oregon R&D facilities completed initial trial runs on ASML High-NA 0.55 numerical aperture lithography tools, demonstrating single-exposure resolution of 8nm metal pitch without triple-patterning masks.'
  },
  {
    title: 'HBM4 Architecture Shifts to Custom 4nm Logic Base Dies',
    text: 'JEDEC completed the HBM4 specification, featuring 2048-bit memory bus interfaces. Unlike HBM3e where base dies were manufactured on standard DRAM processes, HBM4 base logic dies will be fabricated on advanced TSMC 4nm and 3nm nodes for direct on-interposer compute routing.'
  }
];

export function MirandaNewspaper() {
  const [liveData, setLiveData] = useState<LiveEditionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingStory, setReadingStory] = useState<Story | null>(null);
  const [filterTag, setFilterTag] = useState<string>('All');
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredStory, setHoveredStory] = useState<Story | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('page-01');
  const [showPageRail, setShowPageRail] = useState(false);
  const [paperBlur, setPaperBlur] = useState(14);
  const [paperScale, setPaperScale] = useState(0.96);
  const [paperOpacity, setPaperOpacity] = useState(0.7);
  const [unrollProgress, setUnrollProgress] = useState(0);
  const [maxRollTravel, setMaxRollTravel] = useState(2100);

  const [pipelineEdition, setPipelineEdition] = useState<any>(null);

  useEffect(() => {
    const calcMaxTravel = () => {
      const p1El = document.getElementById('page-01');
      if (p1El) {
        // Roll all the way through the end of the front page (Page 1) down to the bottom divider
        const travel = p1El.offsetTop + p1El.offsetHeight + 80;
        setMaxRollTravel(Math.max(travel, 2000));
      } else {
        setMaxRollTravel(Math.max((window.innerHeight || 900) * 1.8, 2000));
      }
    };
    calcMaxTravel();
    window.addEventListener('resize', calcMaxTravel);
    return () => window.removeEventListener('resize', calcMaxTravel);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 68;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    let animFrameId: number;
    let targetUnroll = 0;
    let currentUnroll = 0;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const homeHeight = window.innerHeight || 850;
      setShowPageRail(scrollY > homeHeight * 0.7);

      // Smooth optical focus resolve as user scrolls from Home Space into Newspaper
      const progress = Math.min(1, Math.max(0, (scrollY - homeHeight * 0.4) / 700));
      setPaperBlur((1 - progress) * 12);
      setPaperScale(0.97 + progress * 0.03);
      setPaperOpacity(Math.min(1, progress * 1.5));

      // Second-Page Scroll Runway: Unroll begins as second page enters viewport
      // Starts at homeHeight * 0.45 (~400px) and smoothly unrolls all the way to the end over 1050px
      const scrollStart = homeHeight * 0.45;
      const scrollDistance = 1050;
      targetUnroll = Math.min(1, Math.max(0, (scrollY - scrollStart) / scrollDistance));

      const scrollPos = scrollY + 200;
      for (let i = PAGE_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(PAGE_SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(PAGE_SECTIONS[i].id);
          break;
        }
      }
    };

    // Smooth physics lerp loop for tactile paper weight & resistance
    const updateLoop = () => {
      currentUnroll += (targetUnroll - currentUnroll) * 0.09;
      setUnrollProgress(currentUnroll);
      animFrameId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    animFrameId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    
    // Fetch 24h compiled edition from pipeline
    fetch('/editions/latest.json')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!cancelled && data && data.pages) {
          setPipelineEdition(data);
        }
      })
      .catch(() => {});

    // Fetch real-time live APIs (HN, Dev.to, GitHub)
    fetchLiveEdition()
      .then(data => {
        if (!cancelled) {
          setLiveData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Track cursor for magnetic floating image preview (Miranda Signature Effect)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const edition: Edition = (() => {
    if (pipelineEdition && pipelineEdition.pages) {
      const p1 = pipelineEdition.pages.page1_front;
      const pipelineLead: Story = {
        id: 'pipeline-lead',
        no: 1,
        headline: p1.headline,
        standfirst: p1.subheadline,
        kicker: 'SYSTEM ARCHITECTURE',
        byline: 'The Daily Circuit Dispatch',
        dateline: pipelineEdition.date || 'Today',
        readTime: '4 min',
        photo: '/photos/lead.jpg',
        photoCaption: 'Autonomous micro-actors orchestrating distributed task graphs.',
        body: p1.leadBody || [],
        tags: ['Distributed Systems', 'Agent Substrate', 'Inference'],
        sources: [
          { kind: 'paper', title: 'System Dispatch', date: pipelineEdition.date || 'Today', detail: 'Compiled from verified 24h engineering signals' }
        ],
        timeline: [
          { when: '06:00 UTC', title: 'Signals Ingested', body: '24h HackerNews, GitHub, and Hugging Face telemetry analyzed.' }
        ]
      };

      const stories = [pipelineLead, ...(liveData ? liveDataToStories(liveData) : STATIC_EDITION.stories.slice(1))];
      return {
        ...STATIC_EDITION,
        issueDate: pipelineEdition.date || STATIC_EDITION.issueDate,
        issueNo: `Vol. I · No. ${pipelineEdition.issueNumber || 42}`,
        stories
      };
    }

    if (!liveData || (liveData.hn.length === 0 && liveData.devto.length === 0)) {
      return STATIC_EDITION;
    }
    const stories = liveDataToStories(liveData);
    return {
      ...STATIC_EDITION,
      stories: stories.length > 0 ? stories : STATIC_EDITION.stories,
    };
  })();

  const allStories = edition.stories;
  const leadStory = allStories[0];
  const wireStories = allStories.slice(1, 9);
  const deepStories = allStories.slice(9, 14);

  const githubRepos: GithubRepo[] = (liveData?.github && liveData.github.length > 0)
    ? liveData.github
    : (pipelineEdition?.pages?.page4_repos?.topRepos?.map((r: any, idx: number) => ({
        id: idx + 100,
        name: r.repo.split('/')[1] || r.repo,
        fullName: r.repo,
        description: r.whyItMatters || 'High velocity engineering framework from 24h intelligence digest.',
        stars: parseInt(r.stars24h.replace(/[^0-9]/g, '')) * 10 || 4500,
        forks: 340,
        language: r.stack || 'TypeScript',
        topics: [r.stack?.toLowerCase() || 'dev', 'ai', 'tools'],
        url: `https://github.com/${r.repo}`
      })) || []);

  const modelsData = pipelineEdition?.pages?.page2_models?.releases || [
    { name: 'DeepSeek-R1-Distill-Qwen-32B', lab: 'DeepSeek AI', license: 'MIT', verifiedDelta: 'AIME 2024: 72.6% (+18.4% over base)', hypeCheck: 'Remarkable reasoning density, though tool calls can occasionally loop on open-ended system tasks.' },
    { name: 'Beam-501B-MoE', lab: 'Reflection Team', license: 'Open Weights', verifiedDelta: '501.3B total / 23.4B active parameters optimized for agents', hypeCheck: 'While parameter counts sound massive, routing overhead requires high-bandwidth memory topologies.' },
    { name: 'Inkling-2-Mini-GGUF', lab: 'Thinking Machines', license: 'Apache 2.0', verifiedDelta: '1.91M 24h downloads on HuggingFace', hypeCheck: 'Quantized execution yields high edge throughput, though slight degradation on fine spatial reasoning.' }
  ];

  const accuracyBattles = pipelineEdition?.pages?.page3_accuracy?.battles || [
    { benchmark: 'SWE-Bench Verified (Full Codebase Patching)', modelA: { name: 'Claude 3.5 Sonnet', score: 49.2, lab: 'Anthropic' }, modelB: { name: 'GPT-4o (Nov Refill)', score: 38.8, lab: 'OpenAI' }, delta: '+10.4% Delta', analysis: 'Sonnet demonstrates superior repo-level dependency mapping across multi-file diffs.' },
    { benchmark: 'AIME 2024 Olympiad (Competition Mathematics)', modelA: { name: 'DeepSeek-R1', score: 79.8, lab: 'DeepSeek' }, modelB: { name: 'OpenAI o1-preview', score: 74.4, lab: 'OpenAI' }, delta: '+5.4% Delta', analysis: 'Long-horizon chain-of-thought verification prevents algebraic hallucination.' }
  ];

  const buildersCorner = pipelineEdition?.pages?.page7_builders || {
    weekendBuild: {
      title: 'Local Speculative Verification Proxy',
      stack: ['Python 3.12', 'FastAPI', 'llama.cpp GGUF'],
      steps: [
        'Spin up a lightweight 1.5B draft model alongside your primary 32B model on local NVMe storage.',
        'Route greedy draft candidate tokens through a verification kernel with batch size 8.',
        'Measure token-per-second acceleration on standard code completions and prompt refills.'
      ]
    },
    conceptDecoded: {
      term: 'Speculative Decoding',
      plainEnglish: 'A technique where a fast, tiny model guesses several upcoming words ahead of time, and the large model checks them all in a single parallel step, boosting generation speed without losing accuracy.'
    },
    architectureTeardown: {
      system: 'PagedAttention & Chunked Prefill',
      tradeoff: 'Eliminates internal memory fragmentation at the expense of non-contiguous cache lookups.'
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setSubscribed(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#121214', '#162f58', '#d4af37']
    });
  };

  const filteredStories = filterTag === 'All' 
    ? wireStories 
    : wireStories.filter(s => s.kicker.toLowerCase().includes(filterTag.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(filterTag.toLowerCase())));

  // Progressive 3D Manuscript Unroll Calculations (Synchronized with Wax Seal crack)
  const unrollRatio = Math.min(1, Math.max(0, (unrollProgress - 0.20) / 0.78));
  const revealedHeight = Math.round(unrollRatio * maxRollTravel);

  return (
    <div className="miranda-canvas">
      {/* Texture Grain Overlay */}
      <div className="miranda-grain" />

      {/* Floating Magnetic Hover Thumbnail (Miranda Style) */}
      {hoveredStory && (
        <div 
          className="miranda-hover-card"
          style={{ 
            left: `${mousePos.x + 24}px`, 
            top: `${mousePos.y - 80}px` 
          }}
        >
          <img src={hoveredStory.photo} alt="" className="miranda-hover-card__img" />
          <div className="miranda-hover-card__meta">
            <span className="miranda-hover-card__kicker">{hoveredStory.kicker}</span>
            <div className="miranda-hover-card__read">{hoveredStory.readTime} read</div>
          </div>
        </div>
      )}

      {/* Top Full-Screen Home Page Stage with Botanical Impressionist Garden Background */}
      <HomePageStage 
        onScrollToNewspaper={() => {
          const homeHeight = window.innerHeight || 850;
          window.scrollTo({ top: homeHeight * 0.45 + 1650, behavior: 'smooth' });
        }} 
      />

      {/* Real-time Smooth Scroll SVG Circuit Path Draw Animation */}
      <ScrollCircuitPath />

      {/* Floating Outside-Paper Page Rail (Sticky Page Markers - Only visible when reading newspaper) */}
      <aside 
        className={`miranda-page-rail transition-all duration-300 ${showPageRail ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-4 pointer-events-none'}`} 
        aria-label="Broadsheet Page Index"
      >
        <div className="miranda-page-rail__heading">
          <Layers size={10} />
          <span>PAGES</span>
        </div>
        {PAGE_SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            className={`miranda-page-rail__btn ${activeSection === sec.id ? 'is-active' : ''}`}
            title={`Scroll to Page ${sec.num}: ${sec.label}`}
          >
            <span className="miranda-page-rail__num">{sec.num}</span>
            <span className="miranda-page-rail__title">{sec.short}</span>
          </button>
        ))}
      </aside>

      {/* Docked Stageshow Mobile Companion Audio Satellite (Collapsible on the right margin) */}
      <MobileSatelliteStage />

      {/* 3D Physical Manuscript Unroll Wrapper on Second Page */}
      <div className="relative max-w-[1260px] mx-auto mt-16 sm:mt-24">
        {/* The 3D Rolling Cylinder and Wax Seal that moves down as you scroll */}
        <WaxSealManuscriptUnroll 
          scrollProgress={unrollProgress}
          maxRollTravel={maxRollTravel}
          onBreakSeal={() => {
            const homeHeight = window.innerHeight || 850;
            window.scrollTo({ top: homeHeight * 0.45 + 1650, behavior: 'smooth' });
          }}
        />

        {/* Main Printed Broadsheet Container with 3D Perspective Unroll & Optical Blur Resolve */}
        <main 
          className="miranda-sheet transition-all duration-75 will-change-transform"
          style={{
            clipPath: unrollProgress < 0.98 ? `inset(0 0 calc(100% - ${revealedHeight + 24}px) 0)` : undefined,
            filter: paperBlur > 0.4 ? `blur(${paperBlur.toFixed(1)}px)` : undefined,
            transform: `perspective(1400px) rotateX(${((1 - unrollProgress) * -10).toFixed(2)}deg) scale(${paperScale.toFixed(3)})`,
            transformOrigin: 'top center',
            opacity: unrollProgress < 0.04 ? 0 : paperOpacity,
          }}
        >
        {/* Glowing Copper PCB Reading Spine on the left paper edge */}
        <div 
          className="hidden xl:block absolute left-0 top-0 bottom-0 w-[3px] pointer-events-none rounded-l-sm"
          style={{
            background: "linear-gradient(to bottom, #d97706 0%, #ef4444 35%, #f59e0b 70%, #b45309 100%)",
            boxShadow: "0 0 12px rgba(245, 158, 11, 0.55)"
          }}
          aria-hidden="true"
        />
        {/* Top Paper Header & Stamp */}
        <div className="miranda-sheet__stamp-row">
          <div className="miranda-circular-stamp">
            <svg viewBox="0 0 100 100" className="rotating-stamp">
              <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
              <text fontSize="9" letterSpacing="2">
                <textPath xlinkHref="#circlePath">
                  THE DAILY CIRCUIT · VERIFIED AI INTELLIGENCE ·
                </textPath>
              </text>
            </svg>
            <ShieldCheck size={20} className="miranda-circular-stamp__icon" />
          </div>

          <div className="miranda-sheet__edition-meta">
            <span>VOL. XXIV · NO. 842</span>
            <span>WORLDWIDE BROADSHEET ARCHIVE</span>
            <span>PRICE: FREE DIGITALLY / $5 INK</span>
          </div>

          <div className="miranda-weather-box">
            <div className="miranda-weather-box__top">SILICON VALLEY 64°F</div>
            <div className="miranda-weather-box__bot">STATUS: RAPID DISRUPTION</div>
          </div>
        </div>

        {/* The Master Headline & Nameplate */}
        <div className="miranda-masthead">
          <div className="miranda-masthead__rule" />
          <h1 className="miranda-masthead__title">THE DAILY CIRCUIT</h1>
          <div className="miranda-masthead__rule" />
          <div className="miranda-masthead__sub">
            <span>ESTABLISHED 2026</span>
            <span className="miranda-masthead__tagline">The International Journal of Artificial Intelligence &amp; Open Systems</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Live Mechanical Telegraph Ticker Tape Ribbon */}
        <TelegraphTicker />

        {/* Section Navigation Bar (Smooth Page Jump + Category Filter) */}
        <nav className="miranda-nav-bar">
          <div className="miranda-nav-bar__links">
            {PAGE_SECTIONS.map((sec) => (
              <button 
                key={sec.id}
                className={`miranda-nav-bar__item ${activeSection === sec.id ? 'is-active' : ''}`}
                onClick={() => scrollToSection(sec.id)}
              >
                {sec.num} / {sec.short}
              </button>
            ))}
          </div>
          <div className="miranda-nav-bar__search">
            <span className="miranda-pill-tag">FILTER:</span>
            {['All', 'LLMs', 'Open Source', 'Engineering'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilterTag(cat)}
                className={`miranda-filter-btn ${filterTag === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>

        {/* ========================================================
            PAGE 01: FRONT PAGE & BREAKING WIRE
            ======================================================== */}
        <section id="page-01" className="miranda-page-section">
          <div className="miranda-page-edge-tag">PAGE 01 · FRONT WIRE</div>
          <div className="miranda-front-grid">
            {/* Left Big Lead Story */}
            <article className="miranda-lead">
              <div className="miranda-lead__badge-row">
                <span className="miranda-badge-kicker">{leadStory?.kicker || 'BREAKING WIRE'}</span>
                <span className="miranda-badge-time"><Clock size={12} /> {leadStory?.dateline}</span>
              </div>

              <h2 
                className="miranda-lead__title"
                onClick={() => leadStory && setReadingStory(leadStory)}
              >
                {leadStory?.headline}
              </h2>

              <p className="miranda-lead__deck">{leadStory?.standfirst}</p>

              <div className="miranda-lead__photo-container">
                <img 
                  src={leadStory?.photo || '/photos/lead.jpg'} 
                  alt="" 
                  className="miranda-lead__photo"
                />
                <div className="miranda-halftone-overlay" />
                <span className="miranda-lead__caption">
                  FIG. 1.0 — {leadStory?.photoCaption || 'Autonomous cognitive cluster processing real-time telemetry.'}
                </span>
              </div>

              <div className="miranda-lead__columns">
                <div className="miranda-col">
                  <p className="miranda-dropcap">
                    {leadStory?.body[0]}
                  </p>
                  <p>{leadStory?.body[1]}</p>
                </div>
                <div className="miranda-col">
                  <p>{leadStory?.body[2]}</p>
                  <div className="miranda-quote-box">
                    <span className="quote-mark">“</span>
                    <p className="quote-text">
                      "The speed of frontier models is reorganizing software faster than any standard release cycle."
                    </p>
                    <span className="quote-author">— The Daily Circuit Editorial Board</span>
                  </div>
                  <div className="miranda-lead__actions">
                    <button 
                      className="miranda-btn-action"
                      onClick={() => leadStory && setReadingStory(leadStory)}
                    >
                      Inspect Full Story &amp; Evidence →
                    </button>
                    {leadStory?.url && (
                      <a 
                        href={leadStory.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="miranda-link-source"
                      >
                        Source Link <ArrowUpRight size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>

            {/* Right Wire: The Rapid AI Wire */}
            <aside className="miranda-wire">
              <div className="miranda-wire__header">
                <TrendingUp size={16} />
                <h3>THE LIVE AI WIRE</h3>
                <span className="miranda-wire__count">{filteredStories.length} STORIES</span>
              </div>

              <div className="miranda-wire__list">
                {filteredStories.map((story, idx) => (
                  <div 
                    key={story.id} 
                    className="miranda-wire__item"
                    onMouseEnter={() => setHoveredStory(story)}
                    onMouseLeave={() => setHoveredStory(null)}
                    onClick={() => setReadingStory(story)}
                  >
                    <div className="miranda-wire__num">#{String(idx + 1).padStart(2, '0')}</div>
                    <div className="miranda-wire__content">
                      <span className="miranda-wire__kicker">{story.kicker}</span>
                      <h4 className="miranda-wire__title">{story.headline}</h4>
                      <p className="miranda-wire__desc">{story.standfirst}</p>
                      <div className="miranda-wire__footer">
                        <span>{story.byline}</span>
                        <span className="miranda-dot">·</span>
                        <span>{story.dateline}</span>
                        {story.url && (
                          <a 
                            href={story.url} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="miranda-wire__link"
                          >
                            Source ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* ========================================================
            PAGE 02: ⚡ THE COMPUTE & GPU WEATHER DESK
            ======================================================== */}
        <div className="miranda-folio-divider">
          <span>THE DAILY CIRCUIT · VOL. XXIV</span>
          <div className="miranda-folio-divider__center">
            <span className="miranda-folio-divider__pill">PAGE 02</span>
            <span>THE COMPUTE &amp; GPU WEATHER DESK · INFERENCE &amp; SPOT INDEX</span>
          </div>
          <span>SECTION B · INFRASTRUCTURE</span>
        </div>

        <section id="page-02" className="miranda-page-section">
          <div className="miranda-page-edge-tag">PAGE 02 · GPU</div>
          
          <div className="miranda-section-header">
            <div>
              <h2>THE COMPUTE &amp; GPU WEATHER DESK</h2>
              <p>Daily hardware spot availability, cloud inference $/1M token pricing, and edge latency telemetry.</p>
            </div>
            <Zap size={22} className="text-amber-600" />
          </div>

          {/* GPU Spot Rates Grid */}
          <div className="miranda-gpu-ticker-grid">
            {GPU_WEATHER.map((gpu, i) => (
              <div key={i} className="miranda-gpu-card">
                <div>
                  <div className="miranda-gpu-card__chip">{gpu.chip}</div>
                  <div className="miranda-gpu-card__provider">{gpu.provider} · {gpu.mem}</div>
                </div>
                <div className="miranda-gpu-card__price-row">
                  <span className="miranda-gpu-card__rate">{gpu.rate}</span>
                  <span className={`miranda-gpu-card__status miranda-gpu-card__status--${gpu.statusClass}`}>
                    {gpu.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Inference Token Pricing Table */}
          <div className="miranda-table-container">
            <table className="miranda-table">
              <thead>
                <tr>
                  <th>Model / Harness</th>
                  <th>Cloud Provider</th>
                  <th>Max Context</th>
                  <th>Input $/1M</th>
                  <th>Output $/1M</th>
                  <th>Speed (t/s)</th>
                  <th>Efficiency Signal</th>
                </tr>
              </thead>
              <tbody>
                {TOKEN_PRICING.map((tp, idx) => (
                  <tr key={idx}>
                    <td className="bold-cell">{tp.model}</td>
                    <td>{tp.provider}</td>
                    <td><span className="repo-tag">{tp.ctx}</span></td>
                    <td className="font-mono text-emerald-800 font-bold">{tp.input}</td>
                    <td className="font-mono text-emerald-800 font-bold">{tp.output}</td>
                    <td><span className="font-mono font-semibold">{tp.speed}</span></td>
                    <td><span className="verified-badge">{tp.signal}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Latency & Grid Telemetry */}
          <div className="miranda-latency-row">
            <div className="miranda-latency-pill">
              <span className="miranda-latency-dot" />
              <span>US-EAST (VIRGINIA): 18ms · PUE 1.12</span>
            </div>
            <div className="miranda-latency-pill">
              <span className="miranda-latency-dot" />
              <span>US-WEST (OREGON): 24ms · 100% HYDRO</span>
            </div>
            <div className="miranda-latency-pill">
              <span className="miranda-latency-dot" />
              <span>EU-CENTRAL (FRANKFURT): 31ms · WIND OFFSET</span>
            </div>
            <div className="miranda-latency-pill">
              <span className="miranda-latency-dot" />
              <span>AP-SOUTH (MUMBAI): 42ms · PEAK SOLAR</span>
            </div>
          </div>

          {/* Top AI Models of Today & Accuracy Head-to-Head */}
          <div className="miranda-models-accuracy-grid">
            {/* Left: Top AI Models */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Cpu size={16} className="text-red-700" />
                <h3 style={{ fontFamily: 'var(--serif-title)', fontSize: 18, color: 'var(--miranda-ink)' }}>
                  Top AI Models of Today (Releases &amp; Hype Checks)
                </h3>
              </div>
              {modelsData.map((m: any, i: number) => (
                <div key={i} className="miranda-model-item">
                  <div className="miranda-model-header">
                    <a
                      href={`https://huggingface.co/models?search=${encodeURIComponent(m.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif font-bold text-sm text-neutral-950 flex items-center gap-1.5 hover:text-red-700 transition-colors"
                    >
                      {m.name}
                      <ArrowUpRight size={12} className="text-neutral-500" />
                    </a>
                    <span className="font-mono text-[8.5px] bg-neutral-900 text-white px-2 py-0.5 rounded font-semibold uppercase">
                      {m.license}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-neutral-600 mb-1">
                    Lab: <strong className="text-neutral-900">{m.lab}</strong> · {m.verifiedDelta}
                  </div>
                  <div className="bg-[#ede6d8] p-2 rounded text-[10.5px] font-mono text-neutral-800 flex items-start gap-1.5">
                    <AlertTriangle size={12} className="text-amber-700 shrink-0 mt-0.5" />
                    <span><strong>Hype Check:</strong> {m.hypeCheck}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Accuracy Head-to-Head */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Activity size={16} className="text-emerald-700" />
                <h3 style={{ fontFamily: 'var(--serif-title)', fontSize: 18, color: 'var(--miranda-ink)' }}>
                  Accuracy Head-to-Head (Delta Battles)
                </h3>
              </div>
              {accuracyBattles.map((b: any, idx: number) => (
                <div key={idx} className="miranda-accuracy-card">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-neutral-900 uppercase">
                      {b.benchmark}
                    </span>
                    <span className="font-mono text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      {b.delta}
                    </span>
                  </div>

                  {/* Visual Bar A */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] font-mono font-bold text-neutral-950">
                      <span>{b.modelA.name} ({b.modelA.lab})</span>
                      <span>{b.modelA.score}%</span>
                    </div>
                    <div className="miranda-bar-bg">
                      <div className="miranda-bar-fill" style={{ width: `${Math.min(100, b.modelA.score)}%` }} />
                    </div>
                  </div>

                  {/* Visual Bar B */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-600">
                      <span>{b.modelB.name} ({b.modelB.lab})</span>
                      <span>{b.modelB.score}%</span>
                    </div>
                    <div className="miranda-bar-bg">
                      <div className="miranda-bar-fill--sub" style={{ width: `${Math.min(100, b.modelB.score)}%` }} />
                    </div>
                  </div>

                  <p className="text-[10px] font-serif italic text-neutral-700 mt-1">
                    {b.analysis}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stageshow Faux UI: Live Prompt Duel Arena */}
          <PromptDuelStage />
        </section>

        {/* ========================================================
            PAGE 03: 💥 THE POST-MORTEM & INCIDENT DESK
            ======================================================== */}
        <div className="miranda-folio-divider">
          <span>THE DAILY CIRCUIT · VOL. XXIV</span>
          <div className="miranda-folio-divider__center">
            <span className="miranda-folio-divider__pill">PAGE 03</span>
            <span>THE POST-MORTEM DESK · 24H SYSTEMS BREAKDOWNS &amp; PATCH DIFFS</span>
          </div>
          <span>SECTION C · RESILIENCE</span>
        </div>

        <section id="page-03" className="miranda-page-section">
          <div className="miranda-page-edge-tag">PAGE 03 · OUTAGES</div>

          <div className="miranda-section-header">
            <div>
              <h2>THE POST-MORTEM &amp; INCIDENT AUDIT DESK</h2>
              <p>Unvarnished architectural post-mortems of real distributed system failures, deadlock conditions, and patch code diffs.</p>
            </div>
            <AlertTriangle size={22} className="text-red-600" />
          </div>

          {/* Stageshow Faux UI: Living Incident Replay Engine */}
          <IncidentReplayStage />

          {/* Lead Incident Teardown */}
          <article className="miranda-incident-lead">
            <div className="miranda-incident-badge-row">
              <span className="miranda-badge-incident">PRODUCTION SEV-1</span>
              <span className="miranda-badge-time"><Clock size={12} /> Target: {LEAD_INCIDENT.system}</span>
            </div>

            <h3 className="miranda-incident-title">{LEAD_INCIDENT.title}</h3>
            <p className="miranda-incident-impact">Impact: {LEAD_INCIDENT.impact}</p>

            <div className="miranda-incident-grid">
              <div className="miranda-incident-analysis">
                <h4>Root Cause Breakdown</h4>
                <p>{LEAD_INCIDENT.rootCause}</p>
                <div style={{ marginTop: 14 }}>
                  <h4>Architectural Resolution</h4>
                  <p>{LEAD_INCIDENT.resolution}</p>
                </div>
              </div>

              <div>
                <h4 style={{ fontFamily: 'var(--mono-code)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Verified Patch Code Diff
                </h4>
                <div className="miranda-diff-box">
                  <div className="diff-meta">@@ -14,4 +14,5 @@ rate_limiter.py (atomic CAS fix)</div>
                  <div className="diff-del">{LEAD_INCIDENT.badCode}</div>
                  <div className="diff-add">{LEAD_INCIDENT.fixCode}</div>
                </div>
              </div>
            </div>
          </article>

          {/* Three Sub-Incident Cards */}
          <div className="miranda-sub-incidents-grid">
            {SUB_INCIDENTS.map((inc, i) => (
              <div key={i} className="miranda-sub-incident-card">
                <h4>{inc.title}</h4>
                <p>{inc.summary}</p>
                <div className="miranda-fix-tag">Patch: {inc.fix}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            PAGE 04: 💼 THE DEV CLASSIFIEDS & TERMINAL BOUNTIES
            ======================================================== */}
        <div className="miranda-folio-divider">
          <span>THE DAILY CIRCUIT · VOL. XXIV</span>
          <div className="miranda-folio-divider__center">
            <span className="miranda-folio-divider__pill">PAGE 04</span>
            <span>THE DEV CLASSIFIEDS · GITHUB TRENDING &amp; CASH BOUNTIES</span>
          </div>
          <span>SECTION D · BUILDERS</span>
        </div>

        <section id="page-04" className="miranda-page-section">
          <div className="miranda-page-edge-tag">PAGE 04 · BOUNTIES</div>

          <div className="miranda-classifieds__banner">
            <Terminal size={20} />
            <div>
              <h2>THE DEV CLASSIFIEDS — TOP REPOSITORIES &amp; CASH BOUNTIES</h2>
              <p>Curated from the GitHub firehose and open-source bounty ledgers. Zero recruiter spam.</p>
            </div>
          </div>

          {/* Repositories Grid */}
          <div className="miranda-repo-grid">
            {githubRepos.length === 0 ? (
              <div className="miranda-empty-state">Loading GitHub telemetry...</div>
            ) : (
              githubRepos.slice(0, 4).map((repo, i) => (
                <div key={repo.id} className="miranda-repo-card">
                  <div className="miranda-repo-card__header">
                    <span className="miranda-repo-card__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="miranda-repo-card__lang">
                      <span className="lang-circle" /> {repo.language || 'Code'}
                    </span>
                    <span className="miranda-repo-card__stars">
                      <Star size={13} fill="#d4af37" color="#d4af37" /> {repo.stars.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="miranda-repo-card__name">
                    <a href={repo.url} target="_blank" rel="noreferrer">
                      {repo.fullName}
                    </a>
                  </h3>

                  <p className="miranda-repo-card__desc">
                    {repo.description || 'Open-source experimental artificial intelligence framework.'}
                  </p>

                  <div className="miranda-repo-card__tags">
                    {repo.topics.slice(0, 3).map(t => (
                      <span key={t} className="repo-tag">#{t}</span>
                    ))}
                  </div>

                  <div className="miranda-repo-card__action">
                    <a href={repo.url} target="_blank" rel="noreferrer" className="clone-btn">
                      Inspect Repository <ArrowUpRight size={13} />
                    </a>
                    <span className="fork-count">
                      <GitFork size={12} /> {repo.forks.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bounties and Jobs 2-Column Spread */}
          <div className="miranda-bounty-columns">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <DollarSign size={16} className="text-emerald-700" />
                <h3 style={{ fontFamily: 'var(--serif-title)', fontSize: 18, color: 'var(--miranda-ink)' }}>
                  Active Open-Source Cash Bounties
                </h3>
              </div>

              {OPEN_SOURCE_BOUNTIES.map((b, i) => (
                <div key={i} className="miranda-bounty-card">
                  <div className="miranda-bounty-card__header">
                    <span className="font-mono text-xs text-neutral-600 font-bold">{b.repo}</span>
                    <span className="miranda-bounty-amount">{b.bounty}</span>
                  </div>
                  <h4>{b.issue}</h4>
                  <p>{b.why}</p>
                  <div className="miranda-bounty-footer">
                    <span className="text-neutral-500 font-mono">Stack: {b.stack}</span>
                    <a href={b.url} target="_blank" rel="noreferrer" className="miranda-claim-btn">
                      Claim Bounty <ArrowUpRight size={11} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Briefcase size={16} className="text-blue-700" />
                <h3 style={{ fontFamily: 'var(--serif-title)', fontSize: 18, color: 'var(--miranda-ink)' }}>
                  High-Signal Engineering Roles
                </h3>
              </div>

              {HIGH_SIGNAL_ROLES.map((job, idx) => (
                <div key={idx} className="miranda-job-card">
                  <h4>{job.title}</h4>
                  <div className="miranda-job-company">{job.company}</div>
                  <div className="miranda-job-salary">{job.salary}</div>
                  <div className="miranda-job-stack">
                    {job.stack.map(st => (
                      <span key={st} className="miranda-job-pill">{st}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student & Builder Corner */}
          <div className="miranda-builder-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Terminal size={18} className="text-red-700" />
              <h3 style={{ fontFamily: 'var(--serif-title)', fontSize: 20, color: 'var(--miranda-ink)' }}>
                Student &amp; Builder Corner — Weekend Architecture Build
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
              <div>
                <h4 style={{ fontFamily: 'var(--mono-code)', fontSize: 13, fontWeight: 700, color: '#c83e2b', marginBottom: 6 }}>
                  Build: {buildersCorner.weekendBuild?.title}
                </h4>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {buildersCorner.weekendBuild?.stack?.map((tool: string, i: number) => (
                    <span key={i} className="font-mono text-[9px] bg-neutral-900 text-white px-2 py-0.5 rounded">
                      {tool}
                    </span>
                  ))}
                </div>
                <ol className="miranda-builder-steps list-decimal">
                  {buildersCorner.weekendBuild?.steps?.map((step: string, i: number) => (
                    <li key={i} style={{ marginBottom: 6 }}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <div style={{ background: 'var(--miranda-paper-dark)', borderLeft: '3px solid var(--miranda-ink)', padding: 12, marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--mono-code)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                    Concept Decoded: {buildersCorner.conceptDecoded?.term}
                  </div>
                  <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--miranda-ink-soft)' }}>
                    {buildersCorner.conceptDecoded?.plainEnglish}
                  </p>
                </div>

                <div style={{ background: 'var(--miranda-paper-dark)', border: '1px solid var(--miranda-rule)', padding: 12 }}>
                  <div style={{ fontFamily: 'var(--mono-code)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                    Architecture Teardown: {buildersCorner.architectureTeardown?.system}
                  </div>
                  <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--miranda-ink-soft)' }}>
                    <strong>Tradeoff:</strong> {buildersCorner.architectureTeardown?.tradeoff}
                  </p>
                </div>
              </div>
            </div>

            {/* Stageshow Faux UI: The Ghost Terminal */}
            <GhostTerminalStage />
          </div>
        </section>

        {/* ========================================================
            PAGE 05: 🔬 THE SILICON & HARDWARE FOUNDRY
            ======================================================== */}
        <div className="miranda-folio-divider">
          <span>THE DAILY CIRCUIT · VOL. XXIV</span>
          <div className="miranda-folio-divider__center">
            <span className="miranda-folio-divider__pill">PAGE 05</span>
            <span>THE SILICON FOUNDRY · WAFERS, ACCELERATORS &amp; LITHOGRAPHY</span>
          </div>
          <span>SECTION E · HARDWARE</span>
        </div>

        <section id="page-05" className="miranda-page-section">
          <div className="miranda-page-edge-tag">PAGE 05 · CHIPS</div>

          <div className="miranda-section-header">
            <div>
              <h2>THE SILICON FOUNDRY &amp; HARDWARE LEDGER</h2>
              <p>Physical computing analysis: Advanced packaging, High-NA EUV lithography, and sovereign accelerator silicon.</p>
            </div>
            <Cpu size={22} className="text-indigo-700" />
          </div>

          <div className="miranda-foundry-grid">
            <div className="miranda-foundry-lead">
              <span className="miranda-badge-kicker">PHYSICAL PROCESS SCALING</span>
              <h3>Sub-2nm Nanosheet Transitions: How Backside Power Delivery Rescues Clock Speeds</h3>
              <p>
                As transistor gate lengths shrink below 2 nanometers, parasitic RC delay in conventional front-side metallization stacks has become the dominant bottleneck to clock frequencies. 
                Both TSMC (A16) and Intel (18A) have confirmed production timelines for Backside Power Delivery Networks (BSPDN).
              </p>
              <p>
                By shifting heavy VDD power rails to the reverse side of the polished wafer, routing congestion is reduced by 20%, IR drop voltage sag is minimized, and standard cells can pack up to 1.28x more compute logic per square millimeter.
              </p>
            </div>

            <div className="miranda-foundry-side">
              {FOUNDRY_DISPATCHES.map((d, i) => (
                <div key={i} className="miranda-foundry-bullet">
                  <h4>{d.title}</h4>
                  <p>{d.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stageshow Faux UI: Interactive Die Explorer */}
          <SiliconExplorerStage />

          {/* Hardware Specs Comparison Table */}
          <div className="miranda-table-container">
            <table className="miranda-table">
              <thead>
                <tr>
                  <th>Accelerator Silicon</th>
                  <th>Packaging / Fabrication</th>
                  <th>On-Package Memory</th>
                  <th>Memory Bandwidth</th>
                  <th>FP8 Dense TFLOPS</th>
                  <th>Primary Workload Sweet Spot</th>
                </tr>
              </thead>
              <tbody>
                {HARDWARE_SPECS.map((h, i) => (
                  <tr key={i}>
                    <td className="bold-cell">{h.chip}</td>
                    <td>{h.arch}</td>
                    <td><span className="repo-tag">{h.mem}</span></td>
                    <td className="font-mono font-bold text-blue-900">{h.bw}</td>
                    <td className="font-mono">{h.fp8Tflops}</td>
                    <td><span className="verified-badge">{h.target}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================
            PAGE 06: KEYNOTES & TECHNICAL DISPATCHES
            ======================================================== */}
        <div className="miranda-folio-divider">
          <span>THE DAILY CIRCUIT · VOL. XXIV</span>
          <div className="miranda-folio-divider__center">
            <span className="miranda-folio-divider__pill">PAGE 06</span>
            <span>TECHNICAL DISPATCHES &amp; VIDEO ARCHIVES</span>
          </div>
          <span>SECTION F · ARCHIVE DESK</span>
        </div>

        <section id="page-06" className="miranda-page-section">
          <div className="miranda-page-edge-tag">PAGE 06 · MEDIA</div>
          <div className="miranda-multimedia">
            <div className="miranda-multimedia__hero">
              <div className="miranda-badge-kicker">FEATURED DISPATCH</div>
              <h2>Watch Keynote &amp; Model Architecture Breakdowns</h2>
              <p>Curated technical demonstrations, model release explainers, and open-source benchmarks.</p>
            </div>

            <div className="miranda-video-spread">
              <div className="miranda-video-frame">
                <iframe
                  width="100%"
                  height="450"
                  src="https://www.youtube-nocookie.com/embed/aircAruvnKk?autoplay=0&rel=0"
                  title="3Blue1Brown Neural Networks"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="miranda-video-caption">
                  <strong>DISPATCH 01:</strong> <em>"How Neural Networks actually calculate loss functions and backpropagation."</em> Verified educational archival copy.
                </div>
              </div>

              <div className="miranda-video-side">
                <h3>Editor's Multimedia Notes</h3>
                <div className="note-card">
                  <h4>Synthesized Audio Edition</h4>
                  <p>Every edition of The Daily Circuit is recorded with voice synthesis for auditory reading while commuting.</p>
                  <button 
                    className="miranda-btn-action"
                    onClick={() => {
                      if (leadStory) setReadingStory(leadStory);
                    }}
                  >
                    Listen to Today's Broadcast →
                  </button>
                </div>

                <div className="note-card" style={{ marginTop: 20 }}>
                  <h4>Interactive Simulation</h4>
                  <p>Inspect story timelines, check primary source citations, and query the reporting engine directly in the reader.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            PAGE 07: EVIDENCE DESK & SOURCE AUDIT
            ======================================================== */}
        <div className="miranda-folio-divider">
          <span>THE DAILY CIRCUIT · VOL. XXIV</span>
          <div className="miranda-folio-divider__center">
            <span className="miranda-folio-divider__pill">PAGE 07</span>
            <span>EDITORIAL EVIDENCE DESK &amp; AUDIT LEDGER</span>
          </div>
          <span>SECTION G · PEER VERIFIED</span>
        </div>

        <section id="page-07" className="miranda-page-section">
          <div className="miranda-page-edge-tag">PAGE 07 · EVIDENCE</div>
          <div className="miranda-evidence-tab">
            <div className="miranda-evidence-tab__header">
              <h2>THE EDITORIAL EVIDENCE &amp; AUDIT LEDGER</h2>
              <p>Full transparency. In an era of AI hallucination, every report in this edition rests on documented sources.</p>
            </div>

            <table className="miranda-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Claim / Subject</th>
                  <th>Primary Source</th>
                  <th>Verification Class</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allStories.slice(0, 8).map((st, i) => (
                  <tr key={st.id}>
                    <td>{String(i + 1).padStart(2, '0')}</td>
                    <td className="bold-cell">{st.headline}</td>
                    <td>{st.sources[0]?.title || 'Direct Public Telegraph'}</td>
                    <td>
                      <span className="verified-badge">
                        <CheckCircle2 size={12} /> Peer Verified
                      </span>
                    </td>
                    <td>
                      {st.url ? (
                        <a href={st.url} target="_blank" rel="noreferrer" className="table-link">
                          Inspect Source ↗
                        </a>
                      ) : (
                        <button onClick={() => setReadingStory(st)} className="table-btn">
                          Read Story →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================
            PAGE 08: MORNING TELEGRAPH & SUBSCRIPTION
            ======================================================== */}
        <div className="miranda-folio-divider">
          <span>THE DAILY CIRCUIT · VOL. XXIV</span>
          <div className="miranda-folio-divider__center">
            <span className="miranda-folio-divider__pill">PAGE 08</span>
            <span>MORNING TELEGRAPH &amp; PRINT SUBSCRIPTION</span>
          </div>
          <span>SECTION H · CIRCULATION DESK</span>
        </div>

        <section id="page-08" className="miranda-page-section">
          <div className="miranda-page-edge-tag">PAGE 08 · PRINT</div>
          <div id="subscribe-section" className="miranda-subscribe-box">
            <div className="miranda-subscribe-box__inner">
              <div className="miranda-subscribe-box__text">
                <span className="miranda-badge-kicker">PHYSICAL &amp; DIGITAL INTELLIGENCE</span>
                <h3>Read AI News in Real Ink. Delivered Daily.</h3>
                <p>
                  Every 24 hours brings a model weight update, an Arxiv breakthrough, or a new repository. 
                  Subscribe to receive our morning digital edition, or our weekly printed physical broadsheet delivered in an uncreased postal tube.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="miranda-subscribe-form">
                {subscribed ? (
                  <div className="subscribed-success">
                    <CheckCircle2 size={18} /> You are signed up for Edition No. 843 dispatch!
                  </div>
                ) : (
                  <>
                    <input 
                      type="email" 
                      placeholder="Enter your telegraph email address..."
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      className="miranda-input"
                    />
                    <button type="submit" className="miranda-btn-stamp">
                      Subscribe Daily →
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* Colophon & Footer */}
        <footer className="miranda-colophon">
          <div className="miranda-colophon__cols">
            <div>
              <h4>THE DAILY CIRCUIT</h4>
              <p>The newspaper of the intelligence age. Published continuously from the digital newsroom.</p>
            </div>
            <div>
              <h4>INTEGRATIONS &amp; APIS</h4>
              <p>HackerNews Telegraph · GitHub Search Engine · Dev.to Longreads · Google Gemini 1.5 Flash QA.</p>
            </div>
            <div>
              <h4>TYPOGRAPHY</h4>
              <p>Typeset in Bodoni Moda, Newsreader 16pt, and IBM Plex Monospace. Printed on high-opacity archival digital stock.</p>
            </div>
          </div>
          <div className="miranda-colophon__bottom">
            <span>© 2026 THE DAILY CIRCUIT. ALL ARCHIVES PRESERVED.</span>
            <span>PRESS REVIEWS: AWWWARDS NOMINEE · DIGITAL &amp; AI LITERACY SHOWCASE</span>
          </div>
        </footer>
      </main>
      </div>

      {/* Full-Screen Interactive Story Reader (When clicking any article) */}
      {readingStory && (
        <StoryReader story={readingStory} onClose={() => setReadingStory(null)} />
      )}
    </div>
  );
}
