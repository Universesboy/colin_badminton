import React, { useEffect, useRef, useState } from 'react';

// Reveals its children once when they scroll into view.
// variant 'fade' slides content up; 'mask' wipes an image frame open.
function AnimatedSection({ as: Tag = 'div', variant = 'fade', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const base = variant === 'mask' ? 'reveal-mask' : 'reveal';
  return (
    <Tag
      ref={ref}
      className={`${base} ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default AnimatedSection;
