import { useEffect, useRef } from 'react';
import { EDITION } from '../data/edition';
import type { Story } from '../data/types';
import { clamp, range, pinProgress } from '../lib/math';
import { onFrame } from '../lib/scroll';

const SECTION_VH = 340;

export function FeaturedReel({ onOpen }: { onOpen: (s: Story) => void }) {
  const rootRef  = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<HTMLLIElement[]>([]);
  const imgRefs  = useRef<HTMLImageElement[]>([]);
  const barRef   = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  const featured = EDITION.stories.slice(0, 5);

  useEffect(() => {
    let lastP = -1;
    return onFrame(() => {
      const root = rootRef.current, track = trackRef.current;
      if (!root || !track) return;
      const { p, rect, vh } = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const vw = window.innerWidth;
      const k  = range(p, 0.04, 0.96);
      const travel = Math.max(0, track.offsetLeft + track.scrollWidth - vw * 0.94);
      track.style.transform = `translate3d(${-k * travel}px,0,0)`;

      let nearest = 0, best = Infinity;
      cardRefs.current.forEach((card, i) => {
        const r   = card.getBoundingClientRect();
        const off = (r.left + r.width / 2 - vw * 0.62) / vw;
        const a   = clamp(Math.abs(off) * 1.6);
        card.style.opacity   = String(1 - a * 0.55);
        card.style.transform = `scale(${1 - a * 0.07})`;
        if (imgRefs.current[i])
          imgRefs.current[i].style.transform = `translate3d(${off * -50}px,0,0) scale(1.12)`;
        if (Math.abs(off) < best) { best = Math.abs(off); nearest = i; }
      });
      if (barRef.current)   barRef.current.style.transform  = `scaleX(${k})`;
      if (countRef.current) countRef.current.textContent     = `0${nearest + 1}`;
    });
  }, []);

  return (
    <section
      ref={rootRef}
      id="edition"
      aria-labelledby="reel-title"
      className="reel"
      style={{ height: `${SECTION_VH}svh` }}
    >
      <div className="reel__sticky">
        <div className="reel__section-head">
          <div>
            <p className="reel__section-kicker">Today's Edition</p>
            <h2 id="reel-title" className="reel__section-title">
              {EDITION.issueDate}
            </h2>
            <div className="reel__section-rule" aria-hidden="true" />
          </div>
          <div className="reel__meta">
            <span><strong ref={countRef}>01</strong> / 0{featured.length}</span>
            <div className="reel__bar-wrap">
              <span ref={barRef} className="reel__bar" />
            </div>
          </div>
        </div>

        <ol ref={trackRef} className="reel__track">
          {featured.map((story, i) => (
            <li
              key={story.id}
              ref={el => { if (el) cardRefs.current[i] = el; }}
              className="reel__card"
              onClick={() => onOpen(story)}
              role="button" tabIndex={0}
              aria-label={story.headline}
              onKeyDown={e => { if (e.key === 'Enter') onOpen(story); }}
            >
              <figure>
                <div className="reel__img-wrap">
                  <img
                    ref={el => { if (el) imgRefs.current[i] = el; }}
                    src={story.photo}
                    alt={story.headline}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="reel__img"
                  />
                  <span className="reel__tag">{story.kicker}</span>
                </div>
                <figcaption className="reel__caption">
                  <span className="reel__num">0{i + 1}</span>
                  <span>
                    <span className="reel__caption-title">{story.headline}</span>
                    <span className="reel__caption-stand">{story.standfirst}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
