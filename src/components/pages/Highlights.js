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

  // Video data with categories
  const videos = [
    {
      id: 1,
      src: '/videos/colin.vs.zeng.mp4',
      poster: '/videos/thumbnails/colin.vs.zeng.jpg',
      title: 'Colin vs Zeng',
      description: 'Match Highlights',
      category: 'matches',
      orientation: 'landscape',
      audioTitle: 'Original Audio',
      featured: true
    },
    {
      id: 2,
      src: '/videos/colin.vs.Timthy.mp4',
      poster: '/videos/thumbnails/colin.vs.Timthy.jpg',
      title: 'Ontario Provincial Championships',
      description: 'Colin vs Timothy',
      category: 'tournaments',
      orientation: 'landscape'
    },
    {
      id: 3,
      src: '/videos/colin_national_championships.mp4',
      poster: '/videos/thumbnails/colin_national_championships.jpg',
      title: 'National Championships',
      description: 'Final Match Highlights',
      category: 'tournaments',
      orientation: 'landscape',
      featured: true
    },
    {
      id: 4,
      src: '/videos/colin.vs.nando.mp4',
      poster: '/videos/thumbnails/colin.vs.nando.jpg',
      title: 'colin.vs.nando',
      description: 'Match Highlights',
      category: 'Matches',
      orientation: 'landscape'
    },
    {
      id: 5,
      src: '/videos/colin.vs.nando_long.mp4',
      poster: '/videos/thumbnails/colin.vs.nando_long.jpg',
      title: 'colin.vs.nando',
      description: 'Match Highlights Long Rallies',
      category: 'matches',
      orientation: 'landscape'
    },
    {
      id: 6,
      src: '/videos/colin.vs.dimas1.mp4',
      poster: '/videos/thumbnails/colin.vs.dimas1.jpg',
      title: 'Training Highlights',
      description: 'Professional Practice Session',
      category: 'training',
      orientation: 'landscape'
    },
    {
      id: 7,
      src: '/videos/colin.vs.dimas2.mp4',
      poster: '/videos/thumbnails/colin.vs.dimas2.jpg',
      title: 'Training Highlights',
      description: 'Match Highlights',
      category: 'training',
      orientation: 'landscape'
    },
    {
      id: 8,
      src: '/videos/colinprovincial.mp4',
      poster: '/videos/thumbnails/colinprovincial.jpg',
      title: 'OCAA Highlights',
      description: 'Ontario College Athletic Association Championship',
      category: 'tournaments',
      orientation: 'landscape'
    },
    {
      id: 9,
      src: '/videos/colin.vs.tim1.mp4',
      poster: '/videos/thumbnails/colin.vs.tim1.jpg',
      title: 'OCAA Finals',
      description: 'Ontario College Athletic Association Championship',
      category: 'tournaments',
      orientation: 'landscape'
    },
    {
      id: 10,
      src: '/videos/colin.vs.tim2.mp4',
      poster: '/videos/thumbnails/colin.vs.tim2.jpg',
      title: 'OCAA Finals',
      description: 'Ontario College Athletic Association Championship',
      category: 'tournaments',
      orientation: 'landscape'
    },
    {
      id: 11,
      src: '/videos/colin.vs.tim3.mp4',
      poster: '/videos/thumbnails/colin.vs.tim3.jpg',
      title: 'OCAA Finals',
      description: 'Highlights',
      category: 'tournaments',
      orientation: 'landscape'
    }
  ];

  // Function to get better mime types based on file extension
  const getMimeType = (src) => {
    if (src.endsWith('.mp4')) return 'video/mp4';
    if (src.endsWith('.webm')) return 'video/webm';
    if (src.endsWith('.mov')) return 'video/quicktime';
    if (src.endsWith('.m4v')) return 'video/mp4';
    if (src.endsWith('.ogg') || src.endsWith('.ogv')) return 'video/ogg';
    return ''; // Let the browser determine the type
  };

  // Preload videos to check if they're valid
  useEffect(() => {
    const preloadVideos = async () => {
      videos.forEach((video, index) => {
        // Set initial loading state
        setIsLoading(prev => ({...prev, [index]: true}));
        
        // Update debug info
        setDebugInfo(prev => ({
          ...prev, 
          [index]: {
            path: video.src,
            status: 'Loading...',
            canPlayType: videoRefs.current[index] ? 
              videoRefs.current[index].canPlayType(getMimeType(video.src)) : 'Unknown'
          }
        }));
      });
    };
    
    preloadVideos();
  }, []);

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
      Object.entries(videoRefs.current).forEach(([index, videoEl]) => {
        if (videoEl) {
          videoEl.dataset.index = index;
          observer.observe(videoEl.parentElement);
        }
      });
    }, 500);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Safe play function with proper promise handling
  const safePlay = async (index) => {
    const video = videoRefs.current[index];
    if (!video) return;
    
    // Check if video is really ready to play
    if (video.readyState < 2) { // HAVE_CURRENT_DATA or lower
      setDebugInfo(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          readyState: video.readyState,
          message: 'Video not ready to play yet. Waiting...'
        }
      }));
      
      // Set a timeout to check readiness again
      setTimeout(() => {
        if (video.readyState >= 2) {
          safePlay(index);
        } else {
          setVideoErrors(prev => ({
            ...prev,
            [index]: 'Video taking too long to load. Please try again.'
          }));
          setIsLoading(prev => ({...prev, [index]: false}));
        }
      }, 2000);
      return;
    }
    
    setIsLoading(prev => ({...prev, [index]: true}));
    setVideoErrors(prev => ({...prev, [index]: null}));
    
    try {
      // Store the play promise and wait for it
      const playPromise = video.play();
      playPromiseRefs.current[index] = playPromise;
      
      // If the play method returns undefined (in some older browsers)
      if (playPromise === undefined) {
        console.log('Play promise is undefined, assuming success');
        setIsPlaying(prev => ({...prev, [index]: true}));
        setIsLoading(prev => ({...prev, [index]: false}));
        return;
      }
      
      await playPromise;
      
      // Update UI state after successful play
      setIsPlaying(prev => ({...prev, [index]: true}));
      setIsLoading(prev => ({...prev, [index]: false}));
      setDebugInfo(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          playState: 'playing',
          currentTime: video.currentTime,
          duration: video.duration
        }
      }));
    } catch (error) {
      console.error(`Play error for video ${index}:`, error);
      setVideoErrors(prev => ({
        ...prev, 
        [index]: `Playback error: ${error.message || 'Unknown error'}`
      }));
      setIsLoading(prev => ({...prev, [index]: false}));
      setIsPlaying(prev => ({...prev, [index]: false}));
      
      // Update debug info with error details
      setDebugInfo(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          playError: error.message,
          errorName: error.name,
          errorStack: error.stack
        }
      }));
    }
  };

  // Safe pause function that respects pending play promises
  const safePause = async (index) => {
    const video = videoRefs.current[index];
    if (!video) return;
    
    const playPromise = playPromiseRefs.current[index];
    
    if (playPromise !== undefined) {
      try {
        await playPromise;
        video.pause();
        setIsPlaying(prev => ({...prev, [index]: false}));
      } catch (error) {
        console.error(`Error handling play promise for video ${index}:`, error);
      }
    } else {
      video.pause();
      setIsPlaying(prev => ({...prev, [index]: false}));
    }
    
    setDebugInfo(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        playState: 'paused',
        currentTime: video.currentTime
      }
    }));
  };

  // Play a specific video while pausing others
  const playVideo = async (index) => {
    for (const [idx, video] of Object.entries(videoRefs.current)) {
      if (video && parseInt(idx) !== index) {
        await safePause(parseInt(idx));
      }
    }
    
    await safePlay(index);
  };

  // Enhanced error handling with detailed logging
  const handleVideoError = (error, index) => {
    const videoEl = error.target;
    
    // Collect comprehensive error details - safely checking for methods
    const errorDetails = {
      source: videos[index].src,
      error: videoEl.error,
      networkState: videoEl.networkState,
      readyState: videoEl.readyState,
      message: videoEl.error ? videoEl.error.message : 'Unknown error',
      code: videoEl.error ? videoEl.error.code : 'No code',
      // Add more browser-specific details
      videoWidth: videoEl.videoWidth,
      videoHeight: videoEl.videoHeight,
      currentSrc: videoEl.currentSrc,
      // Safely check if canPlayType is a function before calling it
      canPlayType: typeof videoEl.canPlayType === 'function' ? {
        mp4: videoEl.canPlayType('video/mp4'),
        webm: videoEl.canPlayType('video/webm'),
        ogg: videoEl.canPlayType('video/ogg')
      } : 'Not supported'
    };
    
    // Log detailed error for debugging
    console.error('Video loading error for index ' + index + ':', errorDetails);
    
    // Update debug info
    setDebugInfo(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        ...errorDetails,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Create user-friendly error message
    let errorMessage = 'Unknown error playing video';
    
    if (videoEl.error) {
      switch(videoEl.error.code) {
        case 1: 
          errorMessage = 'Video playback aborted by the browser';
          break;
        case 2:
          errorMessage = 'Network error. The video file might not exist or cannot be accessed.';
          break;
        case 3:
          errorMessage = 'Video format or codec not supported by your browser.';
          break;
        case 4:
          errorMessage = 'Video cannot be played due to format restrictions or codec issues.';
          break;
        default:
          errorMessage = `Error playing video: ${videoEl.error.message}`;
      }
    } else if (videoEl.networkState === 0) {
      errorMessage = 'Video has not started loading yet.';
    } else if (videoEl.networkState === 1) {
      errorMessage = 'Video is loading. Please wait...';
    } else if (videoEl.networkState === 2) {
      errorMessage = 'Video is loading. Please wait...';
    } else if (videoEl.networkState === 3) {
      errorMessage = 'Cannot load the video. Please check the file format or try a different browser.';
    }
    
    setVideoErrors(prev => ({...prev, [index]: errorMessage}));
    setIsLoading(prev => ({...prev, [index]: false}));
  };

  // Handle metadata loaded - more detailed debugging
  const handleLoadedMetadata = (e, index) => {
    const videoEl = e.target;
    
    // Safely check if canPlayType is a function before using it
    const canPlayTypeResults = typeof videoEl.canPlayType === 'function' ? {
      mp4: videoEl.canPlayType('video/mp4'),
      webm: videoEl.canPlayType('video/webm'),
      ogg: videoEl.canPlayType('video/ogg')
    } : { mp4: 'unknown', webm: 'unknown', ogg: 'unknown' };
    
    const metadataInfo = {
      source: videos[index].src,
      duration: videoEl.duration,
      videoWidth: videoEl.videoWidth,
      videoHeight: videoEl.videoHeight,
      canPlayType: canPlayTypeResults,
      readyState: videoEl.readyState,
      networkState: videoEl.networkState,
      preload: videoEl.preload,
      currentSrc: videoEl.currentSrc,
      defaultPlaybackRate: videoEl.defaultPlaybackRate
    };
    
    console.log('Video metadata loaded for index ' + index + ':', metadataInfo);
    
    setVideoReadyStates(prev => ({
      ...prev,
      [index]: videoEl.readyState
    }));
    
    setDebugInfo(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        ...metadataInfo,
        metadataLoaded: true
      }
    }));
  };

  // Handle suspend events more gracefully
  const handleSuspend = (e, index) => {
    // Suspend events are normal during video loading, so we'll just log them
    console.log(`Video ${index} loading suspended - this is normal during loading`);
    
    setDebugInfo(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        suspendEvent: true,
        timestamp: new Date().toISOString()
      }
    }));
    
    // We don't need to take any action or show errors on suspend
  };

  // Toggle play/pause for a specific video
  const togglePlayPause = async (index, e) => {
    e.stopPropagation();
    
    if (isPlaying[index]) {
      await safePause(index);
    } else {
      await playVideo(index);
    }
  };

  // Toggle mute for all videos
  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Handle when a video is playable
  const handleCanPlay = (e, index) => {
    const videoEl = e.target;
    console.log(`Video ${index} can play:`, {
      readyState: videoEl.readyState,
      networkState: videoEl.networkState,
      duration: videoEl.duration,
      src: videoEl.currentSrc
    });
    
    setDebugInfo(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        canPlay: true,
        readyState: videoEl.readyState,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Clear any loading state
    setIsLoading(prev => ({...prev, [index]: false}));
  };

  // Add this useEffect to your Highlights.js component
  useEffect(() => {
    // Auto-play first video with a slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (videos.length > 0) {
        console.log("Attempting to auto-play first video");
        playVideo(0);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle video selection
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

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={closeVideoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <video controls autoPlay className="modal-video">
              <source src={selectedVideo.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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