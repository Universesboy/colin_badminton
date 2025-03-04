import React from 'react';
import './Footer.css';
import { Button } from './Button';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <div className='footer-container'>
      <section className='footer-subscription'>
        <p className='footer-subscription-heading'>
          Subscribe to our newsletter for training tips and event updates
        </p>
        <p className='footer-subscription-text'>
          You can unsubscribe at any time.
        </p>
        <div className='input-areas'>
          <form>
            <input
              className='footer-input'
              name='email'
              type='email'
              placeholder='Your Email'
            />
            <Button buttonStyle='btn--outline'>Subscribe</Button>
          </form>
        </div>
      </section>
      <div className='footer-links'>
        <div className='footer-link-wrapper'>
          <div className='footer-link-items'>
            <h2>About Us</h2>
            <Link to='/training'>Training Philosophy</Link>
            <Link to='/achievements'>Achievements</Link>
          </div>
          <div className='footer-link-items'>
            <h2>Contact Us</h2>
            <a href='https://wa.me/6476556636' target='_blank' rel='noopener noreferrer'>WhatsApp: +647 655 6636</a>
            <a href='weixin://dl/chat?ColinZhouzky' target='_blank' rel='noopener noreferrer'>WeChat: ColinZhouzky</a>
            <a href='mailto:zhoukeyu123456@gmail.com'>Email: zhoukeyu123456@gmail.com</a>
            <Link to='/contact'>Contact Page</Link>
          </div>
        </div>
      </div>
      <section className='social-media'>
        <div className='social-media-wrap'>
          <div className='footer-logo'>
            <Link to='/' className='social-logo'>
              Colin Badminton
              <i className='fab fa-typo3' />
            </Link>
          </div>
          <small className='website-rights'>Colin Badminton © 2025</small>
          <div className='social-icons'>
            <Link
              className='social-icon-link instagram'
              to='https://www.instagram.com/zhou.keyu.5?igsh=MWxtMnkwaTQ2bHRlZQ%3D%3D&utm_source=qr'
              target='_blank'
              aria-label='Instagram'
            >
              <i className='fab fa-instagram' />
            </Link>
            <Link
              className='social-icon-link youtube'
              to='https://www.youtube.com/@zhoukeyu9105'
              target='_blank'
              aria-label='Youtube'
            >
              <i className='fab fa-youtube' />
            </Link>
            <Link
              className='social-icon-link x'
              to='https://x.com/Colin_Tesla999T/likes'
              target='_blank'
              aria-label='X'
            >
              <i className='fab fa-x' />
            </Link>
            <a
              className='social-icon-link whatsapp'
              href='https://wa.me/6476556636'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='WhatsApp'
            >
              <i className='fab fa-whatsapp' />
            </a>
            <a
              className='social-icon-link wechat'
              href='weixin://dl/chat?ColinZhouzky'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='WeChat'
            >
              <i className='fab fa-weixin' />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Footer;