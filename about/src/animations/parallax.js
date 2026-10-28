// Parallax.
//
// 1. Backgrounds (.parallax): while a section passes through the viewport, its photo layer moves
//    from -offset to +offset of the section height (offset = --parallax-offset, 20%), so the photo
//    scrolls slower than the page. The layer is taller than the section by the same amount above
//    and below (see parallax.css), so its edges never show.
//
// 2. Elements ([data-parallax-speed]): cards and text drift against the page while they pass
//    through the viewport. Total travel = speed × --parallax-strength × scroll distance of the
//    pass (viewport height + element height), so the effect reads the same on any screen.
//    Different speeds on neighbouring cards make them move relative to each other.
//    An optional --parallax-scale on the element softens or boosts it per breakpoint.
//    The shift is 0 when the element is centred in the viewport, so centred layouts stay centred.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PARALLAX, REDUCED_MOTION_QUERY } from './config.js'

gsap.registerPlugin(ScrollTrigger)

const cssLength = (el, name) => parseFloat(getComputedStyle(el).getPropertyValue(name))

function initBackgrounds() {
  document.querySelectorAll('.parallax').forEach((layer) => {
    const section = layer.closest('section') || layer.parentElement
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
  const elements = [...document.querySelectorAll('[data-parallax-speed]')]
  if (!elements.length) return

  // ScrollTrigger measures positions on refresh. Reset the parallax shift first, so every
  // trigger (this one and others, e.g. the text fill) is measured from the real layout.
  ScrollTrigger.addEventListener('refreshInit', () => gsap.set(elements, { y: 0 }))

  elements.forEach((el) => {
    const speed = parseFloat(el.dataset.parallaxSpeed) || 0
    const setY = gsap.quickSetter(el, 'y', 'px')
    let travel = 0

    // Shift is 0 when the element is centred in the viewport: below its place before, above after
    const render = (self) => setY(travel * (0.5 - self.progress))

    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onRefresh: (self) => {
        // Strength is responsive (CSS token) and sizes change, so travel is re-read here
        travel =
          speed *
          cssLength(el, '--parallax-strength') *
          (cssLength(el, '--parallax-scale') || 1) *
          (window.innerHeight + el.offsetHeight)
        render(self)
      },
      onUpdate: render,
    })
  })
}

export function initParallax() {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return
  initBackgrounds()
  initElements()
}
