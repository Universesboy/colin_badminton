const scrollToTop = (offset = 0) => {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  
  if (c > 0) {
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
    });
  }
};

export { scrollToTop }; 