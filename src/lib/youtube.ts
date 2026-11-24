/* =============================================================
   YouTube embed helper
   Detects YouTube URLs in story bodies / source URLs and returns
   an embed-safe src. No API key needed — just URL parsing.
   ============================================================= */

const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
];

/** Extract a YouTube video ID from a URL string, or null if not YouTube. */
export function extractYouTubeId(url: string): string | null {
  for (const pat of YT_PATTERNS) {
    const m = url.match(pat);
    if (m) return m[1];
  }
  return null;
}

/** Build a privacy-enhanced YouTube embed URL. */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
}

/** Scan a story's URL and body text for a YouTube link. */
export function findStoryVideo(url: string, body: string[]): string | null {
  const id = extractYouTubeId(url);
  if (id) return youtubeEmbedUrl(id);

  for (const para of body) {
    const urlMatches = para.match(/https?:\/\/[^\s)]+/g) ?? [];
    for (const u of urlMatches) {
      const vid = extractYouTubeId(u);
      if (vid) return youtubeEmbedUrl(vid);
    }
  }
  return null;
}
