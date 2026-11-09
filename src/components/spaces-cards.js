// Spaces card hover (SPACES_HOVER): the photo grows inside the card, the name moves up and fades
// out while its copy comes in from below, and the other cards turn black and white (their grey
// photo copies fade in). Leaving plays it backwards; moving to another card hands the colour over.

import { gsap } from 'gsap'
import { REDUCED_MOTION_QUERY, SPACES_HOVER } from '../animations/config.js'
import { lineHeightOf } from '../animations/letters.js'

export function initSpacesCards() {
  const cards = [...document.querySelectorAll('.spaces__card')]
  if (!cards.length) return

  const { duration, ease, photoScale, textY } = SPACES_HOVER
  const instant = () => window.matchMedia(REDUCED_MOTION_QUERY).matches

  const hovers = cards.map((card) => {
    const name = card.querySelector('.spaces__name')
    const next = card.querySelector('.spaces__name--next')
    const shift = () => textY * lineHeightOf(name)
    const tl = gsap.timeline({ paused: true, defaults: { duration, ease } })
    tl.to(card.querySelector('.spaces__photo'), { scale: photoScale }, 0)
    tl.fromTo(name, { y: 0, opacity: 1 }, { y: () => -shift(), opacity: 0 }, 0)
    tl.fromTo(next, { y: shift, opacity: 0 }, { y: 0, opacity: 1 }, 0)
    return tl
  })
  const monos = cards.map((card) => card.querySelector('.spaces__image--mono'))

  // Grey everywhere but the hovered card; no card hovered: all in colour
  const colourOnly = (index) =>
    monos.forEach((mono, i) => {
      const opacity = index === null || i === index ? 0 : 1
      if (instant()) gsap.set(mono, { opacity, overwrite: true })
      else gsap.to(mono, { opacity, duration, ease, overwrite: true })
    })

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
