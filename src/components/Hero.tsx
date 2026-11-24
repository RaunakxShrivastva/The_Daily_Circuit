import { useEffect, useRef, useState } from 'react';
import { EDITION } from '../data/edition';
import type { Story } from '../data/types';

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

const beats = ['AI & ML', 'Research', 'Biology', 'Climate', 'Labour', 'Ethics'];
const tickerBars = [34, 52, 44, 70, 88];

const stats = [
  { value: EDITION.stories.length + '+', label: 'Stories this issue' },
  { value: '9 min',  label: 'Avg. read time'    },
  { value: '100%',   label: 'Free & open'        },
];

export function Hero({ onOpen }: { onOpen: (s: Story) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const lead = EDITION.stories[0];

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p?.catch) p.catch(() => {});
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.pause(); setReady(true);
    }
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="hero" id="top">
      {/* Background video */}
      <div className="hero__media">
        <video
          ref={videoRef}
          className={`hero__video${ready ? ' is-ready' : ''}`}
          src="/hero-loop.mp4"
          autoPlay muted loop playsInline preload="auto"
          aria-hidden="true"
          onCanPlay={() => setReady(true)}
        />
        <div className="hero__scrim" aria-hidden="true" />
        <div className="hero__rules" aria-hidden="true">
          <span /><span /><span />
        </div>
      </div>

      <div className="hero__inner">
        <div className="hero__lead">
          {/* Edition badge */}
          <p className="hero__edition">
            <span className="hero__edition-dot" aria-hidden="true" />
            {EDITION.issueDate} — {EDITION.issueNo}
          </p>

          {/* The masthead — the broadsheet nameplate */}
          <h1 className="hero__masthead">
            THE<br />DAILY<br />CIRCUIT
          </h1>
          <span className="hero__masthead-rule" aria-hidden="true" />
          <p className="hero__tagline">The Future, In Context.</p>

          {/* Deck */}
          <p className="hero__deck">
            Rigorous journalism on artificial intelligence, science and technology.
            Every story sourced, timed and built for the age it covers.
          </p>

          {/* CTA row */}
          <div className="hero__cta">
            <a
              className="btn btn--flame"
              href="#edition"
              onClick={e => { e.preventDefault(); scrollTo('edition'); }}
            >
              Read Today's Edition
              <span className="hero__go-arrow" aria-hidden="true"><ArrowRight /></span>
            </a>
            <div className="hero__live">
              <span className="hero__live-dot" aria-hidden="true" />
              {EDITION.stories.length} stories live
            </div>
          </div>

          {/* Stat cards */}
          <ul className="hero__stats">
            {stats.map(s => (
              <li key={s.label} className="hstat">
                <span className="hstat__mark" aria-hidden="true">*</span>
                <span className="hstat__value">{s.value}</span>
                <span className="hstat__label">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lead story preview panel (desktop only) */}
        <aside
          className="hero__preview"
          onClick={() => onOpen(lead)}
          role="button" tabIndex={0}
          aria-label={`Preview lead story: ${lead.headline}`}
          onKeyDown={e => { if (e.key === 'Enter') onOpen(lead); }}
        >
          <div className="hero__preview-eyebrow">Lead story · {lead.readTime}</div>
          <p className="hero__preview-headline">{lead.headline}</p>
          <p className="hero__preview-byline">{lead.byline}</p>
          <div style={{ display:'flex', alignItems:'flex-end', gap:14, marginTop:16, paddingTop:14, borderTop:'1px solid rgba(244,239,227,0.09)' }}>
            <div className="hero__preview-bars">
              {tickerBars.map((h,i) => <span key={i} style={{ height:`${h}%` }} />)}
            </div>
            <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'rgba(244,239,227,0.35)', lineHeight:1.4 }}>
              <span style={{ display:'block', fontFamily:'var(--masthead)', fontSize:'1.3rem', fontWeight:500, color:'rgba(244,239,227,0.6)', letterSpacing:'-0.01em' }}>
                +12
              </span>
              stories<br />this week
            </div>
          </div>
        </aside>
      </div>

      {/* Footer band */}
      <div className="hero__foot">
        <span className="hero__watermark" aria-hidden="true">DC</span>
        <div className="hero__beats">
          <span className="hero__beats-label">Covering</span>
          <ul>{beats.map(b => <li key={b}>{b}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
