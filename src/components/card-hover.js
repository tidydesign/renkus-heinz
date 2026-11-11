// Hover of a set of photo cards (Spaces, Products): plays the hovered card's own timeline and turns
// the other cards black and white (their grey photo copies fade in). Leaving plays it backwards;
// moving to another card hands the colour over. Reduced motion: the states switch instantly.

import { gsap } from 'gsap'
import { REDUCED_MOTION_QUERY } from '../animations/config.js'

// onActive(index or null, instant) follows the hovered card, for anything else that changes with it
export const initCardHover = (cards, hovers, monos, { duration, ease }, onActive) => {
  const instant = () => window.matchMedia(REDUCED_MOTION_QUERY).matches

  // Grey everywhere but the hovered card; no card hovered: all in colour
  const colourOnly = (index) => {
    monos.forEach((mono, i) => {
      const opacity = index === null || i === index ? 0 : 1
      if (instant()) gsap.set(mono, { opacity, overwrite: true })
      else gsap.to(mono, { opacity, duration, ease, overwrite: true })
    })
    onActive?.(index, instant())
  }

  let active = null
  const enter = (index) => {
    active = index
    instant() ? hovers[index].progress(1).pause() : hovers[index].play()
    colourOnly(index)
  }
  const leave = (index) => {
    instant() ? hovers[index].progress(0).pause() : hovers[index].reverse()
    // Straight on to another card: its enter has set the colours already
    if (active === index) {
      active = null
      colourOnly(null)
    }
  }

  cards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => enter(index))
    card.addEventListener('mouseleave', () => leave(index))
    card.addEventListener('focus', () => card.matches(':focus-visible') && enter(index))
    card.addEventListener('blur', () => leave(index))
  })
}
