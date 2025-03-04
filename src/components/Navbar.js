import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'
import { Button } from './Button'
import { ThemeContext } from '../context/ThemeContext'

function Navbar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const showButton = () => {
    if(window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  }

  useEffect(() => {
    showButton();
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  window.addEventListener('resize', showButton);

  return (
    <>
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
         <Link to="/" className="navbar-logo" onClick={closeMobileMenu}> 
         Colin Badminton <i className='fab fa-typo3'></i>
         </Link>  
        <div className='menu-icon' onClick={handleClick}>
          <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
          <li className='nav-item'>
            <Link to='/' className='nav-links' onClick={handleClick}>
              HOME
            </Link>
          </li>
          <li className='nav-item'>
            <Link to='/Highlights' className='nav-links' onClick={handleClick}>
              HIGHLIGHTS
            </Link>
          </li>
          <li className='nav-item'>
            <Link to='/Training' className='nav-links' onClick={handleClick}>
              TRAINING
            </Link>
          </li>
          <li className='nav-item'>
            <Link to='/Achievements' className='nav-links' onClick={handleClick}>
              ACHIEVEMENTS
            </Link>
          </li>
          <li className='nav-item'>
            <Link to='/Contact' className='nav-links' onClick={handleClick}>
              CONTACT
            </Link>
          </li>
        </ul>
        
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? <i className="fas fa-sun" /> : <i className="fas fa-moon" />}
        </button>
        </div>
    </nav>

    </>
  )
}

export default Navbar
