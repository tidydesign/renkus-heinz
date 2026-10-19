// Header: hides on scroll down, shows on scroll up.

import { gsap } from 'gsap'
import { HEADER, REDUCED_MOTION_QUERY } from './config.js'

export function initHeader() {
  const header = document.querySelector('.header')
  if (!header) return

  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY)
  let lastY = window.scrollY
  let isHidden = false

  const setHidden = (hidden) => {
    if (hidden === isHidden) return
    isHidden = hidden
    gsap.to(header, {
      yPercent: hidden ? -100 : 0,
      duration: reducedMotion.matches ? 0 : HEADER.duration,
      ease: HEADER.ease,
      overwrite: true,
    })
  }

  const onScroll = () => {
    const y = Math.max(0, window.scrollY)

    // Always visible at the top of the page
    if (y <= header.offsetHeight) {
      setHidden(false)
      lastY = y
      return
    }

    const delta = y - lastY
    if (Math.abs(delta) < HEADER.tolerance) return

    // Keep the header visible while keyboard focus is inside it
    setHidden(delta > 0 && !header.contains(document.activeElement))
    lastY = y
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  header.addEventListener('focusin', () => setHidden(false))
}
