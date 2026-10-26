import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';
import Icon from './Icon';
import Logo from './Logo';
import { ThemeContext } from '../context/ThemeContext';

const LINKS = [
  { to: '/highlights', label: 'Highlights' },
  { to: '/training', label: 'Training' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/contact', label: 'Contact' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('scroll-locked');
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('scroll-locked');
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className={`nav ${scrolled || open ? 'nav--solid' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="nav__inner container">
        <Link to="/" className="nav__brand">
          <Logo />
        </Link>

        <nav id="site-menu" className="nav__menu" aria-label="Main">
          <ul>
            {LINKS.map((link, i) => (
              <li key={link.to} style={{ '--i': i }}>
                <NavLink to={link.to} className="nav__link">
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav__actions">
          <button
            type="button"
            className="nav__icon-btn"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Icon name={darkMode ? 'sun' : 'moon'} size={20} />
          </button>
          <Link to="/contact" className="btn nav__cta">
            Train with Colin
          </Link>
          <button
            type="button"
            className="nav__icon-btn nav__toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
