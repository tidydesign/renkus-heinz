// Parallax backgrounds: while a section passes through the viewport, its photo layer moves
// from -offset to +offset of the section height (offset = --parallax-offset, 20%), so the photo
// scrolls slower than the page. The layer is taller than the section by the same amount above
// and below (see parallax.css), so its edges never show.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PARALLAX, REDUCED_MOTION_QUERY } from './config.js'

gsap.registerPlugin(ScrollTrigger)

export function initParallax() {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

  document.querySelectorAll('.parallax').forEach((layer) => {
    const section = layer.parentElement
    // "20%" → 0.2 of the section height
    const offset = () =>
      (parseFloat(getComputedStyle(layer).getPropertyValue('--parallax-offset')) / 100) *
      section.offsetHeight

    gsap.fromTo(
      layer,
      { y: () => -offset() },
      {
        y: () => offset(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: PARALLAX.scrub,
          invalidateOnRefresh: true,
        },
      },
    )
  })
}
