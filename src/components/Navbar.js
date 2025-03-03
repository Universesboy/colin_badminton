import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'
import { Button } from './Button'

function Navbar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

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
  }, []);

  window.addEventListener('resize', showButton);

  return (
    <>
    <nav className="navbar">
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
        

        </div>
    </nav>

    </>
  )
}

export default Navbar
