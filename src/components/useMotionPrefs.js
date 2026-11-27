import { useEffect, useState } from 'react';

const query = (q) => typeof window !== 'undefined' && window.matchMedia && window.matchMedia(q).matches;

// True when the visitor asked the OS for reduced motion. Follows live changes.
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => query('(prefers-reduced-motion: reduce)'));
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on));
  }, []);
  return reduced;
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

/*
 * Picks the hero scene tier once per visit:
 *   '3d'     WebGL court with a modelled shuttle (desktop, capable hardware)
 *   '2d'     canvas court (phones, tablets, modest hardware, no WebGL)
 *   'static' a single frozen rally (reduced motion)
 * Data Saver, few CPU cores or little memory all keep the 3D bundle from loading.
 */
export function sceneTier() {
  if (query('(prefers-reduced-motion: reduce)')) return 'static';
  const nav = window.navigator || {};
  const saveData = nav.connection && nav.connection.saveData;
  const lowCores = nav.hardwareConcurrency && nav.hardwareConcurrency < 4;
  const lowMemory = nav.deviceMemory && nav.deviceMemory < 4;
  const small = query('(max-width: 959px)') || query('(pointer: coarse)');
  if (saveData || lowCores || lowMemory || small || !hasWebGL()) return '2d';
  return '3d';
}
