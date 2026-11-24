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
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Story, Edition } from '../data/types';
import type { GithubRepo, LiveEditionData } from '../lib/api';
import { fetchLiveEdition, liveDataToStories } from '../lib/api';
import { EDITION as STATIC_EDITION } from '../data/edition';
import { StoryReader } from './StoryReader';

const PAGE_SECTIONS = [
  { id: 'page-01', num: '01', roman: 'I', label: 'Front & Live Wire', short: 'Front Wire', edge: 'PAGE 01 · WIRE' },
  { id: 'page-02', num: '02', roman: 'II', label: 'The Dev Classifieds', short: 'Classifieds', edge: 'PAGE 02 · REPOS' },
  { id: 'page-03', num: '03', roman: 'III', label: 'Keynotes & Multimedia', short: 'Keynotes', edge: 'PAGE 03 · DISPATCH' },
  { id: 'page-04', num: '04', roman: 'IV', label: 'Evidence Desk & Audit', short: 'Audit Desk', edge: 'PAGE 04 · EVIDENCE' },
  { id: 'page-05', num: '05', roman: 'V', label: 'Telegraph & Print', short: 'Subscribe', edge: 'PAGE 05 · PRINT' }
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

  const [pipelineEdition, setPipelineEdition] = useState<any>(null);

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
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = PAGE_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(PAGE_SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(PAGE_SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
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

      {/* Top Floating Utility HUD */}
      <header className="miranda-hud">
        <div className="miranda-hud__left">
          <span className="miranda-badge-live">
            <span className="pulse-dot" /> LIVE TELETYPE
          </span>
          <span className="miranda-hud__ticker">
            NASDAQ AI: +2.18% · GPU COMPUTE CLUSTER: OPTIMAL (14ms) · GLOBAL VERIFIED NODES: 8,420
          </span>
        </div>
        <div className="miranda-hud__right">
          <button 
            className="miranda-hud__btn"
            onClick={() => {
              if (leadStory) setReadingStory(leadStory);
            }}
          >
            <BookOpen size={13} /> Open Lead Story
          </button>
          <button 
            className="miranda-hud__btn"
            onClick={() => scrollToSection('page-05')}
          >
            Subscribe to Print
          </button>
        </div>
      </header>

      {/* Floating Outside-Paper Page Rail (Sticky Page Markers on the Side) */}
      <aside className="miranda-page-rail" aria-label="Broadsheet Page Index">
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

      {/* Main Printed Broadsheet Container */}
      <main className="miranda-sheet">
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

        {/* Section Navigation Bar (Smooth Page Jump + Category Filter) */}
        <nav className="miranda-nav-bar">
          <div className="miranda-nav-bar__links">
            {PAGE_SECTIONS.slice(0, 4).map((sec) => (
              <button 
                key={sec.id}
                className={`miranda-nav-bar__item ${activeSection === sec.id ? 'is-active' : ''}`}
                onClick={() => scrollToSection(sec.id)}
              >
                {sec.num} / {sec.label}
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
            PAGE 02: GITHUB TRENDING (The Dev Classifieds)
            ======================================================== */}
        <div className="miranda-folio-divider">
          <span>THE DAILY CIRCUIT · VOL. XXIV</span>
          <div className="miranda-folio-divider__center">
            <span className="miranda-folio-divider__pill">PAGE 02</span>
            <span>THE DEV CLASSIFIEDS · GITHUB TRENDING REPOSITORIES</span>
          </div>
          <span>SECTION B · WORLDWIDE WIRE</span>
        </div>

        <section id="page-02" className="miranda-page-section">
          <div className="miranda-page-edge-tag">PAGE 02 · CLASSIFIEDS</div>
          <div className="miranda-classifieds">
            <div className="miranda-classifieds__banner">
              <Terminal size={20} />
              <div>
                <h2>THE DEV CLASSIFIEDS — TOP REPOSITORIES OF TODAY</h2>
                <p>Scraped directly from the GitHub firehose. Ranked by star velocity over the last 7 days.</p>
              </div>
            </div>

            <div className="miranda-repo-grid">
              {githubRepos.length === 0 ? (
                <div className="miranda-empty-state">Loading GitHub telemetry...</div>
              ) : (
                githubRepos.map((repo, i) => (
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
          </div>
        </section>

        {/* ========================================================
            PAGE 03: MULTIMEDIA & TECHNICAL KEYNOTES
            ======================================================== */}
        <div className="miranda-folio-divider">
          <span>THE DAILY CIRCUIT · VOL. XXIV</span>
          <div className="miranda-folio-divider__center">
            <span className="miranda-folio-divider__pill">PAGE 03</span>
            <span>TECHNICAL DISPATCHES &amp; VIDEO ARCHIVES</span>
          </div>
          <span>SECTION C · ARCHIVE DESK</span>
        </div>

        <section id="page-03" className="miranda-page-section">
          <div className="miranda-page-edge-tag">PAGE 03 · DISPATCHES</div>
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
            PAGE 04: EVIDENCE DESK & SOURCE AUDIT
            ======================================================== */}
        <div className="miranda-folio-divider">
          <span>THE DAILY CIRCUIT · VOL. XXIV</span>
          <div className="miranda-folio-divider__center">
            <span className="miranda-folio-divider__pill">PAGE 04</span>
            <span>EDITORIAL EVIDENCE DESK &amp; AUDIT LEDGER</span>
          </div>
          <span>SECTION D · PEER VERIFIED</span>
        </div>

        <section id="page-04" className="miranda-page-section">
          <div className="miranda-page-edge-tag">PAGE 04 · EVIDENCE</div>
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
            PAGE 05: MORNING TELEGRAPH & SUBSCRIPTION
            ======================================================== */}
        <div className="miranda-folio-divider">
          <span>THE DAILY CIRCUIT · VOL. XXIV</span>
          <div className="miranda-folio-divider__center">
            <span className="miranda-folio-divider__pill">PAGE 05</span>
            <span>MORNING TELEGRAPH &amp; PRINT SUBSCRIPTION</span>
          </div>
          <span>CIRCULATION DESK</span>
        </div>

        <section id="page-05" className="miranda-page-section">
          <div className="miranda-page-edge-tag">PAGE 05 · TELEGRAPH</div>
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

      {/* Full-Screen Interactive Story Reader (When clicking any article) */}
      {readingStory && (
        <StoryReader story={readingStory} onClose={() => setReadingStory(null)} />
      )}
    </div>
  );
}
