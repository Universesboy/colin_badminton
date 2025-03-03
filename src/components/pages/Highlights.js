import React, { useState, useRef, useEffect } from 'react';
import './Highlights.css';

function Highlights() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState({});
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState({});
  const [videoReadyStates, setVideoReadyStates] = useState({});
  const [videoErrors, setVideoErrors] = useState({});
  const [debugInfo, setDebugInfo] = useState({});
  const containerRef = useRef(null);
  const videoRefs = useRef({});
  const playPromiseRefs = useRef({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Video data with categories - updated with YouTube URLs
  const videos = [
    {
      id: 1,
      src: 'https://youtube.com/shorts/YVRk2iWuBOw', // YouTube URL
      youtubeId: 'YVRk2iWuBOw', // Extracted YouTube ID
      poster: '/videos/thumbnails/colin.vs.zeng.jpg', // Keep local poster
      title: 'Colin vs Zeng',
      description: 'Match Highlights',
      category: 'matches',
      orientation: 'landscape',
      audioTitle: 'Original Audio',
      featured: true
    },
    {
      id: 2,
      src: 'https://youtu.be/CMH451dTCNk',
      youtubeId: 'CMH451dTCNk',
      poster: '/videos/thumbnails/colin.vs.Timthy.jpg',
      title: 'Ontario Provincial Championships',
      description: 'Colin vs Timothy',
      category: 'tournaments',
      orientation: 'landscape'
    },
    {
      id: 3,
      src: 'https://youtu.be/1CkIzrksj0A',
      youtubeId: '1CkIzrksj0A',
      poster: '/videos/thumbnails/colin_national_championships.jpg',
      title: 'National Championships',
      description: 'Final Match Highlights',
      category: 'tournaments',
      orientation: 'landscape',
      featured: true
    },
    {
      id: 4,
      src: 'https://youtu.be/Hu3xOCKEbjw',
      youtubeId: 'Hu3xOCKEbjw',
      poster: '/videos/thumbnails/colin.vs.nando.jpg',
      title: 'colin.vs.nando',
      description: 'Match Highlights',
      category: 'Matches',
      orientation: 'landscape'
    },
    {
      id: 5,
      src: 'https://youtu.be/UaDET-_M6js',
      youtubeId: 'UaDET-_M6js',
      poster: '/videos/thumbnails/colin.vs.nando_long.jpg',
      title: 'colin.vs.nando',
      description: 'Match Highlights Long Rallies',
      category: 'matches',
      orientation: 'landscape'
    },
    {
      id: 6,
      src: 'https://youtu.be/laZyef7no78',
      youtubeId: 'laZyef7no78',
      poster: '/videos/thumbnails/colin.vs.dimas1.jpg',
      title: 'Training Highlights',
      description: 'Professional Practice Session',
      category: 'training',
      orientation: 'landscape'
    },
    {
      id: 7,
      src: 'https://youtu.be/vRJTBx98Baw',
      youtubeId: 'vRJTBx98Baw',
      poster: '/videos/thumbnails/colin.vs.dimas2.jpg',
      title: 'Training Highlights',
      description: 'Match Highlights',
      category: 'training',
      orientation: 'landscape'
    },
    {
      id: 8,
      src: 'https://youtube.com/shorts/Tt-EQAx54V0',
      youtubeId: 'Tt-EQAx54V0bjw',
      poster: '/videos/thumbnails/colinprovincial.jpg',
      title: 'OCAA Highlights',
      description: 'Ontario College Athletic Association Championship',
      category: 'tournaments',
      orientation: 'landscape'
    },
    {
      id: 9,
      src: 'https://youtube.com/shorts/IyPrqtoeZDs',
      youtubeId: 'IyPrqtoeZDs',
      poster: '/videos/thumbnails/colin.vs.tim1.jpg',
      title: 'OCAA Finals',
      description: 'Ontario College Athletic Association Championship',
      category: 'tournaments',
      orientation: 'landscape'
    },
    {
      id: 10,
      src: 'https://youtube.com/shorts/9JoS7zQrpWo',
      youtubeId: '9JoS7zQrpWo',
      poster: '/videos/thumbnails/colin.vs.tim2.jpg',
      title: 'OCAA Finals',
      description: 'Ontario College Athletic Association Championship',
      category: 'tournaments',
      orientation: 'landscape'
    },
    {
      id: 11,
      src: 'https://youtube.com/shorts/vc_P6Hc_s0s',
      youtubeId: 'vc_P6Hc_s0s',
      poster: '/videos/thumbnails/colin.vs.tim3.jpg',
      title: 'OCAA Finals',
      description: 'Highlights',
      category: 'tournaments',
      orientation: 'landscape'
    }
  ];

  // Helper function to extract YouTube ID from URL
  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Intersection Observer to detect visible videos
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.7,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const videoIndex = parseInt(entry.target.dataset.index);
        if (entry.isIntersecting) {
          setCurrentVideoIndex(videoIndex);
        }
      });
    }, options);

    // Observe all video elements with a small delay to ensure refs are set
    setTimeout(() => {
      const thumbnails = document.querySelectorAll('.video-wrapper');
      thumbnails.forEach((thumbnail, index) => {
        thumbnail.dataset.index = index;
        observer.observe(thumbnail);
      });
    }, 500);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Add this useEffect to your Highlights.js component
  useEffect(() => {
    // For YouTube videos, we won't auto-play the first video
    // since YouTube embed has its own controls and auto-play restrictions
    console.log("YouTube videos loaded - auto-play disabled");
  }, []);

  // Handle video selection - for YouTube embed modal
  const openVideoModal = (video) => {
    setSelectedVideo(video);
    document.body.style.overflow = 'hidden';
  };

  // Close video modal
  const closeVideoModal = () => {
    setSelectedVideo(null);
    document.body.style.overflow = 'auto';
  };

  // Filter videos by category
  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === activeCategory);

  // Get featured videos
  const featuredVideos = videos.filter(video => video.featured);

  return (
    <div className="highlights-container">
      <div className="highlights-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1>Career Highlights</h1>
            
            <p className="hero-subtitle" style={{marginTop: "1.5rem", marginBottom: "2rem"}}>
              Championship moments and competitive excellence
            </p>
            
            <div className="hero-badges" style={{marginTop: "1.5rem"}}>
              <div className="badge" style={{marginBottom: "1.0rem"}}>
                <i className="fas fa-trophy"></i>
                <span className="badge-text">CCAA Champion</span>
              </div>
              
              <div className="badge" style={{marginBottom: "1.0rem"}}>
                <i className="fas fa-medal"></i>
                <span className="badge-text">OCAA Player of the Year</span>
              </div>

              <div className="badge" style={{marginBottom: "1.0rem"}}>
                <i className="fas fa-medal"></i>
                <span className="badge-text">China Provincial Champion</span>
              </div>
              
              <div className="badge" style={{marginBottom: "1.0rem"}}>
                <i className="fas fa-star"></i>
                <span className="badge-text">Badminton Competitor</span>
              </div>

              <div className="badge" style={{marginBottom: "1.0rem"}}>
                <i className="fas fa-medal"></i>
                <span className="badge-text">High Performance Coach</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Highlights Section */}
      <div className="featured-highlights">
        <div className="featured-content">
          <h2>Championship Moments</h2>
          <p>
            Relive the most exciting moments from national and provincial championships.
            These highlights showcase the technical skills, strategic gameplay, and competitive
            spirit that define my approach to badminton.
          </p>
        </div>
        
        <div className="featured-video-grid">
          {featuredVideos.map((video) => (
            <div key={video.id} className="featured-video-item">
              <div className="video-wrapper" onClick={() => openVideoModal(video)}>
                <img 
                  src={video.poster} 
                  alt={video.title} 
                  className="video-thumbnail"
                />
                <div className="play-overlay">
                  <i className="fas fa-play-circle"></i>
                </div>
              </div>
              <div className="featured-caption">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Gallery Section */}
      <div className="highlights-gallery">
        <h2>Match Highlights</h2>
        
        <div className="category-filter">
          <button 
            className={activeCategory === 'all' ? 'active' : ''} 
            onClick={() => setActiveCategory('all')}
          >
            All Videos
          </button>
          <button 
            className={activeCategory === 'tournaments' ? 'active' : ''} 
            onClick={() => setActiveCategory('tournaments')}
          >
            Tournaments
          </button>
          <button 
            className={activeCategory === 'matches' ? 'active' : ''} 
            onClick={() => setActiveCategory('matches')}
          >
            Matches
          </button>
          <button 
            className={activeCategory === 'training' ? 'active' : ''} 
            onClick={() => setActiveCategory('training')}
          >
            Training
          </button>
        </div>
        
        <div className="video-grid">
          {filteredVideos.map((video) => (
            <div key={video.id} className="video-item">
              <div className="video-wrapper" onClick={() => openVideoModal(video)}>
                <img 
                  src={video.poster} 
                  alt={video.title} 
                  className="video-thumbnail"
                />
                <div className="play-overlay">
                  <i className="fas fa-play-circle"></i>
                </div>
                <div className="video-category-tag">
                  {video.category}
                </div>
            </div>
              <div className="video-caption">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
              </div>
            </div>
          ))}
        </div>
            </div>
            
      {/* Achievements Stats Section */}
      <div className="achievements-stats">
        <h2>Career Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">1st</div>
            <div className="stat-label">CCAA National Ranking</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">2023</div>
            <div className="stat-label">National Champion</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">OCAA</div>
            <div className="stat-label">Player of the Year</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10+</div>
            <div className="stat-label">Major Championships</div>
          </div>
              </div>
            </div>

      {/* Video Modal - Updated for YouTube Embed */}
      {selectedVideo && (
        <div className="video-modal" onClick={closeVideoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="youtube-responsive-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="modal-caption">
              <h3>{selectedVideo.title}</h3>
              <p>{selectedVideo.description}</p>
            </div>
            <button className="close-button" onClick={closeVideoModal}>×</button>
            <button className="prev-button" onClick={(e) => {
              e.stopPropagation();
              const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
              const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
              setSelectedVideo(videos[prevIndex]);
            }}>❮</button>
            <button className="next-button" onClick={(e) => {
              e.stopPropagation();
              const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
              const nextIndex = (currentIndex + 1) % videos.length;
              setSelectedVideo(videos[nextIndex]);
            }}>❯</button>
          </div>
      </div>
      )}
    </div>
  );
}

export default Highlights;