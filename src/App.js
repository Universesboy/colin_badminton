
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';
import Home from './components/pages/Home';
import Highlights from './components/pages/Highlights';
import Training from './components/pages/Training';
import Achievements from './components/pages/Achievements';
import Contact from './components/pages/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/training' element={<Training />} />
          <Route path='/achievements' element={<Achievements />} />
          <Route path='/highlights' element={<Highlights />} />
          <Route path='/contact' element={<Contact />} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;