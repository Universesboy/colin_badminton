import React, { useState } from 'react';
import './Achievements.css';

function Achievements() {
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryImages = [
    {
      src: require('../assets/national_champion.jpg'),
      caption: '🏆 CCAA National Champion',
      description: '2023 Men\'s Singles National Champion'
    },
    {
      src: require('../assets/ocaa_awards.jpg'),
      caption: '🏅 OCAA Awards',
      description: 'Player of the Year & Regional All-Star Awards'
    },
    {
      src: require('../assets/champion_flag.jpg'),
      caption: '🎖️ Championship Banner',
      description: 'CCAA National Championship Victory Celebration'
    },
    {
      src: require('../assets/provincial_jump_smash.jpg'),
      caption: '💫 Tournament Action',
      description: 'Jump Smash at National Championships'
    },
    {
      src: require('../assets/frontcourt.jpg'),
      caption: '🏸 Match Play',
      description: 'Competitive Match Performance'
    },
    {
      src: require('../assets/ocaa.jpg'),
      caption: '🌟 OCAA Ceremony',
      description: 'Ontario Colleges Athletic Association Awards'
    },
    {
      src: require('../assets/colin_poster.jpg'),
      caption: '👨‍🏫 Professional Profile',
      description: 'Senior Badminton Coach & National Champion',
      featured: true
    }
  ];

  const handleImageClick = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="achievements-container">
      <div className="achievements-hero">
        <h1>Achievements & Experience</h1>
      </div>
      
      <div className="achievements-content">
        <div className="achievements-section">
          <h2>Competition Achievements</h2>
          <div className="achievement-cards">
            <div className="achievement-card">
              <i className="fas fa-trophy"></i>
              <h3>CCAA Champion</h3>
              <p>Men's Singles Champion in Canadian Collegiate Athletic Association</p>
            </div>
            <div className="achievement-card">
              <i className="fas fa-medal"></i>
              <h3>OCAA Champion</h3>
              <p>Men's Singles Champion in Ontario Collegiate Athletic Association</p>
            </div>
            <div className="achievement-card">
              <i className="fas fa-star"></i>
              <h3>Provincial Team Member</h3>
              <p>Former Sichuan Provincial Team Player</p>
            </div>
            <div className="achievement-card">
              <i className="fas fa-award"></i>
              <h3>Youth Champion</h3>
              <p>Multiple-time Sichuan Province Youth Badminton Champion</p>
            </div>
          </div>
        </div>

        <div className="achievements-section">
          <h2>Coaching Experience</h2>
          <div className="experience-timeline">
            <div className="experience-item">
              <h3>Professional Coaching in Canada</h3>
              <p>Over 5 years of coaching experience</p>
              <p>Trained 10+ Canadian National level players (U13-U19)</p>
            </div>
            <div className="experience-item">
              <h3>High-Level Club Coach</h3>
              <p>Senior coach at provincial badminton clubs</p>
            </div>
            <div className="experience-item">
              <h3>Olympic Training Experience</h3>
              <p>Participated in training with multiple Canadian Olympic athletes</p>
            </div>
          </div>
        </div>

        <div className="achievements-section">
          <h2>Teaching Philosophy</h2>
          <div className="philosophy-cards">
            <div className="philosophy-card">
              <i className="fas fa-language"></i>
              <h3>Bilingual Instruction</h3>
              <p>Professional coaching in both English and Chinese</p>
            </div>
            <div className="philosophy-card">
              <i className="fas fa-search"></i>
              <h3>Detailed Analysis</h3>
              <p>Thorough analysis of student strengths and areas for improvement</p>
            </div>
            <div className="philosophy-card">
              <i className="fas fa-comments"></i>
              <h3>Continuous Support</h3>
              <p>Post-lesson feedback and development planning</p>
            </div>
          </div>
        </div>

        <div className="achievements-section gallery-section">
          <h2>Achievement Gallery</h2>
          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <div 
                key={index} 
                className={`gallery-item ${image.featured ? 'featured-item' : ''}`}
                onClick={() => handleImageClick(image)}
              >
                <div className="image-wrapper">
                  <img src={image.src} alt={image.caption} loading="lazy" />
                </div>
                <div className="gallery-caption">
                  <h3>{image.caption}</h3>
                  <p>{image.description}</p>
                </div>
                <div className="hover-overlay">
                  <span>Click to enlarge</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Modal with Zoom */}
      {selectedImage && (
        <div className="image-modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-image-container">
              <img src={selectedImage.src} alt={selectedImage.caption} />
            </div>
            <div className="modal-caption">
              <h3>{selectedImage.caption}</h3>
              <p>{selectedImage.description}</p>
            </div>
            <button className="close-button" onClick={handleCloseModal}>×</button>
            <button className="prev-button" onClick={(e) => {
              e.stopPropagation();
              const currentIndex = galleryImages.findIndex(img => img.src === selectedImage.src);
              const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
              setSelectedImage(galleryImages[prevIndex]);
            }}>❮</button>
            <button className="next-button" onClick={(e) => {
              e.stopPropagation();
              const currentIndex = galleryImages.findIndex(img => img.src === selectedImage.src);
              const nextIndex = (currentIndex + 1) % galleryImages.length;
              setSelectedImage(galleryImages[nextIndex]);
            }}>❯</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Achievements;
