import React, { useState } from 'react';
import './Training.css';

function Training() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Training video data
  const trainingVideos = [
    {
      id: 1,
      src: '/videos/footworks.mp4',
      poster: '/videos/thumbnails/footworks.jpg',
      title: 'Footwork Drills',
      description: 'Essential movement patterns for court coverage',
      orientation: 'landscape'
    },
    {
      id: 2,
      src: '/videos/colin.vs.mattew1.mp4',
      poster: '/videos/thumbnails/colin.vs.mattew1.jpg',
      title: 'Smash Technique',
      description: 'Power and precision in overhead attacks',
      orientation: 'landscape'
    },
    {
      id: 3,
      src: '/videos/colin.vs.mj2.mp4',
      poster: '/videos/thumbnails/colin.vs.mj2.jpg',
      title: 'Defensive Skills',
      description: 'Blocking and returning powerful shots',
      orientation: 'landscape'
    },
    {
      id: 4,
      src: '/videos/colin.vs.mj3.mp4',
      poster: '/videos/thumbnails/colin.vs.mj3.jpg',
      title: 'Net Play',
      description: 'Control and finesse at the front court',
      orientation: 'landscape'
    },
    {
      id: 5,
      src: '/videos/colin.vs.mj5.mp4',
      poster: '/videos/thumbnails/colin.vs.mj5.jpg',
      title: 'Fitness Conditioning',
      description: 'Building stamina and strength for badminton',
      orientation: 'landscape'
    }
  ];

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

  return (
    <div className="training-container">
      <div className="training-hero">
        <h1>Training Programs</h1>
        <p>Professional techniques and drills to elevate your game</p>
      </div>

      <div className="training-intro">
        <div className="intro-content">
          <h2>My Training Philosophy</h2>
          <p>
            My approach to badminton training combines technical precision, tactical awareness, 
            and physical conditioning. Each session is designed to develop specific skills while 
            building overall game understanding and court presence.
          </p>
          <p>
            Whether you're a beginner looking to master the basics or an advanced player refining 
            your competitive edge, these training videos demonstrate the techniques and drills 
            I use with students at all levels.
          </p>
        </div>
      </div>

      <div className="training-video-section">
        <h2>Training Videos</h2>
        <div className="video-grid">
          {trainingVideos.map((video) => (
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
              </div>
              <div className="video-caption">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="training-methodology">
        <h2>Training Methodology</h2>
        <div className="methodology-grid">
          <div className="methodology-item">
            <i className="fas fa-running"></i>
            <h3>Technical Foundation</h3>
            <p>Mastering proper technique is essential before building speed and power.</p>
          </div>
          <div className="methodology-item">
            <i className="fas fa-chess"></i>
            <h3>Tactical Awareness</h3>
            <p>Understanding game strategy and developing court awareness and decision-making.</p>
          </div>
          <div className="methodology-item">
            <i className="fas fa-dumbbell"></i>
            <h3>Physical Conditioning</h3>
            <p>Building the strength, speed, and endurance needed for competitive play.</p>
          </div>
          <div className="methodology-item">
            <i className="fas fa-brain"></i>
            <h3>Mental Toughness</h3>
            <p>Developing focus, resilience, and competitive mindset for match play.</p>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Training;
