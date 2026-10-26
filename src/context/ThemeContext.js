import React, { createContext, useState, useCallback } from 'react';

export const ThemeContext = createContext();

// The initial class is set by an inline script in public/index.html so the
// page never flashes the wrong theme. Without a saved choice it follows the
// system preference.
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark-mode')
  );

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark-mode', next);
      try {
        localStorage.setItem('darkMode', String(next));
      } catch (e) {
        // Storage can be unavailable (private mode); the toggle still works for this visit.
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
