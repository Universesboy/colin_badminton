import React from 'react';
import '../App.css';
import { Button } from './Button';
import './HeroSection.css';


function HeroSection() {
  return (
    <div className='hero-container'>
      <video src='/videos/video-1.mp4' autoPlay loop muted />
      <h1>BAMINTON JOURNEY</h1>
      <p>What are you waiting for?</p>
      <div className='hero-btns'>
        <Button
          path='/highlights'
          className='btns'
          buttonStyle='btn--primary'
          buttonSize='btn--large'
        >
          WATCH THE HIGHLIGHTS <i className='far fa-play-circle' />
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
      </div>
    </div>
  );
}

export default HeroSection;