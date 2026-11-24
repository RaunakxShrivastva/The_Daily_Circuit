import { useState } from 'react';
import { EDITION } from '../data/edition';
import type { Story } from '../data/types';
import { useReveals } from '../hooks/useReveals';

const ALL_TAGS = ['All', 'Artificial intelligence', 'Research', 'Biology', 'Labour', 'Ethics', 'Open source'];

function StoryCard({ story, featured, onOpen, style }: {
  story: Story; featured?: boolean;
  onOpen: (s: Story) => void; style?: React.CSSProperties;
}) {
  return (
    <article
      className={`story-card${featured ? ' story-card--featured' : ''}`}
      onClick={() => onOpen(story)}
      role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onOpen(story); }}
      data-reveal style={style}
      aria-label={story.headline}
    >
      <div className="story-card__photo">
        <img src={story.photo} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="story-card__body">
        <div className="story-card__kicker">{story.kicker}</div>
        <h3 className="story-card__headline">{story.headline}</h3>
        <p className="story-card__stand">{story.standfirst}</p>
        <div className="story-card__meta">
          <span>{story.byline}</span>
          <span className="story-card__read">{story.readTime}</span>
        </div>
      </div>
    </article>
  );
}

export function StoriesGrid({ onOpen }: { onOpen: (s: Story) => void }) {
  const ref = useReveals<HTMLElement>();
  const [activeTag, setActiveTag] = useState('All');

  // Skip first 5 (they're in the reel)
  const pool = EDITION.stories.slice(5);
  const filtered = activeTag === 'All'
    ? pool
    : pool.filter(s => s.tags.some(t => t.toLowerCase() === activeTag.toLowerCase()));

  return (
    <section ref={ref} id="stories" aria-labelledby="stories-title" className="stories">
      <div className="section-inner">
        <div className="stories__head" data-reveal>
          <div>
            <p className="reel__section-kicker">The Full Edition</p>
            <h2 id="stories-title" className="stories__title" style={{ marginTop: 6 }}>
              All Stories
            </h2>
          </div>
          <span className="stories__date">{EDITION.issueDate} · {EDITION.stories.length} stories</span>
        </div>

        {/* Broadsheet double rule */}
        <div className="stories__divider" data-reveal style={{ transitionDelay: '60ms' }} aria-hidden="true" />

        {/* Tag filter pills */}
        <div className="stories__filters" data-reveal style={{ transitionDelay: '100ms' }}>
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              className={`filter-pill${activeTag === tag ? ' is-active' : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="stories__grid">
          {filtered.length === 0 && (
            <p style={{
              gridColumn: '1/-1', padding: 24,
              fontFamily: 'var(--mono)', fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'rgba(244,239,227,0.3)',
            }}>
              No stories in this category.
            </p>
          )}
          {filtered.map((story, i) => (
            <StoryCard
              key={story.id}
              story={story}
              featured={i === 0 && activeTag === 'All'}
              onOpen={onOpen}
              style={{ transitionDelay: `${(i % 6) * 65}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
