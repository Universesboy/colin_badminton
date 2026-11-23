// Refreshes src/data/videoStats.json (publish date, duration, view count) for every
// YouTube id listed in src/data/site.js, using the YouTube Data API v3 videos.list call.
// Usage: YT_API_KEY=... node scripts/update-video-stats.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const key = process.env.YT_API_KEY;
if (!key) {
  console.error('YT_API_KEY is not set');
  process.exit(1);
}
const site = readFileSync(new URL('../src/data/site.js', import.meta.url), 'utf8');
const ids = [...new Set([...site.matchAll(/^\s*id:\s*'([\w-]{11})'/gm)].map((m) => m[1]))];

// ISO 8601 duration (PT1H2M3S) -> seconds
const seconds = (iso) => {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '') || [];
  return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
};

const out = {};
for (let i = 0; i < ids.length; i += 50) {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.search = new URLSearchParams({ part: 'snippet,contentDetails,statistics', id: ids.slice(i, i + 50).join(','), key });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API ${res.status}: ${await res.text()}`);
  for (const v of (await res.json()).items || []) {
    out[v.id] = {
      publishedAt: v.snippet.publishedAt,
      duration: seconds(v.contentDetails.duration),
      views: Number(v.statistics.viewCount || 0),
    };
  }
}
const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
writeFileSync(new URL('../src/data/videoStats.json', import.meta.url), JSON.stringify(sorted, null, 2) + '\n');
console.log(`Updated stats for ${Object.keys(out).length} of ${ids.length} videos`);
