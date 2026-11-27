// Copies build/index.html to build/<route>.html for each client route.
// GitHub Pages serves /highlights from highlights.html with HTTP 200,
// so inner pages no longer depend on the 404.html redirect.
const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://colinbadminton.com';
const ROUTES = ['highlights', 'training', 'achievements', 'contact'];
const build = path.join(__dirname, '..', 'build');
const index = fs.readFileSync(path.join(build, 'index.html'), 'utf8');

for (const route of ROUTES) {
  // Point canonical and og:url at the route itself before any script runs
  const html = index
    .replace(`rel="canonical" href="${ORIGIN}/"`, `rel="canonical" href="${ORIGIN}/${route}"`)
    .replace(`property="og:url" content="${ORIGIN}/"`, `property="og:url" content="${ORIGIN}/${route}"`)
    // The hero athlete image is only on the home page
    .replace(/<link rel="preload" as="image" href="[^"]*athlete-cutout\.webp"[^>]*>/, '');
  fs.writeFileSync(path.join(build, `${route}.html`), html);
}
console.log(`Wrote ${ROUTES.length} route pages`);
