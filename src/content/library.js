// Reads the content library (videos.json) and shapes it for the pages.
// videos.json is the single file the import pipeline writes; pages never
// hard-code videos.
import data from './videos.json';
import { categoryById, collections } from './taxonomy';

// The player and cards key videos by `id` (the YouTube id today).
function toCard(v) {
  return {
    ...v,
    id: v.source.youtubeId || v.slug,
    poster: v.poster,
    title: v.title.en,
    titleZh: v.title.zh,
    description: v.summary.en,
    descriptionZh: v.summary.zh,
    categoryLabels: v.categories.map((c) => categoryById[c]?.en).filter(Boolean),
  };
}

export const library = data.videos.filter((v) => v.status === 'published').map(toCard);

export const onPage = (page) => library.filter((v) => v.placements.includes(page));

// Collections that have enough published videos on the given page.
export function collectionsFor(videos) {
  return collections
    .map((c) => ({ ...c, videos: videos.filter((v) => v.collections.includes(c.id)) }))
    .filter((c) => c.videos.length >= c.minVideos);
}

// Categories that actually have videos, in taxonomy order.
export function categoriesFor(videos) {
  const used = new Set(videos.flatMap((v) => v.categories));
  return Object.values(categoryById).filter((c) => used.has(c.id));
}

export function formatDuration(sec) {
  if (!sec) return null;
  const m = Math.floor(sec / 60);
  const s = String(Math.round(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

// Legacy shape used by the Highlights page, kept so that page renders
// exactly as before while it is not part of this redesign.
export const legacyHighlights = onPage('highlights').map((v) => ({
  id: v.id,
  poster: v.poster,
  title: v.legacy?.title || v.title,
  description: v.legacy?.description || v.description,
  category: v.legacy?.category || 'matches',
  orientation: v.orientation,
  featured: v.featured,
}));
