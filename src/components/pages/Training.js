import React, { useMemo, useRef, useState } from 'react';
import PageHeader, { usePageMeta } from '../PageHeader';
import AnimatedSection from '../AnimatedSection';
import Icon from '../Icon';
import { VideoPlayerModal } from '../VideoGallery';
import { methodology } from '../../data/site';
import { onPage, collectionsFor, categoriesFor, formatDuration } from '../../content/library';
import { levels } from '../../content/taxonomy';
import './Training.css';

const videos = onPage('training');
const topics = categoriesFor(videos);
const topicCollections = collectionsFor(videos);
const featured = videos.find((v) => v.featured) || videos[0];

function readLang() {
  try {
    return localStorage.getItem('trainingLang') === 'zh' ? 'zh' : 'en';
  } catch (e) {
    return 'en';
  }
}

const text = (v, lang) => ({
  title: lang === 'zh' ? v.titleZh || v.title : v.title,
  sub: lang === 'zh' ? v.title : v.titleZh,
  description: lang === 'zh' ? v.descriptionZh || v.description : v.description,
});

function Poster({ video, onOpen, label, size }) {
  const duration = formatDuration(video.durationSec);
  return (
    <button
      type="button"
      className={`tv-poster tv-poster--${size || 'md'} tv-poster--${video.orientation}`}
      onClick={() => onOpen(video)}
      aria-label={`Play video: ${label}`}
    >
      <img src={video.poster} alt="" loading={size === 'lg' ? 'eager' : 'lazy'} decoding="async" />
      <span className="tv-poster__play" aria-hidden="true">
        <Icon name="play" size={size === 'lg' ? 26 : 18} />
      </span>
      {duration && <span className="tv-poster__time">{duration}</span>}
    </button>
  );
}

function TrainingCard({ video, lang, onOpen, index }) {
  const t = text(video, lang);
  return (
    <AnimatedSection as="article" className="tv-card" delay={(index % 3) * 70}>
      <Poster video={video} onOpen={onOpen} label={t.title} />
      <div className="tv-card__body">
        <p className="tv-card__kicker">
          {video.categoryLabels[0]}
          {video.level && video.level !== 'all' && <span> · {levels[video.level][lang]}</span>}
        </p>
        <h3 className="tv-card__title">{t.title}</h3>
        {t.sub && <p className="tv-card__sub" lang={lang === 'zh' ? 'en' : 'zh'}>{t.sub}</p>}
        <p className="tv-card__desc">{t.description}</p>
        {video.tags?.length > 0 && (
          <ul className="tv-tags" aria-label="Tags">
            {video.tags.slice(0, 3).map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </AnimatedSection>
  );
}

function Training() {
  usePageMeta(
    'Training Library',
    'Badminton training videos from national champion coach Colin Zhou, organised by topic: footwork, technique, defence, net play, drills and conditioning.'
  );

  const [lang, setLang] = useState(readLang);
  const [topic, setTopic] = useState('all');
  const [collection, setCollection] = useState(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);
  const libraryRef = useRef(null);

  const chooseLang = (next) => {
    setLang(next);
    try {
      localStorage.setItem('trainingLang', next);
    } catch (e) {
      /* storage unavailable: keep the choice for this visit only */
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((v) => {
      if (topic !== 'all' && !v.categories.includes(topic)) return false;
      if (collection && !v.collections.includes(collection)) return false;
      if (!q) return true;
      return [v.title, v.titleZh, v.description, v.descriptionZh, ...(v.tags || []), ...v.categoryLabels]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [topic, collection, query]);

  const openCollection = (id) => {
    setCollection(id);
    setTopic('all');
    setQuery('');
    libraryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearFilters = () => {
    setTopic('all');
    setCollection(null);
    setQuery('');
  };

  const upNext = videos.filter((v) => v !== featured).slice(0, 3);
  const f = text(featured, lang);
  const activeCollection = topicCollections.find((c) => c.id === collection);

  return (
    <>
      <PageHeader eyebrow="Training library" title="Train like a champion" lead="Technique, footwork and match-ready drills from a national champion coach, organised by topic so you can find exactly what to work on next.">
        <dl className="tv-facts">
          <div>
            <dt>Videos</dt>
            <dd>{videos.length}</dd>
          </div>
          <div>
            <dt>Topics</dt>
            <dd>{topics.length}</dd>
          </div>
          <div>
            <dt>Coaching in</dt>
            <dd>EN · 中文</dd>
          </div>
        </dl>
      </PageHeader>

      <section className="section section--stage tv-start" aria-labelledby="start-title">
        <div className="container tv-start__grid">
          <AnimatedSection className="tv-start__main">
            <p className="eyebrow" id="start-title">
              Start here
            </p>
            <Poster video={featured} onOpen={setActive} label={f.title} size="lg" />
            <div className="tv-start__meta">
              <p className="tv-card__kicker">{featured.categoryLabels.join(' · ')}</p>
              <h2 className="tv-start__title">{f.title}</h2>
              {f.sub && <p className="tv-card__sub">{f.sub}</p>}
              <p className="tv-start__desc">{f.description}</p>
            </div>
          </AnimatedSection>
          <AnimatedSection className="tv-start__aside" delay={120}>
            <p className="eyebrow">Up next</p>
            <ol className="tv-next">
              {upNext.map((v) => {
                const t = text(v, lang);
                return (
                  <li key={v.slug}>
                    <button type="button" className="tv-next__item" onClick={() => setActive(v)}>
                      <span className="tv-next__thumb">
                        <img src={v.poster} alt="" loading="lazy" decoding="async" />
                      </span>
                      <span className="tv-next__text">
                        <span className="tv-next__kicker">{v.categoryLabels[0]}</span>
                        <span className="tv-next__title">{t.title}</span>
                      </span>
                      <Icon name="play" size={16} />
                    </button>
                  </li>
                );
              })}
            </ol>
          </AnimatedSection>
        </div>
      </section>

      {topicCollections.length > 0 && (
        <section className="section tv-collections" aria-labelledby="collections-title">
          <div className="container">
            <AnimatedSection className="section-head">
              <p className="eyebrow">Learning paths</p>
              <h2 id="collections-title" className="h2">
                Topic collections
              </h2>
            </AnimatedSection>
            <div className="tv-collection-row">
              {topicCollections.map((c, i) => (
                <AnimatedSection key={c.id} delay={i * 90}>
                  <button type="button" className="tv-collection" onClick={() => openCollection(c.id)}>
                    <span className="tv-collection__stack" aria-hidden="true">
                      {c.videos.slice(0, 3).map((v) => (
                        <img key={v.slug} src={v.poster} alt="" loading="lazy" decoding="async" />
                      ))}
                    </span>
                    <span className="tv-collection__count">{c.videos.length} videos</span>
                    <span className="tv-collection__title">{lang === 'zh' ? c.zh : c.en}</span>
                    <span className="tv-collection__blurb">{c.blurb}</span>
                    <span className="link-arrow">
                      View path <Icon name="arrow" />
                    </span>
                  </button>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section--surface tv-library" aria-labelledby="library-title" ref={libraryRef}>
        <div className="container">
          <div className="tv-toolbar">
            <div>
              <p className="eyebrow">Browse</p>
              <h2 id="library-title" className="h2">
                {activeCollection ? (lang === 'zh' ? activeCollection.zh : activeCollection.en) : 'All training videos'}
              </h2>
            </div>
            <div className="tv-toolbar__tools">
              <label className="tv-search">
                <span className="sr-only">Search training videos</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={lang === 'zh' ? '搜索：步法、杀球、网前…' : 'Search: footwork, smash, net…'}
                />
              </label>
              <div className="tv-lang" role="group" aria-label="Video language">
                <button type="button" aria-pressed={lang === 'en'} onClick={() => chooseLang('en')}>
                  EN
                </button>
                <button type="button" aria-pressed={lang === 'zh'} onClick={() => chooseLang('zh')}>
                  中文
                </button>
              </div>
            </div>
          </div>

          <div className="chip-row tv-topics" role="group" aria-label="Filter by topic">
            <button type="button" className="chip" aria-pressed={topic === 'all' && !collection} onClick={clearFilters}>
              All
            </button>
            {topics.map((c) => (
              <button
                key={c.id}
                type="button"
                className="chip"
                aria-pressed={topic === c.id}
                onClick={() => {
                  setCollection(null);
                  setTopic(c.id);
                }}
              >
                {lang === 'zh' ? c.zh : c.en}
              </button>
            ))}
          </div>

          <p className="tv-count" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'video' : 'videos'}
            {(topic !== 'all' || collection || query) && (
              <button type="button" className="tv-clear" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </p>

          {filtered.length > 0 ? (
            <div className="tv-grid">
              {filtered.map((v, i) => (
                <TrainingCard key={v.slug} video={v} lang={lang} onOpen={setActive} index={i} />
              ))}
            </div>
          ) : (
            <div className="tv-empty">
              <p>No videos match that search yet.</p>
              <button type="button" className="btn btn--ghost" onClick={clearFilters}>
                Show all videos
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section tv-method" aria-labelledby="method-title">
        <div className="container tv-method__grid">
          <AnimatedSection>
            <p className="eyebrow">Method</p>
            <h2 id="method-title" className="h2">
              How I coach
            </h2>
            <p className="lead tv-method__lead">
              Every session combines technical precision, tactical awareness and physical conditioning, for beginners
              learning the basics and competitive players sharpening their edge.
            </p>
          </AnimatedSection>
          <ol className="tv-method__list">
            {methodology.map((m, i) => (
              <AnimatedSection as="li" key={m.title} delay={i * 80}>
                <span className="tile__index">0{i + 1}</span>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </AnimatedSection>
            ))}
          </ol>
        </div>
      </section>

      {active && <VideoPlayerModal videos={filtered.includes(active) ? filtered : videos} active={active} setActive={setActive} />}
    </>
  );
}

export default Training;
