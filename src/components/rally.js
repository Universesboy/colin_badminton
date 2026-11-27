/*
 * Shuttle flight model shared by the hero scenes (CourtScene 2D canvas and
 * HeroScene3D WebGL). World units are metres: x across the court, y up, z
 * along its length, net at z = 0. Flights are integrated with quadratic air
 * drag, which gives the steep fall of a real feather shuttle.
 */

export const HALF_W = 3.05; // doubles half-width
export const SINGLES = 2.59;
export const HALF_L = 6.7;
export const SHORT_SERVICE = 1.98;
export const LONG_SERVICE = 5.94; // doubles long service line
export const NET_TOP = 1.55;
export const NET_BOTTOM = 0.79;

const G = 9.81;
const DRAG = 0.21; // gives a terminal velocity of ~6.8 m/s, like a real feather shuttle
export const DT = 1 / 240;
export const TIME_SCALE = 0.72;

export const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Integrate a flight until the shuttle reaches the floor.
export function simulate(start, vel, dt = DT) {
  const pts = [];
  let [x, y, z] = start;
  let [vx, vy, vz] = vel;
  const steps = Math.ceil(10 / dt);
  for (let i = 0; i < steps; i++) {
    pts.push([x, y, z]);
    const speed = Math.hypot(vx, vy, vz);
    vx += -DRAG * speed * vx * dt;
    vy += (-G - DRAG * speed * vy) * dt;
    vz += -DRAG * speed * vz * dt;
    x += vx * dt;
    y += vy * dt;
    z += vz * dt;
    if (y <= 0) {
      pts.push([x, 0, z]);
      break;
    }
  }
  return pts;
}

// Find a launch speed that lands the shuttle on `target` at a given elevation.
// The search runs on a coarse time step; only the chosen flight is integrated finely.
function aim(start, target, elevationDeg) {
  const dx = target[0] - start[0];
  const dz = target[2] - start[2];
  const dist = Math.hypot(dx, dz);
  const ux = dx / dist;
  const uz = dz / dist;
  const el = (elevationDeg * Math.PI) / 180;
  let lo = 2;
  let hi = 80;
  const velocity = (s) => [ux * s * Math.cos(el), s * Math.sin(el), uz * s * Math.cos(el)];
  for (let i = 0; i < 16; i++) {
    const s = (lo + hi) / 2;
    const pts = simulate(start, velocity(s), 1 / 60);
    const end = pts[pts.length - 1];
    const travelled = (end[0] - start[0]) * ux + (end[2] - start[2]) * uz;
    if (travelled < dist) lo = s;
    else hi = s;
  }
  return simulate(start, velocity((lo + hi) / 2));
}

function clearsNet(pts) {
  for (let i = 1; i < pts.length; i++) {
    if (Math.sign(pts[i][2]) !== Math.sign(pts[i - 1][2])) return pts[i][1] > NET_TOP + 0.08;
  }
  return false;
}

// Choose the next shot from where the shuttle was struck.
export function planShot(from, serve) {
  const side = Math.sign(from[2]) || 1; // hitter's half
  const depth = Math.abs(from[2]);
  let type;
  if (serve) type = Math.random() < 0.6 ? 'low-serve' : 'high-serve';
  else if (from[1] > 2.2) type = pick(['smash', 'smash', 'clear', 'drop']);
  else if (depth < 2.6) type = pick(['lift', 'lift', 'net']);
  else type = pick(['drive', 'lift', 'clear']);

  const across = () => rand(-SINGLES + 0.4, SINGLES - 0.4);
  const spec = {
    'low-serve': { depth: [SHORT_SERVICE + 0.05, SHORT_SERVICE + 0.6], el: [8, 16] },
    'high-serve': { depth: [5.6, 6.5], el: [42, 50] },
    smash: { depth: [2.4, 4.6], el: [-14, -6] },
    clear: { depth: [5.2, 6.4], el: [32, 42] },
    drop: { depth: [1.9, 2.8], el: [2, 14] },
    lift: { depth: [5.0, 6.3], el: [44, 54] },
    net: { depth: [0.6, 1.5], el: [30, 45] },
    drive: { depth: [3.5, 5.5], el: [2, 8] },
  }[type];

  const target = [across(), 0, -side * rand(...spec.depth)];
  let el = rand(...spec.el);
  let pts = aim(from, target, el);
  for (let tries = 0; tries < 8 && !clearsNet(pts); tries++) {
    el += 6;
    pts = aim(from, target, el);
  }
  return { type, pts };
}

// Where the receiver meets the shuttle: on its way down, at a natural height.
export function interceptIndex(pts, type) {
  const apex = pts.reduce((m, p, i) => (p[1] > pts[m][1] ? i : m), 0);
  const deep = Math.abs(pts[pts.length - 1][2]) > 4.2;
  const contact = deep && type !== 'smash' ? rand(2.3, 2.9) : rand(0.45, 1.1);
  for (let i = apex; i < pts.length; i++) {
    if (pts[i][1] <= contact) return i;
  }
  return pts.length - 1;
}
