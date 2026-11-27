import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import Icon from './Icon';
import Logo from './Logo';
import { CourtLines } from './PageHeader';
import { contact, socials } from '../data/site';

function Footer() {
  return (
    <footer className="footer section--stage">
      <div className="container">
        <div className="footer__cta">
          <div className="footer__court" aria-hidden="true">
            <CourtLines />
          </div>
          <p className="eyebrow">Coaching in English &amp; Chinese</p>
          <h2 className="footer__title">
            Train with a <span className="mark">national champion</span>
          </h2>
          <div className="footer__cta-actions">
            <Link to="/contact" className="btn">
              Get in touch <Icon name="arrow" />
            </Link>
            <a href={contact.whatsapp} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" /> WhatsApp
            </a>
          </div>
        </div>

        <div className="footer__grid">
          <div className="footer__brand">
            <Logo />
            <p className="muted">2023 CCAA Men's Singles National Champion and senior badminton coach.</p>
          </div>

          <nav className="footer__col" aria-label="Footer">
            <h3>Explore</h3>
            <Link to="/highlights">Highlights</Link>
            <Link to="/training">Training</Link>
            <Link to="/achievements">Achievements</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="footer__col">
            <h3>Contact</h3>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
            <span>WeChat: {contact.wechatId}</span>
          </div>

          <div className="footer__col">
            <h3>Follow</h3>
            <div className="footer__socials">
              {socials.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name}>
                  <Icon name={s.icon} size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__base">
          <small>© {new Date().getFullYear()} Colin Badminton · Colin Zhou</small>
          <small>colinbadminton.com</small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
