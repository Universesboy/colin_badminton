import React, { useEffect, useRef, useState } from 'react';
import './AnimatedSection.css';

function AnimatedSection({ children, animation = 'fade-up' }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      ref={sectionRef} 
      className={`animated-section ${animation} ${isVisible ? 'visible' : ''}`}
    >
      {children}
    </div>
  );
}

export default AnimatedSection;
