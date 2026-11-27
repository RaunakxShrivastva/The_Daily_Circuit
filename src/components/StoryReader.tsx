import { useState, useEffect } from 'react';
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

  // Sync StoryReader controls directly into the top LiquidGlassNavbar Notch (single unified navbar)
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('daily-circuit:reader-state', {
        detail: {
          open: true,
          tabs: visibleTabs.map((t) => ({ id: t.id, label: t.label })),
          activeTab: tab,
          sourceUrl: story.url || null,
        },
      })
    );
  }, [tab, story.url, visibleTabs.length]);

  useEffect(() => {
    const onTabCmd = (e: Event) => {
      const next = (e as CustomEvent<TabId>).detail;
      if (next) setTab(next);
    };
    const onCloseCmd = () => onClose();

    window.addEventListener('daily-circuit:reader-tab', onTabCmd);
    window.addEventListener('daily-circuit:reader-close', onCloseCmd);
    return () => {
      window.removeEventListener('daily-circuit:reader-tab', onTabCmd);
      window.removeEventListener('daily-circuit:reader-close', onCloseCmd);
      window.dispatchEvent(
        new CustomEvent('daily-circuit:reader-state', { detail: { open: false } })
      );
    };
  }, [onClose]);

  return (
    <div
      className="reader-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Reading: ${story.headline}`}
    >
      <article className="reader" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
        {/* Body (Top bar is unified inside the MacBook Liquid Glass Notch above) */}
        <div className="reader__body" style={{ paddingTop: '72px' }}>
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
