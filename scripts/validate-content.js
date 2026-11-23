// Checks src/content/videos.json before every build. Fails the build on
// duplicate videos, unknown categories/collections or missing posters, so a
// bad automated import can never reach production.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const { videos } = JSON.parse(fs.readFileSync(path.join(root, 'src/content/videos.json'), 'utf8'));
const taxonomySrc = fs.readFileSync(path.join(root, 'src/content/taxonomy.js'), 'utf8');

// Pull ids out of taxonomy.js without a bundler: categories and collections
// are the only blocks with `id: '...'` entries.
const section = (name) => {
  const start = taxonomySrc.indexOf(`export const ${name}`);
  const end = taxonomySrc.indexOf('];', start);
  return [...taxonomySrc.slice(start, end).matchAll(/id: '([^']+)'/g)].map((m) => m[1]);
};
const categories = new Set(section('categories'));
const collections = new Set(section('collections'));
const statuses = new Set(['draft', 'review', 'published', 'archived']);
const placements = new Set(['training', 'highlights', 'home']);

const errors = [];
const seen = { slug: new Map(), youtubeId: new Map(), xhsNoteId: new Map(), fileSha256: new Map() };

const unique = (key, value, slug) => {
  if (!value) return;
  if (seen[key].has(value)) errors.push(`${slug}: duplicate ${key} "${value}" (also in ${seen[key].get(value)})`);
  else seen[key].set(value, slug);
};

for (const v of videos) {
  const s = v.slug || '(missing slug)';
  if (!/^[a-z0-9-]+$/.test(v.slug || '')) errors.push(`${s}: slug must be lowercase letters, digits and dashes`);
  unique('slug', v.slug, s);
  unique('youtubeId', v.source?.youtubeId, s);
  unique('xhsNoteId', v.source?.xhsNoteId, s);
  unique('fileSha256', v.source?.fileSha256, s);
  if (!v.title?.en || !v.title?.zh) errors.push(`${s}: needs title.en and title.zh`);
  if (!v.summary?.en || !v.summary?.zh) errors.push(`${s}: needs summary.en and summary.zh`);
  if (!statuses.has(v.status)) errors.push(`${s}: unknown status "${v.status}"`);
  if (!v.categories?.length) errors.push(`${s}: needs at least one category`);
  for (const c of v.categories || []) if (!categories.has(c)) errors.push(`${s}: unknown category "${c}"`);
  for (const c of v.collections || []) if (!collections.has(c)) errors.push(`${s}: unknown collection "${c}"`);
  for (const p of v.placements || []) if (!placements.has(p)) errors.push(`${s}: unknown placement "${p}"`);
  if (!['landscape', 'portrait'].includes(v.orientation)) errors.push(`${s}: orientation must be landscape or portrait`);
  if (!v.poster || !fs.existsSync(path.join(root, 'public', v.poster))) errors.push(`${s}: poster file not found (${v.poster})`);
  if (v.status === 'published' && !v.source?.youtubeId && !v.source?.mediaUrl) {
    errors.push(`${s}: a published video needs a playable source (youtubeId or mediaUrl)`);
  }
}

if (errors.length) {
  console.error(`Content check failed (${errors.length}):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`Content check passed: ${videos.length} videos`);
