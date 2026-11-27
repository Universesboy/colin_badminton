import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../HeroSection';
import AnimatedSection from '../AnimatedSection';
import Icon from '../Icon';
import TiltCard from '../TiltCard';
import Trajectory from '../brand/Trajectory';
import RecordBoard from '../brand/RecordBoard';
import TrainingSystem from '../brand/TrainingSystem';
import { VideoCard, VideoPlayerModal } from '../VideoGallery';
import { usePageMeta } from '../PageHeader';
import { careerStats, coaching, gallery, highlightVideos, profile, teaching } from '../../data/site';
import './Home.css';

const featured = highlightVideos.filter((v) => v.featured);
const strip = gallery.filter((g) => ['CCAA National Champion', 'Championship Banner', 'OCAA Awards', 'OCAA Ceremony'].includes(g.title));

function Home() {
  usePageMeta(null, `Colin Zhou — ${profile.summary} Match highlights, training videos and coaching.`);
  const [active, setActive] = useState(null);

  return (
    <>
      <HeroSection />

      {/* Brand statement */}
      <section className="section home-intro" aria-labelledby="intro-title">
        <div className="container home-intro__grid">
          <AnimatedSection className="home-intro__head">
            <p className="eyebrow">The athlete</p>
            <h2 id="intro-title" className="home-intro__title">
              Built in <span className="mark">Sichuan.</span>
              <br />
              Crowned in Canada.
            </h2>
          </AnimatedSection>
          <div className="home-intro__body">
            <AnimatedSection as="p" className="lead" delay={100}>
              {profile.summary} He trained in China's provincial system as a men's singles player, won the OCAA and
              CCAA titles in Canada, and now coaches players from beginners to national-level juniors.
            </AnimatedSection>
            <dl className="home-intro__stats">
              {careerStats.map((s, i) => (
                <AnimatedSection key={s.label} className="home-intro__stat" delay={160 + i * 70}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </AnimatedSection>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Career path */}
      <section className="section section--stage home-path" aria-labelledby="path-title">
        <div className="court-grid" aria-hidden="true" />
        <div className="container">
          <AnimatedSection className="section-head">
            <p className="eyebrow">Career path</p>
            <h2 id="path-title" className="h2">
              From Sichuan courts to <span className="mark">national champion</span>
            </h2>
          </AnimatedSection>
          <Trajectory />
        </div>
      </section>

      {/* Record */}
      <section className="section" aria-labelledby="record-title">
        <div className="container">
          <div className="section-head section-head--split">
            <AnimatedSection>
              <p className="eyebrow">Competition record</p>
              <h2 id="record-title" className="h2">
                Titles on the board
              </h2>
            </AnimatedSection>
            <AnimatedSection as="p" className="lead" delay={100}>
              Results from the Sichuan provincial system and Canadian collegiate badminton, as listed on the
              achievements page.
            </AnimatedSection>
          </div>
          <RecordBoard />
          <AnimatedSection className="home-more">
            <Link to="/achievements" className="link-arrow">
              Full achievements &amp; experience <Icon name="arrow" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Film room */}
      <section className="section section--stage" aria-labelledby="moments-title">
        <div className="container">
          <div className="section-head section-head--split">
            <AnimatedSection>
              <p className="eyebrow">Film room</p>
              <h2 id="moments-title" className="h2">
                Championship moments
              </h2>
            </AnimatedSection>
            <AnimatedSection as="p" className="lead" delay={100}>
              Relive the most exciting moments from national and provincial championships: the technical skills,
              strategic gameplay and competitive spirit that define Colin's badminton.
            </AnimatedSection>
          </div>

          <div className="home-featured">
            {featured.map((v, i) => (
              <VideoCard key={v.id} video={v} onOpen={setActive} size="lg" index={i} />
            ))}
          </div>

          <div className="home-more">
            <Link to="/highlights" className="btn btn--light">
              All {highlightVideos.length} highlights <Icon name="arrow" />
            </Link>
            <Link to="/training#library" className="link-arrow">
              Teaching videos <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* Training system */}
      <section className="section section--sunken" aria-labelledby="system-title">
        <div className="container">
          <div className="section-head section-head--split">
            <AnimatedSection>
              <p className="eyebrow">Training system</p>
              <h2 id="system-title" className="h2">
                Four pillars, one complete player
              </h2>
            </AnimatedSection>
            <AnimatedSection as="p" className="lead" delay={100}>
              Every session builds on the same method: technique first, then the tactics, physical base and mindset
              that turn it into match results.
            </AnimatedSection>
          </div>
          <AnimatedSection>
            <TrainingSystem />
          </AnimatedSection>
          <AnimatedSection className="home-more">
            <Link to="/training" className="link-arrow">
              Training programs <Icon name="arrow" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* The coach */}
      <section className="section section--brand home-coach-section" aria-labelledby="coach-title">
        <div className="container home-coach">
          <AnimatedSection className="home-coach__photo-wrap">
            <TiltCard className="home-coach__photo">
              <img src="/media/coach-poster.webp" width="1050" height="1400" alt="Colin Zhou, senior badminton coach, holding his national championship medal" loading="lazy" decoding="async" />
            </TiltCard>
          </AnimatedSection>

          <div className="home-coach__copy">
            <AnimatedSection>
              <p className="eyebrow">The coach</p>
              <h2 id="coach-title" className="h2">
                From champion <br />
                to <span className="mark">coach</span>
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
        </div>

        <div className="container">
          <ol className="grid grid--3 home-teaching">
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

      {/* Podium */}
      <section className="section home-gallery" aria-labelledby="gallery-title">
        <div className="container">
          <div className="section-head section-head--split">
            <AnimatedSection>
              <p className="eyebrow">Podium</p>
              <h2 id="gallery-title" className="h2">
                Titles &amp; recognition
              </h2>
            </AnimatedSection>
            <AnimatedSection className="home-gallery__more" delay={100}>
              <Link to="/achievements#gallery" className="link-arrow">
                Achievement gallery <Icon name="arrow" />
              </Link>
            </AnimatedSection>
          </div>
        </div>
        <div className="home-strip" tabIndex="0" role="region" aria-label="Award photos, scroll horizontally">
          {strip.map((g, i) => (
            <AnimatedSection as="figure" variant="mask" key={g.title} className="frame home-strip__item" delay={i * 90}>
              <img src={g.src} width={g.width} height={g.height} alt={`${g.title} — ${g.text}`} loading="lazy" decoding="async" />
              <figcaption>{g.title}</figcaption>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {active && <VideoPlayerModal videos={featured} active={active} setActive={setActive} />}
    </>
  );
}

export default Home;
