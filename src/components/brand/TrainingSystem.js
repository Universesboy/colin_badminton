import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon';
import { methodology, topics } from '../../data/site';
import './TrainingSystem.css';

// What each pillar links to in the video library
const LINKS = [
  { topics: ['attack', 'net', 'defence'] },
  { highlights: true },
  { topics: ['footwork', 'conditioning'] },
  { highlights: true },
];

const labelOf = (id) => topics.find((t) => t.id === id)?.label;

// Base position of the player on the half-court diagram
const BASE = { x: 152, y: 250 };
const CORNERS = [
  [52, 44],
  [252, 44],
  [40, 172],
  [264, 172],
  [62, 306],
  [242, 306],
];

function CourtDiagram({ active }) {
  return (
    <svg className={`tsys__court tsys__court--${active}`} viewBox="0 0 304 340" aria-hidden="true" focusable="false">
      <defs>
        <marker id="tsys-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="currentColor" />
        </marker>
      </defs>
      {/* Half court, net at the top */}
      <g className="tsys__lines">
        <rect x="8" y="16" width="288" height="316" rx="2" />
        <line x1="30" y1="16" x2="30" y2="332" />
        <line x1="274" y1="16" x2="274" y2="332" />
        <line x1="8" y1="110" x2="296" y2="110" />
        <line x1="8" y1="308" x2="296" y2="308" />
        <line x1="152" y1="110" x2="152" y2="332" />
        <line className="tsys__net" x1="0" y1="16" x2="304" y2="16" />
      </g>

      {/* 0 Technique: three strokes from the base */}
      <g className="tsys__layer tsys__layer--0">
        <path d={`M${BASE.x} ${BASE.y} Q 70 120 60 24`} markerEnd="url(#tsys-arrow)" />
        <path d={`M${BASE.x} ${BASE.y} Q 180 60 210 30`} markerEnd="url(#tsys-arrow)" strokeDasharray="5 6" />
        <path d={`M${BASE.x} ${BASE.y} L 250 22`} markerEnd="url(#tsys-arrow)" />
      </g>

      {/* 1 Tactics: target zones across the net */}
      <g className="tsys__layer tsys__layer--1">
        {[0, 1, 2].map((c) =>
          [0, 1].map((r) => (
            <rect key={`${c}${r}`} x={14 + c * 94} y={24 + r * 44} width="86" height="38" rx="6" className={(c + r) % 2 ? 'is-hot' : ''} />
          ))
        )}
      </g>

      {/* 2 Physical: six-corner footwork star */}
      <g className="tsys__layer tsys__layer--2">
        {CORNERS.map(([x, y]) => (
          <g key={`${x}${y}`}>
            <line x1={BASE.x} y1={BASE.y - 40} x2={x} y2={y} />
            <circle cx={x} cy={y} r="7" />
          </g>
        ))}
      </g>

      {/* 3 Mental: focus rings at the base */}
      <g className="tsys__layer tsys__layer--3">
        <circle cx={BASE.x} cy={BASE.y - 40} r="26" />
        <circle cx={BASE.x} cy={BASE.y - 40} r="52" />
        <circle cx={BASE.x} cy={BASE.y - 40} r="80" />
      </g>

      <circle className="tsys__player" cx={BASE.x} cy={active === 0 ? BASE.y : BASE.y - 40} r="9" />
    </svg>
  );
}

function TrainingSystem() {
  const [active, setActive] = useState(0);
  const id = useId();
  const pillar = methodology[active];
  const link = LINKS[active];

  const onKey = (e) => {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + methodology.length) % methodology.length;
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <div className="tsys">
      <div className="tsys__tabs" role="tablist" aria-label="Training pillars" onKeyDown={onKey}>
        {methodology.map((m, i) => (
          <button
            key={m.title}
            id={`${id}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${id}-panel`}
            tabIndex={i === active ? 0 : -1}
            className="tsys__tab"
            onClick={() => setActive(i)}
          >
            <span className="tsys__tab-n">0{i + 1}</span>
            <span className="tsys__tab-title">{m.title}</span>
          </button>
        ))}
      </div>

      <div className="tsys__panel" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`}>
        <div className="tsys__visual">
          <CourtDiagram active={active} />
        </div>
        <div className="tsys__detail" key={active}>
          <span className="tsys__big">0{active + 1}</span>
          <h3>{pillar.title}</h3>
          <p>{pillar.text}</p>
          <div className="tsys__related">
            {link.topics ? (
              link.topics.map((t) => (
                <Link key={t} to={`/training?topic=${t}#library`} className="chip">
                  <Icon name="play" /> {labelOf(t)}
                </Link>
              ))
            ) : (
              <Link to="/highlights" className="chip">
                <Icon name="play" /> Watch match play
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainingSystem;
