import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import PageHeader, { usePageMeta } from '../PageHeader';
import AnimatedSection from '../AnimatedSection';
import VideoGallery from '../VideoGallery';
import VideoSort from '../VideoSort';
import Icon from '../Icon';
import TrainingSystem from '../brand/TrainingSystem';
import { sortVideos } from '../videoStats';
import { levels, teaching, teachingLibrary, topicOf, topics } from '../../data/site';
import './Training.css';

function Training() {
  usePageMeta('Training Programs', 'Badminton training videos and methodology from coach Colin Zhou: footwork, smash technique, defence, net play and conditioning.');
  const [sort, setSort] = useState('default');
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const topic = topics.some((t) => t.id === params.get('topic')) ? params.get('topic') : 'all';

  // Links like /training?topic=footwork#library land on the library
  useEffect(() => {
    if (hash === '#library') {
      const t = setTimeout(() => document.getElementById('library')?.scrollIntoView(), 60);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [hash]);

  const setTopic = (id) => {
    const next = new URLSearchParams(params);
    if (id === 'all') next.delete('topic');
    else next.set('topic', id);
    setParams(next, { replace: true });
  };

  const list = sortVideos(topic === 'all' ? teachingLibrary : teachingLibrary.filter((v) => topicOf(v) === topic), sort);

  return (
    <>
      <PageHeader eyebrow="Training" title="Training Programs" lead="Professional techniques and drills to elevate your game, from the method Colin learned in the Sichuan provincial system." />

      <section className="section" aria-labelledby="philosophy-title">
        <div className="container training-intro">
          <AnimatedSection>
            <p className="eyebrow">Philosophy</p>
            <h2 id="philosophy-title" className="h2">
              My training <span className="mark">philosophy</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection className="training-intro__text" delay={100}>
            <p className="lead">
              My approach to badminton training combines technical precision, tactical awareness, and physical
              conditioning. Each session is designed to develop specific skills while building overall game
              understanding and court presence.
            </p>
            <p>
              Whether you're a beginner looking to master the basics or an advanced player refining your competitive
              edge, these training videos demonstrate the techniques and drills I use with students at all levels.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section section--sunken" aria-labelledby="method-title">
        <div className="container">
          <AnimatedSection className="section-head">
            <p className="eyebrow">Method</p>
            <h2 id="method-title" className="h2">
              Training Methodology
            </h2>
          </AnimatedSection>
          <AnimatedSection>
            <TrainingSystem />
          </AnimatedSection>
        </div>
      </section>

      <section className="section" aria-labelledby="levels-title">
        <div className="container">
          <div className="section-head section-head--split">
            <AnimatedSection>
              <p className="eyebrow">Who it's for</p>
              <h2 id="levels-title" className="h2">
                Every level, one standard
              </h2>
            </AnimatedSection>
            <AnimatedSection as="p" className="lead" delay={100}>
              Coaching in English and Chinese, adapted to where you are now and where you want to compete.
            </AnimatedSection>
          </div>
          <ol className="levels">
            {levels.map((l, i) => (
              <AnimatedSection as="li" key={l.title} className="level" delay={i * 90} style={{ '--lv': i + 1 }}>
                <span className="level__bar" aria-hidden="true">
                  <span />
                </span>
                <span className="level__tag">{l.tag}</span>
                <h3>{l.title}</h3>
                <p>{l.text}</p>
              </AnimatedSection>
            ))}
          </ol>

          <AnimatedSection className="training-flow">
            <h3 className="training-flow__title">How coaching works</h3>
            <ol className="grid grid--3 training-flow__steps">
              {teaching.map((t, i) => (
                <li key={t.title} className="step">
                  <span className="step__n">{i + 1}</span>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </li>
              ))}
            </ol>
          </AnimatedSection>
        </div>
      </section>

      <section id="library" className="section section--stage" aria-labelledby="videos-title">
        <div className="container">
          <div className="training-videos-head">
            <AnimatedSection className="section-head">
              <p className="eyebrow">Teaching library</p>
              <h2 id="videos-title" className="h2">
                Training Videos
              </h2>
            </AnimatedSection>
          </div>
          <div className="training-toolbar">
            <div className="chip-row" role="group" aria-label="Filter by technique">
              {topics.map((t) => (
                <button key={t.id} type="button" className="chip" aria-pressed={topic === t.id} onClick={() => setTopic(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
            <VideoSort id="training-sort" value={sort} onChange={setSort} />
          </div>
          <p className="sr-only" aria-live="polite">
            Showing {list.length} videos
          </p>
          <VideoGallery key={`${topic}-${sort}`} videos={list} showTopic />
          <div className="training-cta">
            <p className="lead">Want this method applied to your game?</p>
            <Link to="/contact" className="btn">
              Book a session <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Training;
