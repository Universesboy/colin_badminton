import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load page components
const Home = lazy(() => import('./components/pages/Home'));
const Highlights = lazy(() => import('./components/pages/Highlights'));
const Training = lazy(() => import('./components/pages/Training'));
const Achievements = lazy(() => import('./components/pages/Achievements'));
const Contact = lazy(() => import('./components/pages/Contact'));
const Footer = lazy(() => import('./components/Footer'));

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/highlights' element={<Highlights />} />
            <Route path='/training' element={<Training />} />
            <Route path='/achievements' element={<Achievements />} />
            <Route path='/contact' element={<Contact />} />
          </Routes>
          <Footer />
        </Suspense>
      </Router>
    </>
  );
}

export default App;