// Header: hides on scroll down, shows on scroll up. Transparent on the Hero, with a white
// background below it.

import { gsap } from 'gsap'
import { HEADER, REDUCED_MOTION_QUERY } from './config.js'

export function initHeader() {
  const header = document.querySelector('.header')
  if (!header) return

  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY)
  let lastY = window.scrollY
  let isHidden = false
  let isSolid = false

  const setSolid = (solid) => {
    if (solid === isSolid) return
    isSolid = solid
    gsap.to(header, {
      '--solid': solid ? 1 : 0,
      duration: reducedMotion.matches ? 0 : HEADER.duration,
      ease: HEADER.ease,
      overwrite: 'auto',
    })
  }

  const setHidden = (hidden) => {
    if (hidden === isHidden) return
    isHidden = hidden
    gsap.to(header, {
      yPercent: hidden ? -100 : 0,
      duration: reducedMotion.matches ? 0 : HEADER.duration,
      ease: HEADER.ease,
      overwrite: 'auto',
    })
  }

  const onScroll = () => {
    const y = Math.max(0, window.scrollY)
    setSolid(y > header.offsetHeight)

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

  // A reload may restore a scrolled page
  setSolid(window.scrollY > header.offsetHeight)
  window.addEventListener('scroll', onScroll, { passive: true })
  header.addEventListener('focusin', () => setHidden(false))
}
