import React from 'react';
import '../App.css';
import { Button } from './Button';
import './HeroSection.css';


function HeroSection() {
  return (
    <div className='hero-container'>
      <video src='/videos/video-1.mp4' autoPlay loop muted />
      <div className="hero-overlay"></div>
      <h1>COLIN BADMINTON</h1>
      <p>National Champion & Professional Coach</p>
      <div className='hero-btns'>
        <Button
          className='btns'
          buttonStyle='btn--primary'
          buttonSize='btn--large'
          path='/highlights'
        >
          WATCH HIGHLIGHTS <i className='far fa-play-circle' />
        </Button>
        <Button
          path='/training'
          className='btns'
          buttonStyle='btn--primary'
          buttonSize='btn--large'
        >
          TRAINING VIDEO <i className='far fa-play-circle' />
        </Button>
        <Button
          path='/achievements'
          className='btns'
          buttonStyle='btn--primary'
          buttonSize='btn--large'
        >
          ACHIVEMENTS 
        </Button>
        <Button
          path='/contact'
          className='btns'
          buttonStyle='btn--primary'
          buttonSize='btn--large'
        >
          CONTACT  
        </Button>
      </div>
      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <div>
          <span className="scroll-arrow"></span>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;