import React, { useCallback, useState } from 'react';
import PageHeader, { usePageMeta } from '../PageHeader';
import AnimatedSection from '../AnimatedSection';
import Modal from '../Modal';
import Icon from '../Icon';
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
      />

      <section className="section" aria-labelledby="competition-title">
        <div className="container">
          <AnimatedSection className="section-head">
            <p className="eyebrow">Competition</p>
            <h2 id="competition-title" className="h2">
              Competition Achievements
            </h2>
          </AnimatedSection>
          <div className="grid grid--4">
            {competition.map((c, i) => (
              <AnimatedSection key={c.title} className="award" delay={i * 90}>
                <span className="award__icon">
                  <Icon name={c.icon} size={26} />
                </span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--stage" aria-labelledby="coaching-title">
        <div className="container achievements-coaching">
          <AnimatedSection>
            <p className="eyebrow">Coaching</p>
            <h2 id="coaching-title" className="h2">
              Coaching Experience
            </h2>
          </AnimatedSection>
          <div className="timeline">
            {coaching.map((c, i) => (
              <AnimatedSection key={c.title} className="timeline__item" delay={i * 90}>
                <h3>{c.title}</h3>
                {c.points.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--surface" aria-labelledby="teaching-title">
        <div className="container">
          <AnimatedSection className="section-head">
            <p className="eyebrow">Teaching</p>
            <h2 id="teaching-title" className="h2">
              Teaching Philosophy
            </h2>
          </AnimatedSection>
          <div className="grid grid--3">
            {teaching.map((t, i) => (
              <AnimatedSection key={t.title} className="tile" delay={i * 90}>
                <span className="tile__index">0{i + 1}</span>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="gallery-title">
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
