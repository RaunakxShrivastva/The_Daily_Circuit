import { useCallback, useEffect, useRef, useLayoutEffect, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { EDITION as STATIC_EDITION } from "../data/edition";
import type { Story, Edition } from "../data/types";
import type { GithubRepo, LiveEditionData } from "../lib/api";
import { liveDataToStories } from "../lib/api";
import {
  FrontPage, ArticlePage, AiNewsPage,
  GithubPage, SubscribePage, ColophonPage
} from "./Pages";

const PAGE_W = 720;
const PAGE_H = 1008;
const BOOK_W = PAGE_W * 2;

/* ----------------------------------------------------------------
   Responsive scale — perfectly fitted to viewport with zero bottom chop
   ---------------------------------------------------------------- */
export function useBookScale() {
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Guarantee adequate space for top controls (40px) and bottom desk dock (80px)
      const availableH = Math.max(300, vh - 130);
      const availableW = Math.max(400, vw - 48);
      const byHeight = availableH / PAGE_H;
      const byWidth  = availableW / BOOK_W;
      // Fit neatly inside bounds
      setK(Math.max(0.35, Math.min(byHeight, byWidth, 1.25)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return k;
}

function playPaperSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.18);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {}
}

/* ----------------------------------------------------------------
   Opening fold animation
   ---------------------------------------------------------------- */
export function OpeningSequence({ onDone }: { onDone: () => void }) {
  const [closing, setClosing] = useState(false);
  const handed = useRef(false);

  const finish = useCallback(() => {
    if (handed.current) return;
    handed.current = true;
    setClosing(true);
  }, []);

  useEffect(() => { const t = setTimeout(finish, 3200); return () => clearTimeout(t); }, [finish]);
  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(onDone, 520);
    return () => clearTimeout(t);
  }, [closing, onDone]);

  return (
    <div
      className={`opening${closing ? " opening--closing" : ""}`}
      onClick={finish}
      role="button" tabIndex={0}
      aria-label="Open the newspaper"
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); finish(); } }}
    >
      <div className="opening__sheet">
        <div className="paper paper--right" style={{ clipPath: "inset(0 0 0 50%)" }} />
        <div className="paper paper--left"  style={{ clipPath: "inset(0 50% 0 0)" }} />
        <div className="opening__crease" />
        <div className="opening__masthead">THE DAILY CIRCUIT</div>
        <div className="opening__date">
          {STATIC_EDITION.issueDate} · {STATIC_EDITION.issueNo}
        </div>
      </div>
      <div className="opening__hint">
        {STATIC_EDITION.issueDate} — tap to open today's edition
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   The newspaper book — opens directly on front page (no hard cover)
   ---------------------------------------------------------------- */
export function Newspaper({
  onOpen,
  liveData,
  loading,
}: {
  onOpen: (s: Story) => void;
  liveData: LiveEditionData | null;
  loading: boolean;
}) {
  const book  = useRef<any>(null);
  const [page, setPage] = useState(0);
  const scale = useBookScale();
  const [hintOn, setHintOn] = useState(true);

  useEffect(() => { const t = setTimeout(() => setHintOn(false), 6000); return () => clearTimeout(t); }, []);

  // Build the live edition or fall back to static
  const edition: Edition = (() => {
    if (!liveData || (liveData.hn.length === 0 && liveData.devto.length === 0)) {
      return STATIC_EDITION;
    }
    const stories = liveDataToStories(liveData);
    return {
      ...STATIC_EDITION,
      stories: stories.length > 0 ? stories : STATIC_EDITION.stories,
    };
  })();

  const stories = edition.stories;
  const github: GithubRepo[] = liveData?.github ?? [];

  const TOTAL_PAGES = 6; // front · ai-news · github · deep-reads · subscribe · colophon

  const flip = () => book.current?.pageFlip?.() ?? null;
  const next = useCallback(() => { const f = flip(); if (f && f.getCurrentPageIndex() < TOTAL_PAGES - 1) f.flipNext(); }, []);
  const prev = useCallback(() => { const f = flip(); if (f && f.getCurrentPageIndex() > 0) f.flipPrev(); }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [next, prev]);

  const pages = [
    <FrontPage    key="front"     stories={stories} onOpen={onOpen} loading={loading} edition={edition} />,
    <AiNewsPage   key="ainews"    stories={stories.slice(0, 8)} onOpen={onOpen} loading={loading} />,
    <GithubPage   key="github"    repos={github} loading={loading} />,
    <ArticlePage  key="deep"      stories={stories.slice(8, 12)} onOpen={onOpen} loading={loading} />,
    <SubscribePage key="sub"      edition={edition} />,
    <ColophonPage key="colophon"  stories={stories} onOpen={onOpen} edition={edition} />,
  ];

  const PAGE_LABELS = [
    "Front Page", "AI News", "GitHub Trending", "Deep Reads", "Subscribe", "Colophon"
  ];

  return (
    <>
      {/* Drag hint */}
      <div
        className="desk__hint"
        style={{ opacity: hintOn ? 0.72 : 0, transition: "opacity 700ms ease" }}
      >
        ← → arrow keys or drag a corner to turn the page · click a headline to read
      </div>

      {loading && (
        <div className="desk__live-badge">
          <span className="desk__live-dot" />
          Fetching live edition…
        </div>
      )}

      <div className="book-wrap">
        <div
          className="book"
          style={{ width: BOOK_W, height: PAGE_H, transform: `scale(${scale})` }}
        >
          <HTMLFlipBook
            ref={book}
            className="book__flip"
            style={{ width: BOOK_W, height: PAGE_H }}
            width={PAGE_W} height={PAGE_H}
            minWidth={PAGE_W} maxWidth={PAGE_W}
            minHeight={PAGE_H} maxHeight={PAGE_H}
            size="fixed"
            maxShadowOpacity={0.38}
            showCover={false}
            usePortrait={false}
            flippingTime={1100}
            drawShadow
            showPageCorners
            clickEventForward
            disableFlipByClick={false}
            mobileScrollSupport
            useMouseEvents
            startPage={0}
            startZIndex={0}
            autoSize={false}
            swipeDistance={22}
            onFlip={(e: { data: number }) => {
              setPage(e.data);
              playPaperSound();
            }}
          >
            {pages.map((p, i) => (
              <div className="page paper" key={i}>{p}</div>
            ))}
          </HTMLFlipBook>
          <div className="book__spine" />
        </div>
      </div>

      {/* Desk control bar */}
      <div className="desk">
        <button className="desk__btn" onClick={prev} disabled={page === 0}>‹ Prev</button>
        <div className="desk__center">
          <span className="desk__folio">
            {String(page + 1).padStart(2, "0")} / {String(TOTAL_PAGES).padStart(2, "0")}
          </span>
          <span className="desk__section">{PAGE_LABELS[page]}</span>
        </div>
        <button className="desk__btn desk__btn--go" onClick={next} disabled={page >= TOTAL_PAGES - 1}>Next ›</button>
        <span className="desk__sep" />
        <button className="desk__btn desk__btn--read" onClick={() => onOpen(stories[0])}>
          ⚡ Lead Story
        </button>
      </div>
    </>
  );
}
