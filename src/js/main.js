import initLazyLoad from './components/lazyload';
import scrollToSection from './components/scrollToSection';
import initParallaxAnimations from './components/parallaxAnimations';
import initHeader from './components/header';
import initTabs from './components/tabs';
// import initSplitting from './components/splitting';

window.addEventListener('load', () => {
    // console.warn('loaded');
});

document.addEventListener('DOMContentLoaded', () => {
    initLazyLoad();
    scrollToSection();
    initParallaxAnimations();
    initHeader();
    initTabs();
    // initSplitting();
});