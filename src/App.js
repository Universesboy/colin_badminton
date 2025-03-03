import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';
import Home from './components/pages/Home';
import Highlights from './components/pages/Highlights';
import Training from './components/pages/Training';
import Achievements from './components/pages/Achievements';
import Contact from './components/pages/Contact';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <>
          <Navbar />
          <Home />
        </>
      ),
    },
    {
      path: '/highlights',
      element: (
        <>
          <Navbar />
          <Highlights />
        </>
      ),
    },
    {
      path: '/training',
      element: (
        <>
          <Navbar />
          <Training />
        </>
      ),
    },
    {
      path: '/achievements',
      element: (
        <>
          <Navbar />
          <Achievements />
        </>
      ),
    },
    {
      path: '/contact',
      element: (
        <>
          <Navbar />
          <Contact />
        </>
      ),
    }
  ], {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  });

  return <RouterProvider router={router} />;
}

export default App;