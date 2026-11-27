import React, { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  LatheGeometry,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  RingGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  ACESFilmicToneMapping,
} from 'three';
import {
  HALF_W,
  SINGLES,
  HALF_L,
  SHORT_SERVICE,
  LONG_SERVICE,
  NET_TOP,
  NET_BOTTOM,
  DT,
  TIME_SCALE,
  rand,
  planShot,
  interceptIndex,
} from './rally';

/*
 * WebGL version of the hero court: a lit regulation court, a modelled
 * shuttlecock flying an endless rally (same flight model as CourtScene) and a
 * chalk-lime trail ribbon. Only imported on capable desktop devices
 * (see HeroStage.js); everything else gets the 2D canvas scene.
 *
 * Performance rules (after the R3F "scaling performance" guide and the
 * three.js forum advice on low-end devices):
 * - pixel ratio capped at 1.75 and dropped to 1 if frames run slow;
 * - nothing renders while the hero is off screen or the tab is hidden;
 * - geometry is built once; the trail ribbon reuses one preallocated buffer;
 * - if the device still can't keep up, onFallback() hands over to 2D.
 */

const LIME = [0.784, 0.945, 0.412];
const SHUTTLE_SCALE = 4; // a real shuttle (85 mm) would be invisible at this distance
const TRAIL_MAX = 110;

function radialTexture(inner, outer, size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function netTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 64;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(255,255,255,0.55)';
  g.lineWidth = 1;
  for (let x = 0; x <= 512; x += 8) {
    g.beginPath();
    g.moveTo(x + 0.5, 0);
    g.lineTo(x + 0.5, 64);
    g.stroke();
  }
  for (let y = 0; y <= 64; y += 8) {
    g.beginPath();
    g.moveTo(0, y + 0.5);
    g.lineTo(512, y + 0.5);
    g.stroke();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function buildCourt(scene) {
  // Surrounding floor and court surface
  const floor = new Mesh(new PlaneGeometry(80, 80), new MeshStandardMaterial({ color: 0x0b1410, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  scene.add(floor);

  const court = new Mesh(
    new PlaneGeometry(HALF_W * 2 + 0.6, HALF_L * 2 + 0.6),
    new MeshStandardMaterial({ color: 0x174a37, roughness: 0.82, metalness: 0 })
  );
  court.rotation.x = -Math.PI / 2;
  scene.add(court);

  // Light pool on the floor, like an arena spot
  const pool = new Mesh(
    new PlaneGeometry(26, 26),
    new MeshBasicMaterial({
      map: radialTexture('rgba(120, 200, 140, 0.22)', 'rgba(120, 200, 140, 0)'),
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.004;
  scene.add(pool);

  // Court lines: 40 mm wide strips
  const lineMat = new MeshBasicMaterial({ color: 0xeaf5ec, transparent: true, opacity: 0.62, depthWrite: false });
  const lines = new Group();
  const strip = (x1, z1, x2, z2) => {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const along = Math.abs(z2 - z1) > Math.abs(x2 - x1);
    const m = new Mesh(new PlaneGeometry(along ? 0.04 : len, along ? len : 0.04), lineMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set((x1 + x2) / 2, 0.006, (z1 + z2) / 2);
    lines.add(m);
  };
  strip(-HALF_W, -HALF_L, HALF_W, -HALF_L);
  strip(-HALF_W, HALF_L, HALF_W, HALF_L);
  [-HALF_W, HALF_W, -SINGLES, SINGLES].forEach((x) => strip(x, -HALF_L, x, HALF_L));
  [-1, 1].forEach((s) => {
    strip(-HALF_W, s * SHORT_SERVICE, HALF_W, s * SHORT_SERVICE);
    strip(-HALF_W, s * LONG_SERVICE, HALF_W, s * LONG_SERVICE);
    strip(0, s * SHORT_SERVICE, 0, s * HALF_L);
  });
  scene.add(lines);

  // Net
  const postMat = new MeshStandardMaterial({ color: 0xdfe8e1, roughness: 0.4, metalness: 0.3 });
  [-HALF_W, HALF_W].forEach((x) => {
    const post = new Mesh(new CylinderGeometry(0.025, 0.025, NET_TOP, 12), postMat);
    post.position.set(x, NET_TOP / 2, 0);
    scene.add(post);
  });
  const net = new Mesh(
    new PlaneGeometry(HALF_W * 2, NET_TOP - NET_BOTTOM),
    new MeshBasicMaterial({ map: netTexture(), transparent: true, opacity: 0.55, side: DoubleSide, depthWrite: false })
  );
  net.position.set(0, (NET_TOP + NET_BOTTOM) / 2, 0);
  scene.add(net);
  const tape = new Mesh(new PlaneGeometry(HALF_W * 2, 0.05), new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide }));
  tape.position.set(0, NET_TOP - 0.025, 0.001);
  scene.add(tape);
}

// Shuttlecock modelled along +Z (cork leading), so lookAt() points it along its flight
function buildShuttle() {
  const s = SHUTTLE_SCALE;
  const group = new Group();
  const corkR = 0.0125 * s;

  const cork = new Mesh(
    new SphereGeometry(corkR, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new MeshStandardMaterial({ color: 0xf6f3ea, roughness: 0.55 })
  );
  cork.rotation.x = Math.PI / 2;
  cork.position.z = 0.004 * s;
  group.add(cork);

  // Colin's smash-red band around the cork base
  const band = new Mesh(
    new CylinderGeometry(corkR, corkR, 0.006 * s, 24, 1, true),
    new MeshStandardMaterial({ color: 0xe8452c, roughness: 0.5, side: DoubleSide })
  );
  band.rotation.x = Math.PI / 2;
  band.position.z = 0.001 * s;
  group.add(band);

  // Feather skirt: a lathe profile flaring from the cork
  const profile = [];
  const length = 0.062 * s;
  const top = 0.032 * s;
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    profile.push(new Vector2(corkR * 0.95 + (top - corkR * 0.95) * Math.pow(t, 0.85), -t * length));
  }
  const skirtGeo = new LatheGeometry(profile, 32);
  skirtGeo.rotateX(Math.PI / 2);
  const skirt = new Mesh(
    skirtGeo,
    new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.65,
      transparent: true,
      opacity: 0.82,
      side: DoubleSide,
      depthWrite: false,
      emissive: 0x2a3a30,
    })
  );
  group.add(skirt);

  // Feather shafts and binding threads
  const shafts = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    shafts.push(Math.cos(a) * corkR, Math.sin(a) * corkR, -0.002 * s);
    shafts.push(Math.cos(a) * top, Math.sin(a) * top, -length);
  }
  const shaftGeo = new BufferGeometry();
  shaftGeo.setAttribute('position', new BufferAttribute(new Float32Array(shafts), 3));
  group.add(new LineSegments(shaftGeo, new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })));

  const threadMat = new MeshBasicMaterial({ color: 0xdfe6df });
  [0.38, 0.62].forEach((t) => {
    const r = corkR * 0.95 + (top - corkR * 0.95) * Math.pow(t, 0.85);
    const ring = new Mesh(new TorusGeometry(r, 0.0007 * s, 4, 32), threadMat);
    ring.position.z = -t * length;
    group.add(ring);
  });

  return group;
}

function buildTrail() {
  const geo = new BufferGeometry();
  const pos = new Float32Array(TRAIL_MAX * 2 * 3);
  const col = new Float32Array(TRAIL_MAX * 2 * 3);
  const idx = [];
  for (let i = 0; i < TRAIL_MAX - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  geo.setAttribute('position', new BufferAttribute(pos, 3));
  geo.setAttribute('color', new BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.setDrawRange(0, 0);
  const mesh = new Mesh(
    geo,
    new MeshBasicMaterial({ vertexColors: true, transparent: true, blending: AdditiveBlending, depthWrite: false, side: DoubleSide })
  );
  mesh.frustumCulled = false;
  return mesh;
}

function HeroScene3D({ className, onFallback }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    let renderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      onFallback && onFallback();
      return undefined;
    }
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    let maxDpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(maxDpr);

    const scene = new Scene();
    scene.fog = new Fog(0x0b1410, 16, 38);
    const camera = new PerspectiveCamera(30, 1, 0.1, 120);

    scene.add(new HemisphereLight(0xe4ffe9, 0x0b1410, 0.9));
    const key = new DirectionalLight(0xffffff, 2.2);
    key.position.set(5, 12, 7);
    scene.add(key);
    const rim = new DirectionalLight(0xc8f169, 0.8);
    rim.position.set(-6, 4, -8);
    scene.add(rim);

    buildCourt(scene);
    const shuttle = buildShuttle();
    scene.add(shuttle);
    const trail = buildTrail();
    scene.add(trail);

    const shadow = new Mesh(
      new PlaneGeometry(0.7, 0.7),
      new MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.65)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    scene.add(shadow);

    const glow = new Mesh(
      new PlaneGeometry(1, 1),
      new MeshBasicMaterial({
        map: radialTexture('rgba(200,241,105,0.7)', 'rgba(200,241,105,0)'),
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      })
    );
    scene.add(glow);

    const ripple = new Mesh(
      new RingGeometry(0.86, 0.92, 48),
      new MeshBasicMaterial({ color: 0xc8f169, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending })
    );
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.y = 0.01;
    scene.add(ripple);

    const ghostMat = new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, depthWrite: false });
    const ghosts = []; // { line, alpha }

    // State
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let last = 0;
    let clock = 0;
    let shot = null;
    let rippleT = -1;
    let pauseUntil = 0;
    let rallyLength = 0;
    let spin = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollLift = 0;
    const perf = { frames: 0, total: 0, stage: 0 };

    const tmpA = new Vector3();
    const tmpB = new Vector3();
    const tmpT = new Vector3();
    const tmpV = new Vector3();
    const tmpS = new Vector3();

    function launch(from, serve) {
      const { type, pts } = planShot(from, serve);
      rallyLength += 1;
      const finish = rallyLength > 3 && Math.random() < 0.22;
      const end = finish ? pts.length - 1 : interceptIndex(pts, type);
      shot = { pts, end, t: 0, finish };
    }

    function newRally() {
      const side = Math.random() < 0.5 ? 1 : -1;
      rallyLength = 0;
      launch([rand(-1, 1), 1.0, side * rand(2.2, 2.8)], true);
    }

    function addGhost(pts) {
      const arr = new Float32Array(Math.ceil(pts.length / 3) * 3);
      let n = 0;
      for (let i = 0; i < pts.length; i += 3) {
        arr[n++] = pts[i][0];
        arr[n++] = pts[i][1];
        arr[n++] = pts[i][2];
      }
      const geo = new BufferGeometry();
      geo.setAttribute('position', new BufferAttribute(arr.subarray(0, n), 3));
      const line = new Line(geo, ghostMat.clone());
      scene.add(line);
      ghosts.push({ line, alpha: 1 });
      if (ghosts.length > 6) removeGhost(0);
    }

    function removeGhost(i) {
      const g = ghosts[i];
      scene.remove(g.line);
      g.line.geometry.dispose();
      g.line.material.dispose();
      ghosts.splice(i, 1);
    }

    function updateCamera() {
      const narrow = width < 760;
      const yaw = (narrow ? 0.62 : 0.78) + Math.sin(clock * 0.045) * 0.1 + mouse.x * 0.16;
      const pitch = (narrow ? 0.42 : 0.3) + mouse.y * 0.05 + scrollLift * 0.22;
      const dist = narrow ? 18 : 19.5;
      camera.position.set(dist * Math.sin(yaw) * Math.cos(pitch), 0.4 + dist * Math.sin(pitch), dist * Math.cos(yaw) * Math.cos(pitch));
      camera.lookAt(0, 0.4, 0);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Shift the court towards the right/lower part of the frame, behind the athlete
      const narrow = width < 760;
      camera.setViewOffset(width, height, -width * (narrow ? 0 : 0.2), -height * (narrow ? 0.2 : 0.22), width, height);
      camera.updateProjectionMatrix();
      if (!running) render();
    }

    function updateTrail() {
      const geo = trail.geometry;
      if (!shot) {
        geo.setDrawRange(0, 0);
        return;
      }
      const idx = Math.min(Math.floor(shot.t / DT), shot.end);
      const tail = Math.max(0, idx - 170);
      const step = Math.max(1, Math.ceil((idx - tail) / (TRAIL_MAX - 1)));
      const pos = geo.attributes.position.array;
      const col = geo.attributes.color.array;
      const pts = shot.pts;
      let count = 0;
      for (let i = tail; i <= idx && count < TRAIL_MAX; i += step) {
        const k = idx === tail ? 1 : (i - tail) / (idx - tail);
        const p = pts[i];
        const pPrev = pts[Math.max(0, i - step)];
        const pNext = pts[Math.min(idx, i + step)];
        tmpT.set(pNext[0] - pPrev[0], pNext[1] - pPrev[1], pNext[2] - pPrev[2]);
        tmpV.set(camera.position.x - p[0], camera.position.y - p[1], camera.position.z - p[2]);
        tmpS.crossVectors(tmpT, tmpV).normalize().multiplyScalar(0.05 * (0.25 + 0.75 * k));
        const o = count * 6;
        pos[o] = p[0] + tmpS.x;
        pos[o + 1] = p[1] + tmpS.y;
        pos[o + 2] = p[2] + tmpS.z;
        pos[o + 3] = p[0] - tmpS.x;
        pos[o + 4] = p[1] - tmpS.y;
        pos[o + 5] = p[2] - tmpS.z;
        const a = Math.pow(k, 1.6) * 0.95;
        for (let v = 0; v < 2; v++) {
          col[o + v * 3] = LIME[0] * a;
          col[o + v * 3 + 1] = LIME[1] * a;
          col[o + v * 3 + 2] = LIME[2] * a;
        }
        count += 1;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      geo.setDrawRange(0, Math.max(0, count - 1) * 6);
    }

    function updateShuttle() {
      if (!shot) {
        shuttle.visible = false;
        shadow.visible = false;
        glow.visible = false;
        return;
      }
      const idx = Math.min(Math.floor(shot.t / DT), shot.end);
      const p = shot.pts[idx];
      const q = shot.pts[Math.max(0, idx - 4)];
      shuttle.visible = true;
      shadow.visible = true;
      glow.visible = true;
      shuttle.position.set(p[0], p[1], p[2]);
      tmpA.set(p[0], p[1], p[2]);
      tmpB.set(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
      if (tmpB.lengthSq() > 1e-8) {
        shuttle.lookAt(tmpA.add(tmpB));
        shuttle.rotateZ(spin);
      }
      const h = Math.max(0, p[1]);
      shadow.position.set(p[0], 0.008, p[2]);
      const sc = 0.6 + h * 0.25;
      shadow.scale.set(sc, sc, sc);
      shadow.material.opacity = Math.max(0.15, 0.85 - h * 0.12);
      glow.position.set(p[0], p[1], p[2]);
      glow.quaternion.copy(camera.quaternion);
      glow.scale.setScalar(0.9);
    }

    function render() {
      updateCamera();
      updateTrail();
      updateShuttle();
      renderer.render(scene, camera);
    }

    function step(dt) {
      clock += dt;
      spin += dt * 9;
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 2.5);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 2.5);
      for (let i = ghosts.length - 1; i >= 0; i--) {
        ghosts[i].alpha -= dt * 0.12;
        if (ghosts[i].alpha <= 0) removeGhost(i);
        else ghosts[i].line.material.opacity = 0.16 * ghosts[i].alpha;
      }
      if (rippleT >= 0) {
        rippleT += dt;
        const k = Math.min(rippleT / 0.9, 1);
        ripple.scale.setScalar(0.05 + k);
        ripple.material.opacity = 0.9 * (1 - k);
        if (rippleT > 1.2) {
          rippleT = -1;
          ripple.material.opacity = 0;
        }
      }
      if (clock < pauseUntil) return;
      if (!shot) {
        newRally();
        return;
      }
      shot.t += dt * TIME_SCALE;
      if (shot.t / DT >= shot.end) {
        const endPt = shot.pts[shot.end];
        addGhost(shot.pts.slice(0, shot.end + 1));
        if (shot.finish) {
          ripple.position.x = endPt[0];
          ripple.position.z = endPt[2];
          rippleT = 0;
          shot = null;
          pauseUntil = clock + 1.6;
        } else {
          launch(endPt, false);
        }
      }
    }

    // Adaptive quality: drop resolution, then hand over to the 2D scene
    function watchPerf(frameMs) {
      if (perf.stage > 1) return;
      perf.frames += 1;
      perf.total += frameMs;
      if (perf.frames < 90) return;
      const avg = perf.total / perf.frames;
      perf.frames = 0;
      perf.total = 0;
      if (avg > 30 && perf.stage === 0) {
        perf.stage = 1;
        maxDpr = 1;
        renderer.setPixelRatio(1);
        resize();
      } else if (avg > 40 && perf.stage === 1) {
        perf.stage = 2;
        onFallback && onFallback();
      }
    }

    function frame(now) {
      const ms = now - last;
      const dt = Math.min(ms / 1000, 1 / 20);
      last = now;
      step(dt);
      render();
      watchPerf(ms);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const onPointer = (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      scrollLift = Math.min(window.scrollY / Math.max(height, 1), 1);
    };
    let visible = true;
    const onVisibility = () => (document.hidden ? stop() : visible && start());
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onLost = (e) => {
      e.preventDefault();
      onFallback && onFallback();
    };
    canvas.addEventListener('webglcontextlost', onLost);
    if (window.matchMedia('(pointer: fine)').matches) window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [onFallback]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

export default HeroScene3D;
