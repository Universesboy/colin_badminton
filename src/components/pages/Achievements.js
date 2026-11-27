import React, { useCallback, useState } from 'react';
import PageHeader, { usePageMeta } from '../PageHeader';
import AnimatedSection from '../AnimatedSection';
import Modal from '../Modal';
import Icon from '../Icon';
import RecordBoard from '../brand/RecordBoard';
import Trajectory from '../brand/Trajectory';
import { coaching, competition, gallery, teaching } from '../../data/site';
import './Achievements.css';

function Lightbox({ index, setIndex }) {
  const item = gallery[index];
  const close = useCallback(() => setIndex(null), [setIndex]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + gallery.length) % gallery.length), [setIndex]);
  const next = useCallback(() => setIndex((i) => (i + 1) % gallery.length), [setIndex]);
  return (
    <Modal label={`Photo: ${item.title}`} onClose={close} onPrev={prev} onNext={next} counter={`${index + 1} / ${gallery.length}`}>
      <img className="lightbox-img" src={item.src} width={item.width} height={item.height} alt={`${item.title} — ${item.text}`} />
      <div className="modal__caption">
        <h2>{item.title}</h2>
        <p>{item.text}</p>
      </div>
    </Modal>
  );
}

function Achievements() {
  usePageMeta('Achievements & Experience', "Colin Zhou's competition record and coaching experience: CCAA and OCAA Men's Singles Champion, former Sichuan Provincial Team player, 5+ years coaching in Canada.");
  const [open, setOpen] = useState(null);

  return (
    <>
      <PageHeader
        eyebrow="Achievements"
        title="Achievements & Experience"
        lead="A competition record built from the Sichuan provincial system to Canadian collegiate titles — and the coaching experience that followed."
      >
        <ul className="chip-row achievements-honours" aria-label="Competition achievements">
          {competition.map((c) => (
            <li key={c.title} className="chip" title={c.text}>
              <Icon name={c.icon} /> {c.title}
            </li>
          ))}
        </ul>
      </PageHeader>

      <section className="section" aria-labelledby="competition-title">
        <div className="container">
          <div className="section-head section-head--split">
            <AnimatedSection>
              <p className="eyebrow">Competition</p>
              <h2 id="competition-title" className="h2">
                Competition Achievements
              </h2>
            </AnimatedSection>
            <AnimatedSection as="p" className="lead" delay={100}>
              {competition.map((c) => c.text).join('. ')}.
            </AnimatedSection>
          </div>
          <RecordBoard />
        </div>
      </section>

      <section className="section section--stage" aria-labelledby="path-title">
        <div className="container">
          <AnimatedSection className="section-head">
            <p className="eyebrow">Career path</p>
            <h2 id="path-title" className="h2">
              The journey
            </h2>
          </AnimatedSection>
          <Trajectory />
        </div>
      </section>

      <section className="section section--brand" aria-labelledby="coaching-title">
        <div className="container achievements-coaching">
          <AnimatedSection>
            <p className="eyebrow">Coaching</p>
            <h2 id="coaching-title" className="h2">
              Coaching Experience
            </h2>
          </AnimatedSection>
          <ol className="timeline">
            {coaching.map((c, i) => (
              <AnimatedSection as="li" key={c.title} className="timeline__item" delay={i * 90}>
                <h3>{c.title}</h3>
                {c.points.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </AnimatedSection>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--sunken" aria-labelledby="teaching-title">
        <div className="container">
          <AnimatedSection className="section-head">
            <p className="eyebrow">Teaching</p>
            <h2 id="teaching-title" className="h2">
              Teaching Philosophy
            </h2>
          </AnimatedSection>
          <ol className="grid grid--3 achievements-steps">
            {teaching.map((t, i) => (
              <AnimatedSection as="li" key={t.title} className="step" delay={i * 90}>
                <span className="step__n">{i + 1}</span>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </AnimatedSection>
            ))}
          </ol>
        </div>
      </section>

      <section id="gallery" className="section" aria-labelledby="gallery-title">
        <div className="container">
          <AnimatedSection className="section-head">
            <p className="eyebrow">Gallery</p>
            <h2 id="gallery-title" className="h2">
              Achievement Gallery
            </h2>
          </AnimatedSection>
          <div className="achievement-gallery">
            {gallery.map((g, i) => (
              <AnimatedSection as="figure" key={g.title} className={`achievement-gallery__item achievement-gallery__item--${i}`} delay={(i % 3) * 80}>
                <button type="button" className="frame" onClick={() => setOpen(i)} aria-label={`Enlarge photo: ${g.title}`}>
                  <img src={g.src} width={g.width} height={g.height} alt={`${g.title} — ${g.text}`} loading="lazy" decoding="async" />
                </button>
                <figcaption>
                  <strong>{g.title}</strong>
                  <span>{g.text}</span>
                </figcaption>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {open !== null && <Lightbox index={open} setIndex={setOpen} />}
    </>
  );
}

export default Achievements;
