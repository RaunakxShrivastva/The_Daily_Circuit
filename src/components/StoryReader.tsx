import { useState } from 'react';
import type { Story } from '../data/types';
import { EvidenceDesk, Timeline, AskThisStory, Narration } from './Desk';
import { findStoryVideo } from '../lib/youtube';

const TABS = [
  { id: 'article',  label: 'Article' },
  { id: 'evidence', label: 'Evidence Desk' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'ask',      label: 'Ask This Story' },
  { id: 'listen',   label: 'Listen' },
  { id: 'video',    label: 'Video' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function StoryReader({ story, onClose }: { story: Story; onClose: () => void }) {
  const [tab, setTab] = useState<TabId>('article');

  const videoSrc = findStoryVideo(story.url ?? '', story.body);
  const visibleTabs = TABS.filter(t => t.id !== 'video' || !!videoSrc);

  return (
    <div
      className="reader-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Reading: ${story.headline}`}
    >
      <article className="reader" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
        {/* Top bar */}
        <div className="reader__bar">
          <span className="reader__brand">The Daily Circuit</span>
          <nav className="reader__tabs" role="tablist" aria-label="Story tools">
            {visibleTabs.map(t => (
              <button
                key={t.id}
                className="reader__tab"
                data-on={tab === t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="reader__bar-actions">
            {story.url && (
              <a
                className="reader__source-btn"
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                title="Open original source"
              >
                Source ↗
              </a>
            )}
            <button className="reader__close" onClick={onClose}>Close ✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="reader__body">
          <div className="reader__sheet">
            {tab === 'article' && (
              <>
                <p className="kicker reader__kicker">{story.kicker}</p>
                <h2 className="reader__headline">{story.headline}</h2>
                <p className="reader__deck">{story.standfirst}</p>

                <div className="reader__meta">
                  <span>{story.byline}</span>
                  <span>{story.dateline}</span>
                  <span>{story.readTime} read</span>
                  {story.url && (
                    <a href={story.url} target="_blank" rel="noopener noreferrer" className="story-source-link">
                      Original source →
                    </a>
                  )}
                </div>

                {story.photo && (
                  <img
                    className="reader__photo"
                    src={story.photo}
                    alt={story.photoCaption}
                    loading="eager"
                  />
                )}
                {story.photoCaption && (
                  <p className="caption" style={{ marginTop: 8, marginBottom: 24 }}>{story.photoCaption}</p>
                )}

                <div className="reader__cols">
                  {story.body.map((paragraph, i) => (
                    <p key={i} className="body">
                      {i === 2 && story.pullQuote ? (
                        <>
                          {paragraph}
                          <span style={{ display: 'block', margin: '26px 0' }}>
                            <span className="kicker" style={{ color: 'var(--blue)' }}>From this story</span>
                            <span style={{
                              display: 'block',
                              fontFamily: 'var(--masthead)',
                              fontSize: 24,
                              lineHeight: 1.25,
                              marginTop: 6,
                              color: 'var(--blue)',
                            }}>
                              {story.pullQuote}
                            </span>
                          </span>
                        </>
                      ) : paragraph}
                    </p>
                  ))}
                </div>

                {story.tags.length > 0 && (
                  <div className="reader__tags">
                    {story.tags.map(tag => (
                      <span key={tag} className="reader__tag">{tag}</span>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'video' && videoSrc && (
              <div>
                <p className="kicker reader__kicker" style={{ marginBottom: 16 }}>Video</p>
                <div className="reader__video-wrap">
                  <iframe
                    src={videoSrc}
                    title={story.headline}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="caption" style={{ marginTop: 12 }}>
                  Video related to: {story.headline}
                </p>
              </div>
            )}

            {tab === 'evidence' && <EvidenceDesk story={story} />}
            {tab === 'timeline' && <Timeline story={story} />}
            {tab === 'ask'      && <AskThisStory story={story} />}
            {tab === 'listen'   && <Narration story={story} />}
          </div>
        </div>
      </article>
    </div>
  );
}
