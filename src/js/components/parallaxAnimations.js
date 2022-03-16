import {gsap} from 'gsap';
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function initParallaxAnimations() {
    const els = document.querySelectorAll('[data-parallax="true"]'),
        multiplier = 20,
        breakpointDesktop = 1440;

    els.forEach((el, index) => {
        const elTl = gsap.timeline();

        // const width = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
        elTl.to(el, {
            yPercent: index * (Math.random() - 0.5) * multiplier
        });

        ScrollTrigger.create({
            animation: elTl,
            trigger: el,
            start: 'top bottom',
            scrub: true
        });
    });
}

export default initParallaxAnimations;