// Parallax.
//
// 1. Backgrounds (.parallax): while a section passes through the viewport, its photo layer moves
//    from -offset to +offset of the section height (offset = --parallax-offset, 20%), so the photo
//    scrolls slower than the page. The layer is taller than the section by the same amount above
//    and below (see parallax.css), so its edges never show.
//
// 2. Elements ([data-parallax-speed]): cards and text drift against the page while they pass
//    through the viewport. Travel = speed × --parallax-amplitude. Different speeds on neighbouring
//    cards make them move slightly relative to each other.
//    data-parallax-mode="lift" starts from 0 and only moves up (by twice the travel) — used where
//    another scroll animation measures the element's position, so the measurement is not shifted.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PARALLAX, REDUCED_MOTION_QUERY } from './config.js'

gsap.registerPlugin(ScrollTrigger)

const cssLength = (el, name) => parseFloat(getComputedStyle(el).getPropertyValue(name))

function initBackgrounds() {
  document.querySelectorAll('.parallax').forEach((layer) => {
    const section = layer.parentElement
    // "20%" → 0.2 of the section height
    const offset = () => (cssLength(layer, '--parallax-offset') / 100) * section.offsetHeight

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

function initElements() {
  document.querySelectorAll('[data-parallax-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallaxSpeed) || 0
    const lift = el.dataset.parallaxMode === 'lift'
    // Amplitude is responsive (CSS token), so it is re-read on every refresh
    const travel = () => speed * cssLength(el, '--parallax-amplitude')

    gsap.fromTo(
      el,
      { y: () => (lift ? 0 : travel()) },
      {
        y: () => (lift ? -2 * travel() : -travel()),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: PARALLAX.scrub,
          invalidateOnRefresh: true,
        },
      },
    )
  })
}

export function initParallax() {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return
  initBackgrounds()
  initElements()
}
