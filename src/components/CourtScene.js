import React, { useEffect, useRef } from 'react';

/*
 * A regulation badminton court rendered in true 3D perspective on a 2D canvas,
 * with an endless rally of shuttle flights simulated with quadratic air drag.
 *
 * World units are metres: x across the court, y up, z along its length, net
 * at z = 0. No WebGL or 3D library is needed: every point is projected through
 * a small pinhole camera, which keeps the bundle tiny and works everywhere.
 */

const HALF_W = 3.05; // doubles half-width
const SINGLES = 2.59;
const HALF_L = 6.7;
const SHORT_SERVICE = 1.98;
const LONG_SERVICE = 5.94; // doubles long service line
const NET_TOP = 1.55;
const NET_BOTTOM = 0.79;

const G = 9.81;
const DRAG = 0.21; // gives a terminal velocity of ~6.8 m/s, like a real feather shuttle
const DT = 1 / 240;
const TIME_SCALE = 0.72;

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Integrate a flight until the shuttle reaches the floor.
function simulate(start, vel, dt = DT) {
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
function planShot(from, serve) {
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
function interceptIndex(pts, type) {
  const apex = pts.reduce((m, p, i) => (p[1] > pts[m][1] ? i : m), 0);
  const deep = Math.abs(pts[pts.length - 1][2]) > 4.2;
  const contact = deep && type !== 'smash' ? rand(2.3, 2.9) : rand(0.45, 1.1);
  for (let i = apex; i < pts.length; i++) {
    if (pts[i][1] <= contact) return i;
  }
  return pts.length - 1;
}

function CourtScene({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let last = 0;
    let clock = 0;

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollLift = 0;

    // Rally state
    const trails = []; // finished flights, faded over time
    let shot = null; // { pts, end, t, landed }
    let ripple = null; // { x, z, t }
    let pauseUntil = 0;
    let rallyLength = 0;

    function newRally() {
      const side = Math.random() < 0.5 ? 1 : -1;
      const from = [rand(-1, 1), 1.0, side * rand(2.2, 2.8)];
      rallyLength = 0;
      launch(from, true);
    }

    function launch(from, serve) {
      const { type, pts } = planShot(from, serve);
      rallyLength += 1;
      // End the rally now and then so the shuttle visibly lands
      const finish = rallyLength > 3 && Math.random() < 0.22;
      const end = finish ? pts.length - 1 : interceptIndex(pts, type);
      shot = { pts, end, t: 0, finish, type };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.5 : 1.75);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (!running) draw();
    }

    // Camera
    function camera() {
      const narrow = width < 760;
      const yaw = (narrow ? 0.62 : 0.78) + Math.sin(clock * 0.045) * 0.1 + mouse.x * 0.16;
      const pitch = (narrow ? 0.42 : 0.3) + mouse.y * 0.05 + scrollLift * 0.22;
      const dist = narrow ? 17.5 : 19;
      const target = [0, 0.4, 0];
      const pos = [
        target[0] + dist * Math.sin(yaw) * Math.cos(pitch),
        target[1] + dist * Math.sin(pitch),
        target[2] + dist * Math.cos(yaw) * Math.cos(pitch),
      ];
      const f = norm(sub(target, pos));
      const r = norm(cross(f, [0, 1, 0]));
      const u = cross(r, f);
      return {
        pos,
        f,
        r,
        u,
        focal: Math.min(width, height * 1.5) * (narrow ? 1.25 : 1.1),
        cx: width * (narrow ? 0.5 : 0.7),
        cy: height * (narrow ? 0.7 : 0.76),
      };
    }

    function project(cam, p) {
      const d = sub(p, cam.pos);
      const z = dot(d, cam.f);
      if (z < 0.2) return null;
      return [cam.cx + (cam.focal * dot(d, cam.r)) / z, cam.cy - (cam.focal * dot(d, cam.u)) / z, z];
    }

    function line(cam, a, b) {
      const pa = project(cam, a);
      const pb = project(cam, b);
      if (!pa || !pb) return;
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
    }

    function drawCourt(cam) {
      // Floor glow and court surface
      const centre = project(cam, [0, 0, 0]);
      if (centre) {
        const glow = ctx.createRadialGradient(centre[0], centre[1], 0, centre[0], centre[1], Math.max(width, height) * 0.55);
        glow.addColorStop(0, 'rgba(20, 144, 126, 0.16)');
        glow.addColorStop(1, 'rgba(20, 144, 126, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }
      const corners = [
        [-HALF_W, 0, -HALF_L],
        [HALF_W, 0, -HALF_L],
        [HALF_W, 0, HALF_L],
        [-HALF_W, 0, HALF_L],
      ].map((p) => project(cam, p));
      if (corners.every(Boolean)) {
        ctx.beginPath();
        corners.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.closePath();
        ctx.fillStyle = 'rgba(13, 92, 81, 0.22)';
        ctx.fill();
      }

      ctx.beginPath();
      // Boundary and singles sidelines
      line(cam, [-HALF_W, 0, -HALF_L], [HALF_W, 0, -HALF_L]);
      line(cam, [-HALF_W, 0, HALF_L], [HALF_W, 0, HALF_L]);
      for (const x of [-HALF_W, HALF_W, -SINGLES, SINGLES]) line(cam, [x, 0, -HALF_L], [x, 0, HALF_L]);
      for (const s of [-1, 1]) {
        line(cam, [-HALF_W, 0, s * SHORT_SERVICE], [HALF_W, 0, s * SHORT_SERVICE]);
        line(cam, [-HALF_W, 0, s * LONG_SERVICE], [HALF_W, 0, s * LONG_SERVICE]);
        line(cam, [0, 0, s * SHORT_SERVICE], [0, 0, s * HALF_L]);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    function drawNet(cam) {
      ctx.beginPath();
      for (let x = -HALF_W; x <= HALF_W + 0.001; x += 0.25) line(cam, [x, NET_BOTTOM, 0], [x, NET_TOP, 0]);
      for (let y = NET_BOTTOM; y <= NET_TOP; y += 0.095) line(cam, [-HALF_W, y, 0], [HALF_W, y, 0]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      line(cam, [-HALF_W, NET_TOP, 0], [HALF_W, NET_TOP, 0]);
      line(cam, [-HALF_W, 0, 0], [-HALF_W, NET_TOP, 0]);
      line(cam, [HALF_W, 0, 0], [HALF_W, NET_TOP, 0]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function drawPath(cam, pts, from, to, color, widthPx, fadeTail) {
      if (to - from < 2) return;
      const stepSize = 3;
      let prev = project(cam, pts[from]);
      for (let i = from + stepSize; i <= to; i += stepSize) {
        const p = project(cam, pts[Math.min(i, to)]);
        if (!p || !prev) {
          prev = p;
          continue;
        }
        const k = fadeTail ? (i - from) / (to - from) : 1;
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(p[0], p[1]);
        ctx.strokeStyle = color(k);
        ctx.lineWidth = widthPx * (0.4 + 0.6 * k);
        ctx.stroke();
        prev = p;
      }
    }

    function drawShuttle(cam, p, prevP) {
      const head = project(cam, p);
      const ground = project(cam, [p[0], 0, p[2]]);
      if (ground) {
        ctx.beginPath();
        ctx.ellipse(ground[0], ground[1], 7, 2.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();
        ctx.beginPath();
        ctx.setLineDash([2, 4]);
        ctx.moveTo(ground[0], ground[1]);
        if (head) ctx.lineTo(head[0], head[1]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (!head) return;
      const halo = ctx.createRadialGradient(head[0], head[1], 0, head[0], head[1], 22);
      halo.addColorStop(0, 'rgba(255, 106, 77, 0.55)');
      halo.addColorStop(1, 'rgba(255, 106, 77, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(head[0] - 22, head[1] - 22, 44, 44);

      // Feather skirt trails behind the cork, along the direction of travel
      const back = prevP && project(cam, prevP);
      if (back) {
        const ang = Math.atan2(head[1] - back[1], head[0] - back[0]);
        ctx.save();
        ctx.translate(head[0], head[1]);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-11, -5);
        ctx.lineTo(-11, 5);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(head[0], head[1], 3.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    function drawRipple(cam) {
      if (!ripple) return;
      const k = Math.min(ripple.t / 0.9, 1);
      ctx.beginPath();
      for (let i = 0; i <= 32; i++) {
        const a = (i / 32) * Math.PI * 2;
        const p = project(cam, [ripple.x + Math.cos(a) * k * 0.9, 0, ripple.z + Math.sin(a) * k * 0.9]);
        if (!p) continue;
        if (i) ctx.lineTo(p[0], p[1]);
        else ctx.moveTo(p[0], p[1]);
      }
      ctx.strokeStyle = `rgba(255, 106, 77, ${0.8 * (1 - k)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function draw() {
      if (!width || !height) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const cam = camera();
      drawCourt(cam);

      // Earlier flights of this rally, as fading traces
      trails.forEach((tr) => {
        const a = tr.alpha;
        drawPath(cam, tr.pts, 0, tr.pts.length - 1, () => `rgba(255, 255, 255, ${0.16 * a})`, 1.2, false);
      });

      drawNet(cam);
      drawRipple(cam);

      if (shot) {
        const idx = Math.min(Math.floor(shot.t / DT), shot.end);
        const tail = Math.max(0, idx - 150);
        drawPath(cam, shot.pts, tail, idx, (k) => `rgba(255, 106, 77, ${0.9 * k})`, 2.4, true);
        drawShuttle(cam, shot.pts[idx], shot.pts[Math.max(0, idx - 4)]);
      }
    }

    function step(dt) {
      clock += dt;
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 2.5);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 2.5);
      trails.forEach((tr) => {
        tr.alpha -= dt * 0.12;
      });
      while (trails.length && trails[0].alpha <= 0) trails.shift();
      if (ripple) {
        ripple.t += dt;
        if (ripple.t > 1.2) ripple = null;
      }
      if (clock < pauseUntil) return;
      if (!shot) {
        newRally();
        return;
      }
      shot.t += dt * TIME_SCALE;
      if (shot.t / DT >= shot.end) {
        const endPt = shot.pts[shot.end];
        trails.push({ pts: shot.pts.slice(0, shot.end + 1), alpha: 1 });
        if (trails.length > 6) trails.shift();
        if (shot.finish) {
          ripple = { x: endPt[0], z: endPt[2], t: 0 };
          shot = null;
          pauseUntil = clock + 1.6;
        } else {
          launch(endPt, false);
        }
      }
    }

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    // Static composition for reduced motion: one complete rally, frozen
    function staticRally() {
      let from = [0.4, 2.6, 4.6];
      [0, 1, 2, 3].forEach(() => {
        const { type, pts } = planShot(from, false);
        const end = interceptIndex(pts, type);
        trails.push({ pts: pts.slice(0, end + 1), alpha: 1.6 });
        from = pts[end];
      });
    }

    const onPointer = (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      scrollLift = Math.min(window.scrollY / Math.max(height, 1), 1);
      if (!running) draw();
    };
    const onVisibility = () => (document.hidden ? stop() : visible && start());

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (finePointer && !reduceMotion) window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    if (reduceMotion) {
      staticRally();
      draw();
    } else {
      start();
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function norm(a) {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}

export default CourtScene;
