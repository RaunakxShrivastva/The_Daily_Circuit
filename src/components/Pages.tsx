import type { Story, Edition } from "../data/types";
import type { GithubRepo } from "../lib/api";
import { EDITION } from "../data/edition";

/* ----------------------------------------------------------------
   Shared page chrome
   ---------------------------------------------------------------- */
function PageHead({ section }: { section: string }) {
  return (
    <div className="page__head">
      <span className="mini">THE DAILY CIRCUIT</span>
      <span className="folio">{section}</span>
      <span className="folio">{EDITION.issueDate}</span>
    </div>
  );
}

function PageFoot({ page, label }: { page: number; label: string }) {
  return (
    <div className="page__foot">
      <span className="folio">The Daily Circuit</span>
      <span className="folio">{label}</span>
      <span className="folio">{page}</span>
    </div>
  );
}

/* Skeleton shimmer block while data loads */
function Skeleton({ lines = 4, style }: { lines?: number; style?: React.CSSProperties }) {
  return (
    <div className="skel" style={style}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skel__line" style={{ width: i === lines - 1 ? "60%" : "100%" }} />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------
   Masthead (reused on front page)
   ---------------------------------------------------------------- */
export function Masthead({ edition }: { edition: Edition }) {
  return (
    <header className="np-masthead">
      <div className="np-masthead__folio">
        <span>{edition.issueNo}</span>
        <span>AI &amp; TECH BROADSHEET</span>
        <span>{edition.city}</span>
      </div>
      <hr className="hairline hairline--ink" />
      <div className="np-masthead__name-wrap">
        <div className="np-masthead__rule-top" />
        <h1 className="masthead">THE DAILY CIRCUIT</h1>
        <div className="np-masthead__rule-bot" />
      </div>
      <hr className="hairline hairline--double" />
      <div className="np-masthead__dateline">
        <span>{edition.issueDate}</span>
        <span className="np-masthead__slug">Verified AI News · Top Repos · Live Synthesis</span>
        <span>{edition.price}</span>
      </div>
    </header>
  );
}

/* Brief story block */
function Brief({ story, onOpen, featured }: { story: Story; onOpen: (s: Story) => void; featured?: boolean }) {
  return (
    <article className={`brief${featured ? " brief--featured" : ""}`}>
      <div className="brief__k kicker">{story.kicker}</div>
      <h3 className="brief__t">
        <a href="#" onClick={e => { e.preventDefault(); onOpen(story); }}>{story.headline}</a>
      </h3>
      <p className="brief__d">{story.standfirst}</p>
      <div className="byline" style={{ marginTop: 5 }}>{story.byline} · {story.dateline}</div>
    </article>
  );
}

/* ----------------------------------------------------------------
   PAGE 1 — Front page (the full broadsheet)
   ---------------------------------------------------------------- */
export function FrontPage({
  stories, onOpen, loading, edition,
}: { stories: Story[]; onOpen: (s: Story) => void; loading: boolean; edition: Edition }) {
  const lead    = stories[0];
  const briefs1 = stories.slice(1, 5);
  const briefs2 = stories.slice(5, 8);

  return (
    <div className="page__inner">
      <Masthead edition={edition} />

      {loading ? (
        <div style={{ marginTop: 20 }}>
          <Skeleton lines={2} style={{ marginBottom: 12 }} />
          <Skeleton lines={6} />
        </div>
      ) : (
        <>
          {/* Lead story */}
          <section className="lead" style={{ marginTop: 10, paddingBottom: 10, marginBottom: 10 }}>
            <div className="kicker">{lead?.kicker}</div>
            <h2 className="headline headline--front" style={{ marginTop: 4 }}>
              <a href="#" onClick={e => { e.preventDefault(); lead && onOpen(lead); }}>
                {lead?.headline}
              </a>
            </h2>
            <p className="deck" style={{ marginTop: 6, maxWidth: "58ch", fontSize: "15px", lineHeight: "1.35" }}>{lead?.standfirst}</p>
            <div className="byline" style={{ marginTop: 6 }}>{lead?.byline} · {lead?.dateline}</div>

            <div className="lead__grid" style={{ marginTop: 8 }}>
              <div>
                <div className="lead__photo">
                  <img src={lead?.photo} alt="" loading="eager" />
                </div>
                <p className="caption" style={{ marginTop: 4 }}>{lead?.photoCaption}</p>
              </div>
              <div className="cols cols--1" style={{ fontSize: 12 }}>
                {lead?.body.slice(0, 2).map((p, i) => <p key={i}>{p}</p>)}
                {lead?.url && (
                  <p style={{ marginTop: 6 }}>
                    <a
                      href={lead.url}
                      target="_blank" rel="noopener noreferrer"
                      className="story-source-link"
                    >
                      Read full story →
                    </a>
                  </p>
                )}
              </div>
            </div>
          </section>

          <hr className="hairline hairline--ink" style={{ marginBottom: 10 }} />

          {/* 4-column brief row */}
          <div className="cols cols--4 briefs-row">
            {briefs1.map(s => <Brief key={s.id} story={s} onOpen={onOpen} />)}
          </div>
        </>
      )}

      <PageFoot page={1} label="Continued on page 2" />
    </div>
  );
}

/* ----------------------------------------------------------------
   PAGE 2 — AI News
   ---------------------------------------------------------------- */
export function AiNewsPage({
  stories, onOpen, loading,
}: { stories: Story[]; onOpen: (s: Story) => void; loading: boolean }) {
  return (
    <div className="page__inner">
      <PageHead section="AI & Technology News" />

      <div className="section-banner">
        <span className="kicker">Today's Top Stories</span>
        <h2 className="section-banner__title">AI & Technology</h2>
        <hr className="hairline hairline--double" style={{ marginTop: 8 }} />
      </div>

      {loading ? (
        <>
          <Skeleton lines={3} style={{ marginBottom: 16 }} />
          <Skeleton lines={3} style={{ marginBottom: 16 }} />
          <Skeleton lines={3} />
        </>
      ) : (
        <div className="news-list">
          {stories.slice(0, 8).map((s, i) => (
            <div className="news-list__item" key={s.id}>
              <span className="news-list__n">{String(i + 1).padStart(2, "0")}</span>
              <div className="news-list__body">
                <div className="kicker" style={{ marginBottom: 3 }}>{s.kicker}</div>
                <h3 className="news-list__t">
                  <a href="#" onClick={e => { e.preventDefault(); onOpen(s); }}>{s.headline}</a>
                </h3>
                <p className="news-list__d">{s.standfirst}</p>
                <div className="byline" style={{ marginTop: 4, display: "flex", gap: 12 }}>
                  <span>{s.byline}</span>
                  <span>{s.dateline}</span>
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="story-source-link">
                      Source →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PageFoot page={2} label="AI News" />
    </div>
  );
}

/* ----------------------------------------------------------------
   PAGE 3 — GitHub Trending
   ---------------------------------------------------------------- */
const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5", TypeScript: "#2b7489", JavaScript: "#f1e05a",
  Rust: "#dea584", Go: "#00ADD8", "C++": "#f34b7d", C: "#555555",
  Java: "#b07219", Ruby: "#701516", Swift: "#F05138",
  Kotlin: "#A97BFF", Shell: "#89e051", Dockerfile: "#384d54",
};

export function GithubPage({ repos, loading }: { repos: GithubRepo[]; loading: boolean }) {
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="page__inner">
      <PageHead section="GitHub Trending" />

      <div className="section-banner">
        <span className="kicker">Open Source</span>
        <h2 className="section-banner__title">GitHub Trending Today</h2>
        <p className="section-banner__sub">{today} · Repositories gaining the most stars this week</p>
        <hr className="hairline hairline--double" style={{ marginTop: 8 }} />
      </div>

      {loading ? (
        <>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} lines={2} style={{ marginBottom: 14 }} />)}
        </>
      ) : repos.length === 0 ? (
        <p className="body" style={{ marginTop: 20, color: "var(--ink-3)" }}>
          GitHub Trending data unavailable — network or rate-limit issue. Try refreshing.
        </p>
      ) : (
        <div className="gh-list">
          {repos.map((r, i) => (
            <a
              key={r.id}
              className="gh-item"
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="gh-item__n">{String(i + 1).padStart(2, "0")}</span>
              <div className="gh-item__body">
                <div className="gh-item__name">{r.fullName}</div>
                <p className="gh-item__desc">{r.description || "No description provided."}</p>
                <div className="gh-item__meta">
                  {r.language && (
                    <span className="gh-item__lang">
                      <span
                        className="gh-item__lang-dot"
                        style={{ background: LANG_COLORS[r.language] ?? "#ccc" }}
                      />
                      {r.language}
                    </span>
                  )}
                  <span className="gh-item__stars">★ {r.stars.toLocaleString()}</span>
                  <span className="gh-item__forks">⑂ {r.forks.toLocaleString()}</span>
                  {r.topics.slice(0, 2).map(t => (
                    <span key={t} className="gh-item__topic">{t}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <PageFoot page={3} label="GitHub Trending" />
    </div>
  );
}

/* ----------------------------------------------------------------
   PAGE 4 — Deep Reads (Dev.to + Reddit picks as article layout)
   ---------------------------------------------------------------- */
export function ArticlePage({
  stories, onOpen, loading,
}: { stories: Story[]; onOpen: (s: Story) => void; loading: boolean }) {
  const main  = stories[0];
  const rest  = stories.slice(1);

  return (
    <div className="page__inner">
      <PageHead section="Deep Reads" />

      <div className="section-banner">
        <span className="kicker">Long Reads &amp; Community</span>
        <h2 className="section-banner__title">Deep Reads</h2>
        <hr className="hairline hairline--double" style={{ marginTop: 8 }} />
      </div>

      {loading ? (
        <>
          <Skeleton lines={5} style={{ marginBottom: 16 }} />
          <Skeleton lines={3} />
        </>
      ) : main ? (
        <>
          {/* Featured deep read */}
          <div className="kicker" style={{ marginBottom: 5 }}>{main.kicker}</div>
          <h3 className="headline" style={{ fontSize: 26 }}>
            <a href="#" onClick={e => { e.preventDefault(); onOpen(main); }}>{main.headline}</a>
          </h3>
          <p className="deck" style={{ marginTop: 6 }}>{main.standfirst}</p>
          <div className="byline" style={{ marginTop: 6 }}>{main.byline} · {main.readTime}</div>
          {main.url && (
            <a href={main.url} target="_blank" rel="noopener noreferrer" className="story-source-link" style={{ display: "block", marginTop: 6 }}>
              Read full article →
            </a>
          )}

          <hr className="hairline" style={{ margin: "14px 0" }} />

          <div className="cols cols--2" style={{ fontSize: 12.2 }}>
            {rest.map(s => <Brief key={s.id} story={s} onOpen={onOpen} />)}
          </div>
        </>
      ) : (
        <p className="body" style={{ marginTop: 16, color: "var(--ink-3)" }}>No deep reads today.</p>
      )}

      <PageFoot page={4} label="Deep Reads" />
    </div>
  );
}

/* ----------------------------------------------------------------
   PAGE 5 — Subscribe
   ---------------------------------------------------------------- */
export function SubscribePage({ edition }: { edition: Edition }) {
  return (
    <div className="page__inner subscribe-page">
      <PageHead section="Subscribe" />

      <div className="sub-inner">
        <div className="kicker" style={{ marginBottom: 8 }}>Daily AI Intelligence</div>
        <h2 className="sub__title">Read AI news<br />in ink — every day.</h2>
        <hr className="hairline hairline--double" style={{ margin: "18px 0" }} />

        <p className="sub__body">
          The world of artificial intelligence produces something new every 24 hours — a new model, a new paper, a new repo that changes how you think about software.
          We read it. We verify it. We set it in type and deliver it to your inbox, and your door.
        </p>

        <div className="sub-tiers">
          <div className="sub-tier">
            <div className="sub-tier__label">Digital</div>
            <div className="sub-tier__price">£6 <span>/month</span></div>
            <ul>
              <li>Daily edition in your inbox</li>
              <li>Full archive access</li>
              <li>GitHub Trending daily digest</li>
              <li>Evidence Desk for every story</li>
            </ul>
          </div>
          <div className="sub-tier sub-tier--ink">
            <div className="sub-tier__badge">Print + Digital</div>
            <div className="sub-tier__label">Ink &amp; Pixel</div>
            <div className="sub-tier__price">£18 <span>/month</span></div>
            <ul>
              <li>Physical broadsheet by post</li>
              <li>Everything in Digital</li>
              <li>Printed on recycled stock</li>
              <li>No ads — ever</li>
            </ul>
          </div>
        </div>

        <div className="sub-form">
          <input type="email" placeholder="you@email.com" className="sub-form__input" />
          <button className="sub-form__btn">Subscribe →</button>
        </div>
        <p className="caption" style={{ marginTop: 10, textAlign: "center" }}>
          Cancel any time · No ads · No paywalled stories · {edition.issueNo}
        </p>
      </div>

      <PageFoot page={5} label="Subscribe" />
    </div>
  );
}

/* ----------------------------------------------------------------
   PAGE 6 — Colophon / Index
   ---------------------------------------------------------------- */
export function ColophonPage({
  stories, onOpen, edition,
}: { stories: Story[]; onOpen: (s: Story) => void; edition: Edition }) {
  return (
    <div className="page__inner">
      <PageHead section="Index" />

      <div className="kicker" style={{ marginBottom: 8 }}>This edition</div>
      <h2 className="h1" style={{ fontSize: 30, marginBottom: 12 }}>
        All {stories.length} stories
      </h2>
      <hr className="hairline hairline--ink" style={{ marginBottom: 14 }} />

      <div className="index" style={{ columnCount: 2, columnGap: 26, flex: 1 }}>
        {stories.map((st, i) => (
          <div className="index__row" key={st.id}>
            <span className="index__n">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="index__t">
                <a href="#" onClick={e => { e.preventDefault(); onOpen(st); }}>{st.headline}</a>
              </span>
              <span className="index__p" style={{ display: "block" }}>
                {st.kicker} · {st.byline}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "2px solid var(--ink)" }}>
        <div className="cols cols--2" style={{ fontSize: 11.5 }}>
          {edition.colophon?.map((c, i) => <p key={i}>{c}</p>)}
        </div>
      </div>

      <div className="page__foot">
        <span className="folio">Set in Bodoni Moda, Newsreader &amp; IBM Plex Mono</span>
        <span className="folio">End of {edition.issueDate} edition</span>
        <span className="folio">6</span>
      </div>
    </div>
  );
}
