/* =============================================================
   THE DAILY CIRCUIT — live API layer
   All sources are free, zero-key, CORS-accessible.
   ============================================================= */

import type { Story, Edition } from '../data/types';

/* ----------------------------------------------------------------
   Shared helpers
   ---------------------------------------------------------------- */

const CACHE_PREFIX = 'tdc_v1_';
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

function cache<T>(key: string, data: T) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data }));
  } catch (_) { /* storage full — ignore */ }
}

function fromCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw) as { ts: number; data: T };
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch (_) { return null; }
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json() as Promise<T>;
}

function todayISO() { return new Date().toISOString().split('T')[0]; }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48);
}

/* ----------------------------------------------------------------
   Source 1 — Hacker News (official API, free, no key)
   ---------------------------------------------------------------- */

interface HNItem {
  id: number; title: string; url?: string; score: number;
  by: string; time: number; descendants?: number; text?: string;
}

export interface HNStory {
  id: string; source: 'hn';
  headline: string; url: string; score: number;
  author: string; comments: number; timestamp: number;
  kicker: string;
}

async function fetchHN(maxStories = 12): Promise<HNStory[]> {
  const ckey = `hn_${todayISO()}_${maxStories}`;
  const cached = fromCache<HNStory[]>(ckey);
  if (cached) return cached;

  const ids: number[] = await fetchJSON('https://hacker-news.firebaseio.com/v0/topstories.json');
  const top = ids.slice(0, 40); // fetch 40, filter to AI/tech

  const items = await Promise.allSettled(
    top.map(id => fetchJSON<HNItem>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`))
  );

  const AI_KICKER_MAP: [RegExp, string][] = [
    [/\bllm|gpt|openai|claude|gemini|anthropic|mistral|llama\b/i, 'Large Language Models'],
    [/\bai|machine.?learn|neural|deep.?learn|transformers?\b/i, 'Artificial Intelligence'],
    [/\bgithub|open.?source|repo|release\b/i, 'Open Source'],
    [/\bpython|rust|golang|typescript|javascript\b/i, 'Engineering'],
    [/\bstartup|funding|raise|series\b/i, 'Industry'],
    [/\bsecurity|breach|hack|vuln\b/i, 'Security'],
    [/\bscience|research|study|paper|arxiv\b/i, 'Research'],
  ];

  const stories: HNStory[] = items
    .filter((r): r is PromiseFulfilledResult<HNItem> => r.status === 'fulfilled' && !!r.value?.url && !!r.value?.title)
    .map(r => r.value)
    .filter(item => {
      const t = item.title.toLowerCase();
      return /ai|ml|llm|gpt|claude|gemini|openai|anthropic|rust|python|github|research|model|neural|crypto|quantum|tech|software|code|data|api|open.?source|security|startups?|cloud|chip|gpu/i.test(t);
    })
    .slice(0, maxStories)
    .map(item => {
      const kicker = AI_KICKER_MAP.find(([r]) => r.test(item.title))?.[1] ?? 'Technology';
      return {
        id: `hn-${item.id}`,
        source: 'hn' as const,
        headline: item.title,
        url: item.url!,
        score: item.score,
        author: item.by,
        comments: item.descendants ?? 0,
        timestamp: item.time * 1000,
        kicker,
      };
    });

  cache(ckey, stories);
  return stories;
}

/* ----------------------------------------------------------------
   Source 2 — Dev.to (free public API, no key)
   ---------------------------------------------------------------- */

interface DevtoArticle {
  id: number; title: string; description: string;
  url: string; cover_image: string | null;
  user: { name: string; username: string };
  reading_time_minutes: number; published_at: string;
  tag_list: string[]; positive_reactions_count: number;
}

export interface DevtoStory {
  id: string; source: 'devto';
  headline: string; standfirst: string;
  url: string; photo: string | null;
  author: string; readTime: number;
  kicker: string; reactions: number;
  tags: string[];
}

async function fetchDevto(tag = 'ai', perPage = 8): Promise<DevtoStory[]> {
  const ckey = `devto_${tag}_${todayISO()}`;
  const cached = fromCache<DevtoStory[]>(ckey);
  if (cached) return cached;

  const articles: DevtoArticle[] = await fetchJSON(
    `https://dev.to/api/articles?tag=${tag}&per_page=${perPage}&top=1`
  );

  const stories = articles.map(a => ({
    id: `devto-${a.id}`,
    source: 'devto' as const,
    headline: a.title,
    standfirst: a.description,
    url: a.url,
    photo: a.cover_image,
    author: a.user.name,
    readTime: a.reading_time_minutes,
    kicker: a.tag_list[0] ? a.tag_list[0].replace(/_/g, ' ') : 'Development',
    reactions: a.positive_reactions_count,
    tags: a.tag_list,
  }));

  cache(ckey, stories);
  return stories;
}

/* ----------------------------------------------------------------
   Source 3 — GitHub Search API (no key, 60 req/hr per IP)
   ---------------------------------------------------------------- */

export interface GithubRepo {
  id: string; name: string; fullName: string;
  description: string; url: string; stars: number;
  language: string | null; forks: number;
  topics: string[];
}

async function fetchGithubTrending(perPage = 10): Promise<GithubRepo[]> {
  const ckey = `gh_${todayISO()}`;
  const cached = fromCache<GithubRepo[]>(ckey);
  if (cached) return cached;

  // Created in last 7 days, sorted by stars — GitHub doesn't expose daily trending officially
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const url = `https://api.github.com/search/repositories?q=created:>${weekAgo}+stars:>10&sort=stars&order=desc&per_page=${perPage}`;

  interface GHItem {
    id: number; name: string; full_name: string; description: string;
    html_url: string; stargazers_count: number; language: string | null;
    forks_count: number; topics: string[];
  }
  interface GHResponse { items: GHItem[] }

  const resp: GHResponse = await fetchJSON(url, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  const repos: GithubRepo[] = resp.items.map(r => ({
    id: `gh-${r.id}`,
    name: r.name,
    fullName: r.full_name,
    description: r.description ?? '',
    url: r.html_url,
    stars: r.stargazers_count,
    language: r.language,
    forks: r.forks_count,
    topics: r.topics ?? [],
  }));

  cache(ckey, repos);
  return repos;
}

/* ----------------------------------------------------------------
   Source 4 — Reddit (JSON API, CORS-accessible via .json suffix)
   Subreddits: MachineLearning, artificial, LocalLLaMA, OpenAI
   ---------------------------------------------------------------- */

interface RedditPost {
  data: {
    id: string; title: string; selftext: string; url: string;
    score: number; author: string; permalink: string;
    is_self: boolean; thumbnail: string; created_utc: number;
    subreddit: string;
  }
}

export interface RedditStory {
  id: string; source: 'reddit';
  headline: string; url: string; permalink: string;
  score: number; author: string; subreddit: string;
  kicker: string; timestamp: number;
}

async function fetchReddit(subreddits = ['MachineLearning', 'LocalLLaMA', 'artificial'], limit = 5): Promise<RedditStory[]> {
  const ckey = `reddit_${todayISO()}_${subreddits.join('+')}`;
  const cached = fromCache<RedditStory[]>(ckey);
  if (cached) return cached;

  const results: RedditStory[] = [];

  await Promise.allSettled(subreddits.map(async sub => {
    try {
      const resp: { data: { children: RedditPost[] } } = await fetchJSON(
        `https://www.reddit.com/r/${sub}/hot.json?limit=${limit}&raw_json=1`
      );
      resp.data.children.forEach(({ data: p }) => {
        if (!p.title || p.title.toLowerCase().includes('[meta]')) return;
        results.push({
          id: `reddit-${p.id}`,
          source: 'reddit',
          headline: p.title,
          url: p.is_self ? `https://reddit.com${p.permalink}` : p.url,
          permalink: `https://reddit.com${p.permalink}`,
          score: p.score,
          author: p.author,
          subreddit: p.subreddit,
          kicker: sub === 'MachineLearning' ? 'Research' : sub === 'LocalLLaMA' ? 'Open Models' : 'AI Community',
          timestamp: p.created_utc * 1000,
        });
      });
    } catch (_) { /* silently skip failed subreddits */ }
  }));

  // sort by score descending
  results.sort((a, b) => b.score - a.score);
  cache(ckey, results);
  return results;
}

/* ----------------------------------------------------------------
   Assemble into Story interface
   ---------------------------------------------------------------- */

const FALLBACK_PHOTOS = [
  '/photos/lead.jpg',
  '/photos/ai.jpg',
  '/photos/code.jpg',
  '/photos/cyber.jpg',
  '/photos/data.jpg',
  '/photos/lab.jpg',
  '/photos/network.jpg',
  '/photos/robot.jpg',
  '/photos/server.jpg',
  '/photos/abstract.jpg',
];

function photoFor(index: number, override?: string | null): string {
  if (override && override.startsWith('http')) return override;
  return FALLBACK_PHOTOS[index % FALLBACK_PHOTOS.length];
}

function timeAgo(ts: number): string {
  const h = Math.round((Date.now() - ts) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/* ----------------------------------------------------------------
   Public API
   ---------------------------------------------------------------- */

export interface LiveEditionData {
  hn: HNStory[];
  devto: DevtoStory[];
  github: GithubRepo[];
  reddit: RedditStory[];
  fetchedAt: number;
  errors: string[];
}

export async function fetchLiveEdition(): Promise<LiveEditionData> {
  const errors: string[] = [];

  const [hnResult, devtoResult, githubResult, redditResult] = await Promise.allSettled([
    fetchHN(12),
    Promise.all([fetchDevto('ai', 5), fetchDevto('machinelearning', 5)]).then(([a, b]) => [...a, ...b]),
    fetchGithubTrending(10),
    fetchReddit(['MachineLearning', 'LocalLLaMA', 'artificial'], 6),
  ]);

  const hn     = hnResult.status     === 'fulfilled' ? hnResult.value     : (errors.push('HN failed'),     []);
  const devto  = devtoResult.status  === 'fulfilled' ? devtoResult.value  : (errors.push('Dev.to failed'), []);
  const github = githubResult.status === 'fulfilled' ? githubResult.value : (errors.push('GitHub failed'), []);
  const reddit = redditResult.status === 'fulfilled' ? redditResult.value : (errors.push('Reddit failed'), []);

  return { hn, devto, github, reddit, fetchedAt: Date.now(), errors };
}

/* Convert live data to the Story shape used by the newspaper */
export function liveDataToStories(data: LiveEditionData): Story[] {
  const stories: Story[] = [];
  let no = 1;

  // HN top stories become the main articles
  data.hn.slice(0, 8).forEach((item, i) => {
    stories.push({
      id: item.id,
      no: no++,
      kicker: item.kicker,
      headline: item.headline,
      standfirst: `Reported on Hacker News with ${item.score} points and ${item.comments} comments.`,
      byline: `${item.author} via Hacker News`,
      dateline: timeAgo(item.timestamp),
      readTime: '4 min',
      photo: photoFor(i),
      photoCaption: `${item.kicker} — The Daily Circuit`,
      body: [
        `This story appeared on Hacker News and attracted significant attention from the tech community, earning ${item.score} upvotes and sparking ${item.comments} comments.`,
        `The full story can be read at the original source. The Daily Circuit surfaces this from Hacker News as part of our commitment to tracking the technology conversation in real time.`,
        `Technology moves quickly. The speed at which stories like this one rise on Hacker News reflects the interests and concerns of engineers, researchers, and builders working at the frontier.`,
      ],
      pullQuote: undefined,
      sources: [{ title: item.headline, kind: 'paper', detail: item.url, date: timeAgo(item.timestamp) }],
      timeline: [],
      tags: [item.kicker, 'Hacker News'],
      featured: i === 0,
      url: item.url,
    });
  });

  // Dev.to articles as deep reads
  data.devto.slice(0, 4).forEach((item, i) => {
    stories.push({
      id: item.id,
      no: no++,
      kicker: item.kicker,
      headline: item.headline,
      standfirst: item.standfirst || `A deep read by ${item.author}.`,
      byline: item.author,
      dateline: 'Dev.to',
      readTime: `${item.readTime} min`,
      photo: photoFor(i + 8, item.photo),
      photoCaption: `${item.headline} — via Dev.to`,
      body: [
        item.standfirst || 'This article covers important developments in the field of artificial intelligence and software engineering.',
        `Written by ${item.author} on Dev.to. The full article is available at the source link.`,
        `This piece earned ${item.reactions} reactions from the developer community.`,
      ],
      pullQuote: undefined,
      sources: [{ title: item.headline, kind: 'paper', detail: item.url, date: 'Dev.to' }],
      timeline: [],
      tags: item.tags,
      featured: false,
      url: item.url,
    });
  });

  // Reddit picks as community voices
  data.reddit.slice(0, 4).forEach((item, i) => {
    stories.push({
      id: item.id,
      no: no++,
      kicker: item.kicker,
      headline: item.headline,
      standfirst: `Hot discussion on r/${item.subreddit} with ${item.score} upvotes.`,
      byline: `u/${item.author} via r/${item.subreddit}`,
      dateline: timeAgo(item.timestamp),
      readTime: '3 min',
      photo: photoFor(i + 12),
      photoCaption: `r/${item.subreddit} — Community`,
      body: [
        `This discussion emerged from the r/${item.subreddit} community on Reddit, collecting ${item.score} upvotes.`,
        `Community discussions like this often surface early signals of emerging trends in artificial intelligence and machine learning research.`,
        `The full thread is available at the original Reddit permalink.`,
      ],
      pullQuote: undefined,
      sources: [
        { title: `r/${item.subreddit} thread`, kind: 'paper', detail: item.permalink, date: timeAgo(item.timestamp) },
      ],
      timeline: [],
      tags: ['Community', item.subreddit],
      featured: false,
      url: item.url,
    });
  });

  return stories;
}


