window.addEventListener('load', () => {
  // console.warn('loaded');
});

document.addEventListener('DOMContentLoaded', () => {
  const imgObserver = new IntersectionObserver((entries, self) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        lazyLoad(entry.target);
        self.unobserve(entry.target);
      }
    });
  });
  document.querySelectorAll('.lazy-picture').forEach((picture) => {
    imgObserver.observe(picture);
  });

  const lazyLoad = (picture) => {
    const img = picture.querySelector('img') || picture;
    const sources = picture.querySelectorAll('source');
  
    sources.forEach((source) => {
      source.srcset = source.dataset.srcset;
      source.removeAttribute('data-srcset');
    });
    if (img) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  }
});