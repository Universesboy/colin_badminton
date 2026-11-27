import React from 'react';
import TiltCard from '../TiltCard';
import AnimatedSection from '../AnimatedSection';
import { record } from '../../data/site';
import './RecordBoard.css';

// Headline title as a tilting feature card, the rest of the record as a results table.
function RecordBoard() {
  const [top, ...rest] = record;
  return (
    <div className="record">
      <AnimatedSection className="record__feature-wrap">
        <TiltCard className="record__feature" max={5}>
          <img
            src="/media/national-champion.webp"
            width="933"
            height="1400"
            alt="Colin Zhou holding the 2023 CCAA Men's Singles National Champion banner"
            loading="lazy"
            decoding="async"
          />
          <div className="record__feature-copy">
            <span className="record__year">{top.year}</span>
            <p className="record__feature-event">{top.event}</p>
            <p className="record__feature-result">{top.result}</p>
            <p className="record__feature-level">{top.level} · ranked 1st</p>
          </div>
        </TiltCard>
      </AnimatedSection>

      <AnimatedSection className="record__table-wrap" delay={120}>
        <table className="record__table">
          <caption className="sr-only">Competition record</caption>
          <thead>
            <tr>
              <th scope="col">Event</th>
              <th scope="col">Result</th>
              <th scope="col">Level</th>
            </tr>
          </thead>
          <tbody>
            {rest.map((r) => (
              <tr key={r.event}>
                <th scope="row">
                  {r.event}
                  {r.year && <span className="record__tag">{r.year}</span>}
                </th>
                <td className="record__result">{r.result}</td>
                <td className="record__level">{r.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AnimatedSection>
    </div>
  );
}

export default RecordBoard;
