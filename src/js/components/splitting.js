import {gsap} from 'gsap';
import Splitting from "splitting";

function initSplitting() {
    Splitting({
        target: '[data-splitting="chars"]',
        by: "chars"
    });

    const wordsTl = gsap.timeline();
    const words = document.querySelectorAll('.char');
    wordsTl.from(words, {
        duration: 0.2,
        ease: 'Power3.easeOut',
        opacity: 0,
        y: function() {
            const value = Math.max(document.documentElement.clientWidth, window.innerWidth || 50);
            return (50 * value / 1920);
        },
        stagger: 0.02
    });
}

export default initSplitting;