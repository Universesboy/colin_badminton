import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// Shared UI styles load before component styles so components can refine them
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load page components
const Home = lazy(() => import('./components/pages/Home'));
const Highlights = lazy(() => import('./components/pages/Highlights'));
const Training = lazy(() => import('./components/pages/Training'));
const Achievements = lazy(() => import('./components/pages/Achievements'));
const Contact = lazy(() => import('./components/pages/Contact'));

// Start each new page at the top, as a normal site navigation would
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// Re-keys the page wrapper on navigation so the new page rises in
function RouteView({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="route-enter">
      {children}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex="-1">
        <Suspense fallback={<div className="route-fallback" aria-hidden="true" />}>
          <RouteView>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/highlights" element={<Highlights />} />
            <Route path="/training" element={<Training />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Routes>
          </RouteView>
        </Suspense>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
