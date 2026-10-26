import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../HeroSection';
import AnimatedSection from '../AnimatedSection';
import Icon from '../Icon';
import { VideoCard, VideoPlayerModal } from '../VideoGallery';
import { usePageMeta } from '../PageHeader';
import { careerStats, coaching, competition, gallery, highlightVideos, profile, teaching } from '../../data/site';
import './Home.css';

const featured = highlightVideos.filter((v) => v.featured);
const strip = gallery.filter((g) => ['CCAA National Champion', 'Championship Banner', 'OCAA Awards', 'OCAA Ceremony'].includes(g.title));

function Home() {
  usePageMeta(null, `Colin Zhou — ${profile.summary} Match highlights, training videos and coaching.`);
  const [active, setActive] = useState(null);

  return (
    <>
      <HeroSection />

      {/* Headline numbers */}
      <section className="section--stage home-stats" aria-label="Career statistics">
        <div className="container">
          <div className="stats">
            {careerStats.map((s, i) => (
              <AnimatedSection key={s.label} className="stat" delay={i * 90}>
                <span className="stat__value">{s.value}</span>
                <span className="stat__label">{s.label}</span>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* The athlete */}
      <section className="section home-athlete" aria-labelledby="athlete-title">
        <div className="container home-athlete__grid">
          <AnimatedSection as="figure" variant="mask" className="frame home-athlete__photo">
            <img src="/media/frontcourt.webp" width="639" height="960" alt="Colin Zhou lunging for a shuttle at the front court during a match" loading="lazy" decoding="async" />
            <figcaption>Match play</figcaption>
          </AnimatedSection>

          <div className="home-athlete__copy">
            <AnimatedSection>
              <p className="eyebrow">The athlete</p>
              <h2 id="athlete-title" className="h2">
                Built in Sichuan. <span className="accent-text">Crowned in Canada.</span>
              </h2>
            </AnimatedSection>
            <AnimatedSection as="p" className="lead" delay={100}>
              {profile.summary}
            </AnimatedSection>

            <ol className="honour-list">
              {competition.map((c, i) => (
                <AnimatedSection as="li" key={c.title} className="honour" delay={i * 80}>
                  <span className="honour__icon">
                    <Icon name={c.icon} size={22} />
                  </span>
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.text}</p>
                  </div>
                </AnimatedSection>
              ))}
            </ol>

            <Link to="/achievements" className="link-arrow">
              Achievements &amp; experience <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* Championship moments */}
      <section className="section section--stage" aria-labelledby="moments-title">
        <div className="container">
          <div className="section-head section-head--split">
            <AnimatedSection>
              <p className="eyebrow">On court</p>
              <h2 id="moments-title" className="h2">
                Championship moments
              </h2>
            </AnimatedSection>
            <AnimatedSection as="p" className="lead" delay={100}>
              Relive the most exciting moments from national and provincial championships. These highlights showcase
              the technical skills, strategic gameplay, and competitive spirit that define my approach to badminton.
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
            <Link to="/training" className="link-arrow">
              Training videos <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* Moments in pictures */}
      <section className="section home-gallery" aria-labelledby="gallery-title">
        <div className="container">
          <AnimatedSection className="section-head">
            <p className="eyebrow">Podium</p>
            <h2 id="gallery-title" className="h2">
              Titles &amp; recognition
            </h2>
          </AnimatedSection>
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

      {/* The coach */}
      <section className="section section--surface" aria-labelledby="coach-title">
        <div className="container home-coach">
          <div className="home-coach__copy">
            <AnimatedSection>
              <p className="eyebrow">The coach</p>
              <h2 id="coach-title" className="h2">
                From champion <br />
                to coach
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

          <AnimatedSection as="figure" variant="mask" className="frame home-coach__photo">
            <img src="/media/coach-poster.webp" width="1050" height="1400" alt="Colin Zhou, senior badminton coach, holding his national championship medal" loading="lazy" decoding="async" />
          </AnimatedSection>
        </div>

        <div className="container">
          <div className="grid grid--3 home-teaching">
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

      {active && <VideoPlayerModal videos={featured} active={active} setActive={setActive} />}
    </>
  );
}

export default Home;
