import stats from '../data/videoStats.json';

// Sort orders offered on the video pages. 'default' keeps the order in site.js.
export const sortOptions = [
  { id: 'default', label: 'Featured' },
  { id: 'views', label: 'Most viewed' },
  { id: 'newest', label: 'Newest' },
  { id: 'longest', label: 'Longest' },
  { id: 'shortest', label: 'Shortest' },
];

export const statsFor = (id) => stats[id];

// Videos without stats yet keep their relative order and go after those that have them.
export function sortVideos(videos, sort) {
  if (sort === 'default') return videos;
  const value = {
    views: (s) => s.views,
    newest: (s) => Date.parse(s.publishedAt),
    longest: (s) => s.duration,
    shortest: (s) => -s.duration,
  }[sort];
  return videos
    .map((v, i) => ({ v, i, s: stats[v.id] }))
    .sort((a, b) => (a.s && b.s ? value(b.s) - value(a.s) || a.i - b.i : a.s ? -1 : b.s ? 1 : a.i - b.i))
    .map((x) => x.v);
}

export const formatDuration = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = String(sec % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
};

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
export const formatViews = (n) => `${compact.format(n)} ${n === 1 ? 'view' : 'views'}`;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'short' });
