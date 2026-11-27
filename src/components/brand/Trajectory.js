import React, { useEffect, useRef, useState } from 'react';
import { trajectory } from '../../data/site';
import './Trajectory.css';

/*
 * Career path from the Sichuan system to Canadian titles and coaching.
 * Desktop: a sticky photo stage swaps as each step crosses the middle of the
 * screen. Phones: each step carries its own photo.
 */
function Trajectory() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    const nodes = refs.current.filter(Boolean);
    if (!('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.index));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const progress = (active + 1) / trajectory.length;

  return (
    <div className="trajectory" style={{ '--progress': progress }}>
      <div className="trajectory__stage" aria-hidden="true">
        {trajectory.map((t, i) => (
          <img
            key={t.step}
            src={t.image}
            width={t.width}
            height={t.height}
            alt=""
            loading="lazy"
            decoding="async"
            className={i === active ? 'is-active' : ''}
          />
        ))}
        <div className="trajectory__stage-meta">
          <span className="trajectory__stage-step">{trajectory[active].step}</span>
          <span>{trajectory[active].stage}</span>
        </div>
        <div className="trajectory__meter">
          <span />
        </div>
      </div>

      <ol className="trajectory__list">
        {trajectory.map((t, i) => (
          <li
            key={t.step}
            ref={(n) => (refs.current[i] = n)}
            data-index={i}
            className={`trajectory__step ${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}
          >
            <span className="trajectory__num">{t.step}</span>
            <div className="trajectory__body">
              <p className="trajectory__where">{t.stage}</p>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <img
                className="trajectory__thumb"
                src={t.image}
                width={t.width}
                height={t.height}
                alt={t.imageAlt}
                loading="lazy"
                decoding="async"
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Trajectory;
