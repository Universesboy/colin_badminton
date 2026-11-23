import React, { useCallback, useState } from 'react';
import Icon from './Icon';
import Modal from './Modal';
import AnimatedSection from './AnimatedSection';
import { formatDate, formatDuration, formatViews, statsFor } from './videoStats';
import './VideoGallery.css';

export function VideoCard({ video, onOpen, size = 'md', showCategory = false, index = 0 }) {
  const stats = statsFor(video.id);
  return (
    <AnimatedSection as="article" className={`video-card video-card--${size}`} delay={(index % 3) * 80}>
      <button
        type="button"
        className={`video-card__media video-card__media--${video.orientation}`}
        onClick={() => onOpen(video)}
        aria-label={`Play video: ${video.title}${video.description ? ` — ${video.description}` : ''}`}
      >
        <img src={video.poster} alt="" loading="lazy" decoding="async" />
        <span className="video-card__play" aria-hidden="true">
          <Icon name="play" size={22} />
        </span>
        {showCategory && <span className="video-card__tag">{video.category}</span>}
        {video.orientation === 'portrait' && <span className="video-card__format">Short</span>}
        {stats?.duration > 0 && <span className="video-card__duration">{formatDuration(stats.duration)}</span>}
      </button>
      <div className="video-card__meta">
        <h3>{video.title}</h3>
        {video.description && <p>{video.description}</p>}
        {stats && (
          <p className="video-card__stats">
            {formatViews(stats.views)} · {formatDate(stats.publishedAt)}
          </p>
        )}
      </div>
    </AnimatedSection>
  );
}

// Plays a YouTube video in the shared modal. Uses the privacy-enhanced
// youtube-nocookie domain and only loads the iframe once a video is opened.
export function VideoPlayerModal({ videos, active, setActive }) {
  const index = videos.findIndex((v) => v.id === active.id);
  const step = useCallback(
    (dir) => setActive(videos[(index + dir + videos.length) % videos.length]),
    [index, videos, setActive]
  );
  const prev = useCallback(() => step(-1), [step]);
  const next = useCallback(() => step(1), [step]);
  const close = useCallback(() => setActive(null), [setActive]);

  return (
    <Modal label={`Video: ${active.title}`} onClose={close} onPrev={prev} onNext={next} counter={`${index + 1} / ${videos.length}`}>
      <div className={`player player--${active.orientation}`}>
        <iframe
          key={active.id}
          src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={active.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="modal__caption">
        <h2>{active.title}</h2>
        {active.description && <p>{active.description}</p>}
      </div>
    </Modal>
  );
}

function VideoGallery({ videos, size, showCategory, className = '' }) {
  const [active, setActive] = useState(null);
  return (
    <>
      <div className={`video-grid ${className}`}>
        {videos.map((video, i) => (
          <VideoCard key={video.id} video={video} onOpen={setActive} size={size} showCategory={showCategory} index={i} />
        ))}
      </div>
      {active && <VideoPlayerModal videos={videos} active={active} setActive={setActive} />}
    </>
  );
}

export default VideoGallery;
