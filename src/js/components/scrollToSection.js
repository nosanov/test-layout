function scrollToSection() {
  const btn = document.querySelector('.js-scroll-to');

  if (btn) {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.getAttribute('data-href'));

      if (target) {
        const offset = target.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({
          top: offset,
          behaviour: 'smooth'
      });
      }
    });
  }
}

export default scrollToSection;