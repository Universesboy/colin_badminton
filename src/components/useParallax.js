import { useEffect } from 'react';

/*
 * Writes pointer and scroll position into CSS custom properties on `ref`:
 *   --px, --py  pointer position across the viewport, -1 … 1 (fine pointers only)
 *   --sy        how far the element has scrolled out of view, 0 … 1
 * CSS turns them into layered transforms, so React never re-renders.
 * Skipped entirely for reduced motion.
 */
export default function useParallax(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const fine = window.matchMedia('(pointer: fine)').matches;
    let raf = 0;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;

    const apply = () => {
      raf = 0;
      px += (tx - px) * 0.12;
      py += (ty - py) * 0.12;
      const rect = el.getBoundingClientRect();
      const sy = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
      el.style.setProperty('--px', px.toFixed(4));
      el.style.setProperty('--py', py.toFixed(4));
      el.style.setProperty('--sy', sy.toFixed(4));
      if (Math.abs(tx - px) > 0.001 || Math.abs(ty - py) > 0.001) raf = requestAnimationFrame(apply);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onPointer = (e) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      queue();
    };

    if (fine) window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', queue, { passive: true });
    queue();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', queue);
    };
  }, [ref]);
}
